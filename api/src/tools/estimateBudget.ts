type EstimateBudgetInput = {
  destination: string;
  days: number;
  budget: number;
};

export function estimateBudget({
  destination,
  days,
  budget,
}: EstimateBudgetInput) {
  const dailyCosts = {
    accommodation: 70,
    food: 35,
    transportation: 15,
    activities: 25,
  };

  const accommodation = dailyCosts.accommodation * days;
  const food = dailyCosts.food * days;
  const transportation = dailyCosts.transportation * days;
  const activities = dailyCosts.activities * days;

  const total = accommodation + food + transportation + activities;

  const dailyEstimatedCost =
    dailyCosts.accommodation +
    dailyCosts.food +
    dailyCosts.transportation +
    dailyCosts.activities;

  return {
    destination,
    days,
    dailyEstimatedCost,
    currency: "USD",
    userBudget: budget,
    breakdown: {
      accommodation,
      food,
      transportation,
      activities,
    },
    estimatedTotal: total,
    remainingBudget: budget - total,
    withinBudget: total <= budget,
    note: "Approximate estimate in USD using mid-range daily costs. Flights and unexpected expenses are excluded.",
  };
}
