"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const CreditSection = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    if (paymentStatus === "success") {
      setPaymentMessage("Payment successful! Updating your credits...");
    } else if (paymentStatus === "cancelled") {
      setPaymentMessage("Checkout was cancelled. No credits were purchased.");
    }
  }, [paymentStatus]);

  useEffect(() => {
    let cancelled = false;

    const fetchCredits = async (): Promise<number | null> => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setError("Please log in to view your credits.");
        }
        return null;
      }

      const response = await fetch("http://localhost:4000/ai/credits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load credits.");
      }

      if (!cancelled) {
        setCredits(data.credits);
        setError("");
      }

      return data.credits as number;
    };

    const loadCredits = async () => {
      try {
        await fetchCredits();

        if (paymentStatus !== "success") return;

        const savedCredits = sessionStorage.getItem("creditsBeforeCheckout");
        const previousCredits =
          savedCredits === null ? null : Number(savedCredits);

        if (previousCredits === null || !Number.isFinite(previousCredits)) {
          setPaymentMessage(
            "Payment completed. Your current credit balance is displayed below.",
          );
          return;
        }

        for (let attempt = 0; attempt < 5; attempt++) {
          if (cancelled) return;

          await new Promise((resolve) => setTimeout(resolve, 2000));

          if (cancelled) return;

          const currentCredits = await fetchCredits();

          if (currentCredits !== null && currentCredits > previousCredits) {
            sessionStorage.removeItem("creditsBeforeCheckout");
            setPaymentMessage(
              "Payment successful! Your credits have been updated.",
            );
            return;
          }
        }

        if (!cancelled) {
          setPaymentMessage(
            "Payment completed. Your credits may take longer to appear. Please refresh shortly.",
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load credits.",
          );
        }
      }
    };

    loadCredits();

    return () => {
      cancelled = true;
    };
  }, [paymentStatus]);

  const handleBuyCredits = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to purchase credits.");
        return;
      }

      const response = await fetch("http://localhost:4000/payments/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start checkout.");
      }

      if (!data.url) {
        throw new Error("Checkout URL was not returned.");
      }

      sessionStorage.setItem("creditsBeforeCheckout", String(credits));

      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start checkout.",
      );
    }
  };

  return (
    <section className="my-8 overflow-hidden rounded-2xl border border-[#DCE9D9] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#84A282]">
            Your account
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#2C5745] sm:text-2xl">
            Trip Credits
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Use credits to generate personalized AI travel itineraries.
          </p>

          {paymentMessage && (
            <p className="mt-4 rounded-lg bg-[#DCE9D9] px-4 py-3 text-sm text-[#2C5745]">
              {paymentMessage}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <div className="w-full rounded-xl bg-[#F7F8F5] p-5 sm:w-auto sm:min-w-52 sm:text-center">
          {credits === null ? (
            <p className="text-sm text-gray-600">Loading your credits...</p>
          ) : (
            <>
              <p className="text-3xl font-bold text-[#2C5745]">{credits}</p>
              <p className="mt-1 text-sm text-gray-600">credits remaining</p>

              <button
                onClick={handleBuyCredits}
                className="mt-4 w-full rounded-lg bg-[#2C5745] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#84A282] hover:shadow-md active:scale-95"
              >
                Buy 10 Credits — $10
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CreditSection;
