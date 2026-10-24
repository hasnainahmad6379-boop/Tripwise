/*
  Warnings:

  - Added the required column `activities` to the `ItineraryDay` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ItineraryDay" ADD COLUMN     "activities" JSONB NOT NULL;
