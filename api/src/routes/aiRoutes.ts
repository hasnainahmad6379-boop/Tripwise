import express from "express";
import ai from "../lib/gemini";
import { aiResponseSchema, aiRequestSchema } from "../validators/aiValidators";
import {
  searchPlacesTool,
  getWeatherTool,
  estimateBudgetTool,
} from "../tools/geminiTools";
import { searchPlaces, findPlaceCoordinates } from "../tools/searchPlaces";
import { getWeather } from "../tools/getWeather";
import {
  itinerarySchema,
  proposedDayChangeSchema,
  proposedDayChangeValidator,
} from "../tools/itinerarySchema";
import { estimateBudget } from "../tools/estimateBudget";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/credits", async (req, res) => {
  try {
    const creditEntries = await prisma.creditLedger.findMany({
      where: {
        userId: req.userId,
      },
      select: {
        amount: true,
      },
    });

    const creditBalance = creditEntries.reduce(
      (balance, entry) => balance + entry.amount,
      0,
    );

    return res.json({ credits: creditBalance });
  } catch (error) {
    console.error("Fetch credits error:", error);

    return res.status(500).json({
      message: "Failed to fetch credit balance",
    });
  }
});

router.post("/generate-trip", async (req, res) => {
  try {
    const result = aiRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    const trip = result.data;

    const creditEntries = await prisma.creditLedger.findMany({
      where: {
        userId: req.userId,
      },
    });

    const creditBalance = creditEntries.reduce((balance, entry) => {
      return balance + entry.amount;
    }, 0);

    if (creditBalance <= 0) {
      return res.status(403).json({
        message: "No credits remaining",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(
      `data: ${JSON.stringify({ message: "Starting trip generation..." })}\n\n`,
    );

    const prompt = `Generate a trip plan for ${trip.destination} from ${trip.startDate} to ${trip.endDate} with a budget of ${trip.budget}. The traveler is interested in ${trip.interests}.

Create exactly one itinerary day for every date from the start date through the end date, inclusive. Do not add or remove any days. Start dayNumber at 1 and increase it by 1 for each day. Use the exact dates provided.

For each day, provide a title and a list of activities that match the traveler's interests and budget.

Before creating the itinerary, call the search_places tool using one supported interest category at a time: "history", "food", or "nature". Choose the category most relevant to the traveler's interests. If the search returns no places, try another relevant supported category.

Use the places returned by search_places as the source of truth for real locations and coordinates. For each activity based on a returned place, use its exact place name and location. Every activity must include numeric latitude and longitude copied exactly from that same returned place. Never invent, estimate, or modify coordinates. If no suitable place with coordinates is available, search again before generating the itinerary.

Use the estimate_budget tool with the destination, total number of days (including both the start and end dates), and the user's total budget in USD.

Use the estimate_budget tool's breakdown as a general planning guide.

IMPORTANT BUDGET RULES:
- Plan activities according to the user's total budget.
- The backend adds $85 per day for accommodation and transportation.
- The sum of all activity estimatedCost values plus $85 per day should not exceed the user's total budget whenever reasonably possible.
- Prefer free or affordable activities when the budget is limited.
- Include realistic activity costs; do not invent unrealistically low costs just to fit the budget.
- If the budget is insufficient, minimize the excess cost and prioritize essential activities.

The backend will calculate each day's final estimated budget by adding the activity costs, $70 accommodation, and $15 transportation. Do not treat the user's total budget as the trip's estimated cost. The final trip total will be calculated by the backend.

Set currency to USD.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        tools: [
          {
            functionDeclarations: [
              searchPlacesTool,
              getWeatherTool,
              estimateBudgetTool,
            ],
          },
        ],
      },
    });

    const contents: any[] = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
      response.candidates?.[0]?.content,
    ];

    let currentResponse = response;
    let toolIterations = 0;

    if (response.functionCalls && response.functionCalls.length > 0) {
      while (currentResponse.functionCalls?.length && toolIterations < 10) {
        toolIterations++;

        const functionResponses = [];

        for (const functionCall of currentResponse.functionCalls) {
          if (functionCall.name === "search_places") {
            const args = functionCall.args as {
              destination: string;
              interests: string;
            };

            res.write(
              `data: ${JSON.stringify({ message: "Searching For Places" })}\n\n`,
            );

            const places = await searchPlaces(args.destination, args.interests);

            functionResponses.push({
              functionResponse: {
                name: functionCall.name,
                id: functionCall.id,
                response: { result: places },
              },
            });
          }

          if (functionCall.name === "get_weather") {
            const args = functionCall.args as {
              destination: string;
              date: string;
            };

            res.write(
              `data: ${JSON.stringify({ message: "Getting Weather" })}\n\n`,
            );

            const weatherResult = await getWeather(args.destination, args.date);

            functionResponses.push({
              functionResponse: {
                name: functionCall.name,
                id: functionCall.id,
                response: { result: weatherResult },
              },
            });
          }

          if (functionCall.name === "estimate_budget") {
            const startDate = new Date(trip.startDate).getTime();
            const endDate = new Date(trip.endDate).getTime();

            const days =
              Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            res.write(
              `data: ${JSON.stringify({
                message: "Estimating Trip Budget",
              })}\n\n`,
            );

            const budgetEstimate = estimateBudget({
              destination: trip.destination,
              days,
              budget: trip.budget,
            });

            functionResponses.push({
              functionResponse: {
                name: functionCall.name,
                id: functionCall.id,
                response: { result: budgetEstimate },
              },
            });
          }
        }

        contents.push({
          role: "user",
          parts: functionResponses,
        });

        currentResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents,
          config: {
            tools: [
              {
                functionDeclarations: [
                  searchPlacesTool,
                  getWeatherTool,
                  estimateBudgetTool,
                ],
              },
            ],
          },
        });

        if (currentResponse.functionCalls?.length) {
          contents.push(currentResponse.candidates?.[0]?.content);
        }
      }
    }

    const finalResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
      },
    });

    if (!finalResponse?.text) {
      res.write(
        `data: ${JSON.stringify({ error: "Failed to generate Trip" })}\n\n`,
      );
      return res.end();
    }
    const parsedResponse = JSON.parse(finalResponse.text);

    for (const day of parsedResponse.itineraryDays) {
      for (const activity of day.activities) {
        if (
          typeof activity.latitude === "number" &&
          typeof activity.longitude === "number"
        ) {
          continue;
        }

        const foundPlace = await findPlaceCoordinates(
          activity.location,
          trip.destination,
        );

        if (foundPlace) {
          activity.latitude = foundPlace.latitude;
          activity.longitude = foundPlace.longitude;
          activity.location = foundPlace.location;
        }
      }
    }

    const validationResult = aiResponseSchema.safeParse(parsedResponse);
    if (!validationResult.success) {
      console.dir(validationResult.error.issues, {
        depth: null,
      });

      res.write(
        `data: ${JSON.stringify({ error: "Invalid response format from AI" })}\n\n`,
      );
      return res.end();
    }

    const itinerary = validationResult.data;

    const accommodationPerDay = 70;
    const transportationPerDay = 15;

    itinerary.itineraryDays.forEach((day) => {
      const activityTotal = day.activities.reduce(
        (total, activity) => total + Number(activity.estimatedCost || 0),
        0,
      );

      day.dailyEstimatedCost =
        activityTotal + accommodationPerDay + transportationPerDay;
    });

    itinerary.totalBudget = itinerary.itineraryDays.reduce(
      (total, day) => total + day.dailyEstimatedCost,
      0,
    );

    itinerary.currency = "USD";

    const savedTrip = await prisma.trip.create({
      data: {
        destination: itinerary.destination,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        budget: trip.budget,
        interests: trip.interests,
        userId: req.userId,
      },
    });

    await prisma.itineraryDay.createMany({
      data: itinerary.itineraryDays.map((day) => ({
        tripId: savedTrip.id,
        dayNumber: day.dayNumber,
        date: new Date(day.date),
        title: day.theme,
        activities: day.activities,
        dailyEstimatedCost: day.dailyEstimatedCost,
        weather: day.weather,
      })),
    });
    await prisma.creditLedger.create({
      data: {
        userId: req.userId,
        amount: -1,
        type: "trip_usage",
      },
    });

    res.write(`data: ${JSON.stringify(validationResult.data)}\n\n`);
    res.end();
  } catch (error) {
    console.log(error);

    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({ error: "Failed to generate Trip" })}\n\n`,
      );
      res.end();
    } else {
      return res.status(500).json({ error: "Failed to generate Trip" });
    }
  }
});

//Ai chat code
router.post("/chat", async (req, res) => {
  try {
    const { tripId, message } = req.body;

    if (!tripId || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Trip ID and message are required",
      });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id: Number(tripId),
        userId: req.userId,
      },
      include: {
        itineraryDays: true,
      },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const prompt = `
You are TripWise, an AI travel-planning assistant.

SAVED TRIP:
${JSON.stringify(trip)}

USER MESSAGE:
${message}

YOUR TASK:
Determine whether the user is asking for general travel advice or requesting a change to their itinerary.

1. GENERAL QUESTIONS AND ADVICE
If the user asks a question, requests recommendations, or wants travel advice, respond with helpful, natural text based on their saved trip.
Do not claim that you have modified or saved anything.

2. ITINERARY CHANGE REQUESTS
If the user explicitly requests a change to their itinerary, propose a complete replacement for the specific day they want to change.

Your proposal must include:
- dayNumber: the existing day number being changed.
- title: a suitable title for the revised day.
- activities: an array of activities, each containing:
- timeSlot: the activity's time of day.
- description: what the user will do.
- location: where the activity takes place.
- estimatedCost: the estimated cost as a number.
- dailyEstimatedCost: the sum of the estimated costs of all proposed activities.

RULES:
- Base suggestions on the saved trip, destination, interests, dates, and budget.
- Preserve existing activities unless the user requests changes.
- Do not change other days unless explicitly requested.
- Keep proposed activities practical and within the user's budget.
- Use USD for all proposed activity costs.
- Never claim that a proposal has been applied or saved.
- If the requested day is unclear, ask which day the user wants to change.
- If you cannot fulfill the request reasonably, explain why instead of inventing details.

RESPONSE FORMAT:
Always return a valid JSON object with these fields:
- type: either "advice" or "proposal"
- reply: a helpful text response for the user
- proposal: the proposed day change when type is "proposal", otherwise null

For a proposal, the proposal object must contain:
- dayNumber
- title
- activities
- dailyEstimatedCost

Each activity must contain:
- timeSlot
- description
- location
- estimatedCost

If the user asks for general advice, set type to "advice" and proposal to null.
If the user requests an itinerary change, set type to "proposal" and include the complete proposed day.
Do not claim that any proposal has been saved or applied.
COST ESTIMATION RULES:
- estimatedCost represents the total estimated cost for that activity,
  including relevant transportation, food, tickets, and other expenses.
- Free admission does not mean the entire activity costs zero.
- Estimate realistic costs for the destination and use USD.
- Use 0 only when the activity genuinely has no expected cost.
- dailyEstimatedCost must equal the sum of all activity estimatedCost values.
- Keep the day's total reasonable for the saved trip budget`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text ?? "{}");

    if (result.type === "proposal") {
      const validation = proposedDayChangeValidator.safeParse(result.proposal);

      if (!validation.success) {
        return res.status(502).json({
          message: "AI returned an invalid itinerary proposal",
        });
      }

      const proposedDay = trip.itineraryDays.find(
        (day) => day.dayNumber === validation.data.dayNumber,
      );

      if (!proposedDay) {
        return res.status(400).json({
          message: "The proposed day does not exist in this trip",
        });
      }

      return res.json({
        type: "proposal",
        reply: result.reply,
        proposal: validation.data,
      });
    }

    if (result.type !== "advice" || typeof result.reply !== "string") {
      return res.status(502).json({
        message: "AI returned an invalid chat response",
      });
    }

    return res.json({
      type: "advice",
      reply: result.reply,
      proposal: null,
    });
  } catch (error) {
    console.error("Trip chat error:", error);

    return res.status(500).json({
      message: "Failed to load trip for chat",
    });
  }
});

