import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { tripSchema, updateTripSchema } from "../validators/tripValidators";

export const createTrip = async (req: Request, res: Response) => {
  const result = tripSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid trip data provided" });
  }
  const { destination, startDate, endDate, budget, interests } = result.data;
  const userId = req.userId;
  const trip = await prisma.trip.create({
    data: {
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      interests,
      userId,
    },
  });
  res.status(201).json({ message: "Trip created successfully", trip });
};

export const getTrips = async (req: Request, res: Response) => {
  const userId = req.userId;
  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      itineraryDays: true,
    },
  });
  res.status(200).json({ trips });
};

export const updateTrip = async (req: Request, res: Response) => {
  const tripId = Number(req.params.id);
  const userId = req.userId;
  const result = updateTripSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid trip data provided" });
  }

  const updates = result.data;

  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
  });
  if (!trip) {
    return res.status(404).json({
      error: "Trip not found",
    });
  }
  if (trip.userId !== userId) {
    return res.status(403).json({
      error: "You are not authorized to update this trip",
    });
  }
  const updateData = {
    ...updates,
    startDate: updates.startDate ? new Date(updates.startDate) : undefined,
    endDate: updates.endDate ? new Date(updates.endDate) : undefined,
  };
  const updatedTrip = await prisma.trip.update({
    where: {
      id: tripId,
    },
    data: updateData,
  });
  return res.status(200).json({
    message: "Trip updated successfully",
    trip: updatedTrip,
  });
};

export const deleteTrip = async (req: Request, res: Response) => {
  const tripId = Number(req.params.id);
  const userId = req.userId;
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });
  if (!trip) {
    return res.status(404).json({ error: "Trip not found" });
  }
  if (trip.userId !== userId) {
    return res
      .status(403)
      .json({ error: "You are not authorized to delete this trip" });
  }
  const deletedTrip = await prisma.trip.delete({
    where: { id: tripId },
  });
  return res
    .status(200)
    .json({ message: "Trip deleted successfully", trip: deletedTrip });
};
