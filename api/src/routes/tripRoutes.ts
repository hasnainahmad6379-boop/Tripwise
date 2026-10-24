import express from "express";
import {
  createTrip,
  getTrips,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getTrips);
router.put("/:id", authMiddleware, updateTrip);
router.delete("/:id", authMiddleware, deleteTrip);

export default router;
