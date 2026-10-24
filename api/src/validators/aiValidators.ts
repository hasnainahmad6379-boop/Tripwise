import { z } from "zod";
export const aiResponseSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalBudget: z.number(),
  currency: z.string(),
  interests: z.array(z.string()),

  itineraryDays: z.array(
    z.object({
      dayNumber: z.number(),
      date: z.string(),
      theme: z.string(),
      weather: z.object({
        condition: z.string(),
        maxTemperature: z.number(),
        minTemperature: z.number(),
        precipitationProbability: z.number(),
      }),

      activities: z.array(
        z.object({
          timeSlot: z.string(),
          description: z.string(),
          location: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          estimatedCost: z.number(),
        }),
      ),

      dailyEstimatedCost: z.number(),
    }),
  ),
});

export const aiRequestSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number(),
  interests: z.string(),
});
