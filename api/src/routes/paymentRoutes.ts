import { Router } from "express";
import { stripe } from "../config/stripe";
import { authMiddleware } from "../middleware/authMiddleware";
import prisma from "../lib/prisma";
import type { Request } from "express";

const router = Router();
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "TripWise — 10 Trip Credits",
              description: "10 additional AI trip-generation credits",
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: String(req.userId),
        credits: "10",
      },
      success_url: "http://localhost:3000/dashboard?payment=success",
      cancel_url: "http://localhost:3000/dashboard?payment=cancelled",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ message: "Unable to start checkout" });
  }
});

export default router;
