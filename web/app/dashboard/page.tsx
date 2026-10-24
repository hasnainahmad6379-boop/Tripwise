"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TripForm from "@/components/TripForm/TripForm";
import TripCard from "@/components/TripCard/TripCard";
import TripChat from "@/components/TripChat/TripChat";
import CreditSection from "@/components/CreditSection/CreditSection";
type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  interests: string;
  userId: number;
  itineraryDays: {
    id: number;
    tripId: number;
    dayNumber: number;
    date: string;
    title: string;
    activities: any[];
    weather: {
      condition: string;
      maxTemperature: number;
      minTemperature: number;
      precipitationProbability: number;
    };
  }[];
};

type TripsResponse = { trips: Trip[] };

const Dashboard = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState("");
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const queryClient = useQueryClient();

  async function getProtectedData() {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:4000/protected", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    data;
    if (!response.ok) {
      window.location.href = "/login";
      return;
    }
    setIsCheckingAuth(false);
  }
  useEffect(() => {
    getProtectedData();
  }, []);

  async function fetchTrips(): Promise<TripsResponse> {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:4000/trips", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data;
  }
  const { data, isLoading, error } = useQuery({
    queryKey: ["trips"],
    queryFn: fetchTrips,
  });
  data;

  const createTripMutation = useMutation({
    mutationFn: async (tripData: {
      destination: string;
      startDate: string;
      endDate: string;
      budget: number;
      interests: string;
    }) => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:4000/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create trip");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setInterests("");
    },
  });

  const generateTripMutation = useMutation({
    mutationFn: async (tripData: {
      destination: string;
      startDate: string;
      endDate: string;
      budget: number;
      interests: string;
    }) => {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/ai/generate-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || data.error || "Failed to generate trip",
        );
      }

      if (!response.body) {
        throw new Error("Response stream is not available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let itinerary = null;
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((line) => line.startsWith("data:"));

          if (!line) continue;

          const payload = JSON.parse(line.slice(5).trim());

          if (payload.error) {
            throw new Error(payload.error);
          }

          if (payload.message) {
            setGenerationProgress(payload.message);
          } else {
            itinerary = payload;
          }
        }
      }

      if (!itinerary) {
        throw new Error("No itinerary received from the server");
      }

      return itinerary;
    },
    onSuccess: (data) => {
      setGeneratedItinerary(data);
      queryClient.invalidateQueries({ queryKey: ["trips"] });

      setDestination("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setInterests("");
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:4000/trips/${tripId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete trip");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }
  if (isLoading) {
    return <div>Loading trips...</div>;
  }
  if (error) {
    return <div>Failed to load trips.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate || !budget || !interests) {
      alert("Please fill in all fields");
      return;
    }
    if (endDate < startDate) {
      alert("End date cannot be before start date");
      return;
    }

    generateTripMutation.mutate({
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      interests,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#84A282]">
            Your travel space
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#2C5745] sm:text-4xl">
            Your Travel Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Plan your next adventure, manage your itineraries, and keep every
            trip organized in one place.
          </p>

          <div className="mt-5 inline-flex items-center rounded-full bg-[#DCE9D9] px-4 py-2 text-sm font-semibold text-[#2C5745]">
            {data?.trips.length ?? 0}{" "}
            {(data?.trips.length ?? 0) === 1 ? "trip" : "trips"} planned
          </div>
        </div>

        <CreditSection />
        <TripForm
          destination={destination}
          setDestination={setDestination}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          budget={budget}
          setBudget={setBudget}
          interests={interests}
          setInterests={setInterests}
          handleSubmit={handleSubmit}
          isGenerating={generateTripMutation.isPending}
          generationProgress={generationProgress}
        />

        {generateTripMutation.isError && (
          <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {generateTripMutation.error.message}
          </p>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">Your Trips</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your planned trips.
          </p>
        </div>
        {data?.trips.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-900">
              No trips yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first trip using the form above.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5">
            {data?.trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onChat={(trip) => setSelectedTrip(trip)}
                onDelete={(tripId) => deleteTripMutation.mutate(tripId)}
              />
            ))}
          </div>
        )}
      </div>
      {generatedItinerary && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Generated Itinerary
          </h2>

          <h3 className="mt-4 text-xl font-semibold text-gray-900">
            {generatedItinerary.destination}
          </h3>
        </div>
      )}

      {selectedTrip && (
        <TripChat trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}
    </div>
  );
};
export default Dashboard;
