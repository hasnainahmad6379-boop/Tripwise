import "dotenv/config";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is missing from environment variables");
}

export const stripe = new Stripe(secretKey);
