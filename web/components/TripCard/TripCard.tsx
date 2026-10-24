import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("../TripMap/TripMap"), { ssr: false });

type TripCardProps = {
  trip: any;
  onChat: (trip: any) => void;
  onDelete: (tripId: number) => void;
};

const getWeatherIcon = (condition: string) => {
  if (condition === "Clear sky") return "☀️";
  if (condition === "Partly cloudy") return "⛅";
  if (condition === "Overcast") return "☁️";
  if (condition === "Rain" || condition === "Rain showers") return "🌧️";
  if (condition === "Snow") return "❄️";
  if (condition === "Thunderstorm") return "⛈️";
  return "🌤️";
};

const TripCard = ({ trip, onChat, onDelete }: TripCardProps) => {
  const totalEstimatedCost = trip.itineraryDays.reduce(
    (total: number, day: any) => total + Number(day.dailyEstimatedCost || 0),
    0,
  );

  const sortedDays = [...trip.itineraryDays].sort(
    (a: any, b: any) => a.dayNumber - b.dayNumber,
  );

  const maxDailyCost = Math.max(
    ...sortedDays.map((day: any) => Number(day.dailyEstimatedCost || 0)),
    1,
  );

  const budgetDifference = totalEstimatedCost - trip.budget;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#DCE9D9] bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="border-b border-[#DCE9D9] bg-[#F7F8F5] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#84A282]">
          Your destination
        </p>

        <h3 className="mt-2 break-words text-2xl font-bold tracking-tight text-[#2C5745] sm:text-3xl">
          {trip.destination}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-700">
          <span className="rounded-full bg-white px-3 py-1.5">
            Budget: ${trip.budget}
          </span>

          <span className="rounded-full bg-white px-3 py-1.5">
            {new Date(trip.startDate).toLocaleDateString()} –{" "}
            {new Date(trip.endDate).toLocaleDateString()}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          <span className="font-semibold text-gray-800">Interests: </span>
          {trip.interests}
        </p>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#DCE9D9] bg-[#F7F8F5] p-4">
            <p className="text-sm font-medium text-gray-600">
              Estimated trip cost
            </p>
            <p className="mt-1 text-2xl font-bold text-[#2C5745]">
              ${totalEstimatedCost}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE9D9] bg-white p-4">
            <p className="text-sm font-medium text-gray-600">
              Budget difference
            </p>
            <p
              className={`mt-1 break-words text-lg font-bold ${
                budgetDifference > 0 ? "text-red-600" : "text-[#2C5745]"
              }`}
            >
              {budgetDifference > 0
                ? `$${budgetDifference} over budget`
                : budgetDifference < 0
                  ? `$${Math.abs(budgetDifference)} under budget`
                  : "Within budget"}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 p-4 sm:p-5">
          <h4 className="text-lg font-bold text-[#2C5745]">Daily Spending</h4>
          <p className="mt-1 text-sm text-gray-600">
            Compare estimated costs for each day.
          </p>

          <div className="mt-5 flex items-end gap-3 overflow-x-auto pb-3 sm:gap-4">
            {sortedDays.map((day: any) => {
              const dailyCost = Number(day.dailyEstimatedCost || 0);
              const barHeight = (dailyCost / maxDailyCost) * 100;

              return (
                <div
                  key={day.id}
                  className="flex w-12 shrink-0 flex-col items-center gap-2 sm:min-w-0 sm:flex-1"
                >
                  <span className="text-xs font-semibold text-gray-700">
                    ${dailyCost}
                  </span>

                  <div className="flex h-28 w-full max-w-10 items-end justify-center overflow-hidden rounded-t-md bg-[#DCE9D9]">
                    <div
                      className="w-full rounded-t-md bg-[#2C5745] transition-all duration-300"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>

                  <span className="text-xs text-gray-600">
                    Day {day.dayNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-lg font-bold text-[#2C5745]">
            Your Trip Map
          </h4>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <TripMap days={sortedDays} />
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-lg font-bold text-[#2C5745]">
            Your Itinerary
          </h4>

          <div className="space-y-4">
            {sortedDays.map((day: any) => (
              <div
                key={day.id}
                className="rounded-xl border border-[#DCE9D9] bg-[#F7F8F5] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#84A282]">
                      Day {day.dayNumber}
                    </p>

                    <h5 className="mt-1 break-words text-lg font-bold text-[#2C5745]">
                      {day.title}
                    </h5>
                  </div>

                  <p className="text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </p>
                </div>

                {day.weather && (
                  <div className="mt-4 rounded-xl border border-[#DCE9D9] bg-white p-3 sm:p-4">
                    <p className="text-sm font-semibold text-[#2C5745]">
                      Weather forecast
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                      <span>
                        {getWeatherIcon(day.weather.condition)}{" "}
                        {day.weather.condition}
                      </span>
                      <span>High: {day.weather.maxTemperature}°C</span>
                      <span>Low: {day.weather.minTemperature}°C</span>
                      <span>Rain: {day.weather.precipitationProbability}%</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-4 sm:pl-3">
                  {day.activities.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-2 border-[#84A282] pl-4"
                    >
                      <p className="break-words font-semibold text-[#2C5745]">
                        {activity.location}
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {activity.timeSlot}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#DCE9D9] bg-white px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">
                    Daily estimated cost
                  </span>
                  <span className="text-lg font-bold text-[#2C5745]">
                    ${day.dailyEstimatedCost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
          <button
            className="w-full rounded-xl bg-[#2C5745] px-5 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#84A282] hover:shadow-md active:scale-[0.98] sm:w-auto"
            onClick={() => onChat(trip)}
          >
            AI Chat
          </button>

          <button
            className="w-full rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98] sm:w-auto"
            onClick={() => onDelete(trip.id)}
          >
            Delete Trip
          </button>
        </div>
      </div>
    </article>
  );
};

export default TripCard;
