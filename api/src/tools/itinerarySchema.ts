import { z } from "zod";

export const itinerarySchema = {
  type: "object",
  properties: {
    destination: {
      type: "string",
    },
    startDate: {
      type: "string",
    },
    endDate: {
      type: "string",
    },
    totalBudget: {
      type: "number",
    },
    currency: {
      type: "string",
    },
    interests: {
      type: "array",
      items: {
        type: "string",
      },
    },
    itineraryDays: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dayNumber: {
            type: "number",
          },
          date: {
            type: "string",
          },
          theme: {
            type: "string",
          },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                timeSlot: {
                  type: "string",
                },
                description: {
                  type: "string",
                },
                location: {
                  type: "string",
                },
                estimatedCost: {
                  type: "number",
                },
              },
              required: [
                "timeSlot",
                "description",
                "location",
                "estimatedCost",
              ],
            },
          },
          dailyEstimatedCost: {
            type: "number",
          },
          weather: {
            type: "object",
            properties: {
              condition: {
                type: "string",
              },
              maxTemperature: {
                type: "number",
              },
              minTemperature: {
                type: "number",
              },
              precipitationProbability: {
                type: "number",
              },
            },
            required: [
              "condition",
              "maxTemperature",
              "minTemperature",
              "precipitationProbability",
            ],
          },
        },
        required: [
          "dayNumber",
          "date",
          "theme",
          "activities",
          "dailyEstimatedCost",
          "weather",
        ],
      },
    },
  },
  required: [
    "destination",
    "startDate",
    "endDate",
    "totalBudget",
    "currency",
    "interests",
    "itineraryDays",
  ],
};

export const proposedDayChangeSchema = {
  type: "object",
  properties: {
    dayNumber: {
      type: "number",
    },
    title: {
      type: "string",
    },
    activities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timeSlot: {
            type: "string",
          },
          description: {
            type: "string",
          },
          location: {
            type: "string",
          },
          latitude: {
            type: "number",
          },
          longitude: {
            type: "number",
          },
          estimatedCost: {
            type: "number",
          },
        },
        required: ["timeSlot", "description", "location", "estimatedCost"],
      },
    },
    dailyEstimatedCost: {
      type: "number",
    },
  },
  required: [
    "dayNumber",
    "latitude",
    "longitude",
    "title",
    "activities",
    "dailyEstimatedCost",
  ],
};

export const proposedDayChangeValidator = z
  .object({
    dayNumber: z.number().int().positive(),

    title: z.string().min(1),

    activities: z
      .array(
        z.object({
          timeSlot: z.string().min(1),
          description: z.string().min(1),
          location: z.string().min(1),
          estimatedCost: z.number().finite().nonnegative(),
        }),
      )
      .min(1),

    dailyEstimatedCost: z.number().finite().nonnegative(),
  })
  .refine(
    (proposal) => {
      const activitiesTotal = proposal.activities.reduce(
        (total, activity) => total + activity.estimatedCost,
        0,
      );

      return Math.abs(activitiesTotal - proposal.dailyEstimatedCost) < 0.01;
    },
    {
      message: "Daily estimated cost must equal the sum of activity costs",
      path: ["dailyEstimatedCost"],
    },
  );
