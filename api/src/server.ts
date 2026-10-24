import express from "express";
import prisma from "./lib/prisma";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middleware/authMiddleware";
import tripRoutes from "./routes/tripRoutes";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { stripe } from "./config/stripe";

const app = express();

app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).send("Missing webhook signature or secret");
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return res.status(400).send("Invalid webhook signature");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const userId = Number(session.metadata?.userId);
        const credits = Number(session.metadata?.credits);

        if (Number.isSafeInteger(userId) && userId > 0 && credits === 10) {
          try {
            await prisma.creditLedger.create({
              data: {
                userId,
                amount: 10,
                type: "purchase",
                stripeSessionId: session.id,
              },
            });
          } catch (error) {
            try {
              const existingCredit = await prisma.creditLedger.findUnique({
                where: {
                  stripeSessionId: session.id,
                },
              });

              if (existingCredit) {
                return res.json({ received: true });
              }
            } catch (checkError) {
              console.error(
                "Failed to check existing Stripe credits:",
                checkError,
              );
            }
            console.error("Failed to record Stripe credits:", error);
            return res.status(500).send("Failed to record credits");
          }
        }
      }
    }

    return res.json({ received: true });
  },
);

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    message: "TripWise API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/trips", tripRoutes);
app.use("/payments", paymentRoutes);

app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route",
  });
});

app.use("/ai", authMiddleware, aiRoutes);

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