router.post("/apply-day-change", async (req, res) => {
  try {
    const { tripId, proposal } = req.body;

    // 1. Validate the trip ID
    if (!Number.isInteger(tripId) || tripId <= 0) {
      return res.status(400).json({
        message: "Invalid trip ID",
      });
    }

    // 2. Validate the proposed day and its costs
    const validation = proposedDayChangeValidator.safeParse(proposal);

    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid itinerary proposal",
        errors: validation.error.issues,
      });
    }

    const approvedProposal = validation.data;

    // 3. Find the trip owned by the authenticated user
    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        userId: req.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    // 4. Find the requested day within that trip
    const day = await prisma.itineraryDay.findFirst({
      where: {
        tripId: trip.id,
        dayNumber: approvedProposal.dayNumber,
      },
    });

    if (!day) {
      return res.status(404).json({
        message: "The requested day was not found",
      });
    }

    // 5. Save the approved changes to PostgreSQL
    const updatedDay = await prisma.itineraryDay.update({
      where: {
        id: day.id,
      },
      data: {
        title: approvedProposal.title,
        activities: approvedProposal.activities,
        dailyEstimatedCost: approvedProposal.dailyEstimatedCost,
      },
    });

    return res.json({
      message: "Itinerary day updated successfully",
      day: updatedDay,
    });
  } catch (error) {
    console.error("Apply day change error:", error);

    return res.status(500).json({
      message: "Failed to apply itinerary changes",
    });
  }
});

export default router;
