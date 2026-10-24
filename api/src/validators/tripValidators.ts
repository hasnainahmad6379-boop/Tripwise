import { z } from "zod";

export const tripSchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().positive(),
  interests: z.string(),
});

export const updateTripSchema = z.object({
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive().optional(),
  interests: z.string().optional(),
});
