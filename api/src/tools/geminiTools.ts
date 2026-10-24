import { Type } from "@google/genai";

export const searchPlacesTool = {
  name: "search_places",
  description:
    "Find places in a destination based on the traveler's interests.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: {
        type: Type.STRING,
        description: "The destination to search in.",
      },
      interests: {
        type: Type.STRING,
        description: "The traveler's interests.",
      },
    },
    required: ["destination", "interests"],
  },
};

export const getWeatherTool = {
  name: "get_weather",
  description: "Get the weather forecast for a destination on a specific date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: {
        type: Type.STRING,
        description: "The destination to get weather for.",
      },
      date: {
        type: Type.STRING,
        description: "The date to get weather for in YYYY-MM-DD format.",
      },
    },
    required: ["destination", "date"],
  },
};

export const estimateBudgetTool = {
  name: "estimate_budget",
  description:
    "Estimate the trip cost using mid-range daily costs, compare it with the traveler's total budget, and report whether the trip fits within that budget.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: {
        type: Type.STRING,
        description: "The destination of the trip.",
      },
      days: {
        type: Type.NUMBER,
        description: "The total number of days for the trip.",
      },
      budget: {
        type: Type.NUMBER,
        description: "The traveler's total budget in USD.",
      },
    },
    required: ["destination", "days", "budget"],
  },
};
