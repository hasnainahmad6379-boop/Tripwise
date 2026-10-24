type TripFormProps = {
  destination: string;
  setDestination: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  budget: string;
  setBudget: (value: string) => void;
  interests: string;
  setInterests: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isGenerating: boolean;
  generationProgress: string;
};

const TripForm = ({
  destination,
  setDestination,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  budget,
  setBudget,
  interests,
  setInterests,
  handleSubmit,
  isGenerating,
  generationProgress,
}: TripFormProps) => {
  const inputClass =
    "w-full min-w-0 rounded-xl border border-gray-200 bg-[#F7F8F5] px-4 py-3 text-base text-black outline-none transition duration-200 placeholder:text-gray-500 focus:border-[#2C5745] focus:bg-white focus:ring-2 focus:ring-[#DCE9D9]";

  const labelClass = "mb-2 block text-sm font-medium text-gray-700";

  return (
    <>
      <div className="mt-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#84A282] sm:text-sm">
          Start your adventure
        </p>

        <h2 className="text-2xl font-bold tracking-tight text-[#2C5745] sm:text-3xl">
          Plan a New Trip
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
          Tell us where you want to go, and let TripWise help plan your journey.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 w-full max-w-2xl rounded-2xl border border-[#DCE9D9] bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6 md:p-8"
      >
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Destination</label>
            <input
              type="text"
              placeholder="e.g. Istanbul, Paris"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="min-w-0">
              <label className={labelClass}>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label className={labelClass}>End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Total budget (USD)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              min="1"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Interests</label>
            <input
              type="text"
              placeholder="e.g. history, food, nature"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              required
              className={inputClass}
            />
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Enter the types of places and activities you enjoy.
            </p>
          </div>
        </div>

        <div className="mt-7 border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full rounded-xl bg-[#2C5745] px-5 py-3.5 font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#84A282] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-44"
          >
            {isGenerating ? "Generating Trip..." : "Create Trip"}
          </button>
        </div>
      </form>

      {isGenerating && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 max-w-2xl rounded-xl border border-[#DCE9D9] bg-white px-4 py-3 text-sm font-medium text-[#2C5745]"
        >
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[#84A282]" />
          {generationProgress || "Preparing your trip..."}
        </div>
      )}
    </>
  );
};

export default TripForm;
