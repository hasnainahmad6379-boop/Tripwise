import express from "express";
import { signup, login } from "../controllers/authController";
const router = express.Router();

export default router;
router.post("/signup", signup);
router.post("/login", login);
