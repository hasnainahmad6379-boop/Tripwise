import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";

type TripChatProps = {
  trip: any;
  onClose: () => void;
};

type DayChangeProposal = {
  dayNumber: number;
  title: string;
  activities: {
    timeSlot: string;
    description: string;
    location: string;
    estimatedCost: number;
  }[];
  dailyEstimatedCost: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  proposal?: DayChangeProposal;
  cancelled?: boolean;
  applied?: boolean;
};
const TripChat = ({ trip, onClose }: TripChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#DCE9D9] bg-[#F7F8F5] p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#84A282]">
            Your travel assistant
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#2C5745]">TripWise AI</h2>
          <p className="mt-1 truncate text-sm text-gray-600">
            {trip.destination}
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Close
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <p className="text-sm text-gray-600">
          Ask me to adjust your itinerary, reduce costs, or suggest different
          activities for {trip.destination}.
        </p>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`w-fit max-w-[85%] rounded-xl px-4 py-2 text-sm ${
              msg.role === "user"
                ? "ml-auto bg-sky-100 text-sky-900"
                : "mr-auto bg-gray-100 text-gray-800"
            }`}
          >
            {msg.role === "assistant" ? (
              <>
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-2 text-lg font-bold">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-2 text-base font-bold">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 text-sm font-bold">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-2 list-disc space-y-1 pl-5">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-2 list-decimal space-y-1 pl-5">
                        {children}
                      </ol>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold">{children}</strong>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                {msg.proposal && !msg.cancelled && !msg.applied && (
                  <div className="mt-4 w-full min-w-0 rounded-lg border border-sky-200 bg-white p-3 text-gray-800">
                    <h3 className="text-base font-bold">
                      Day {msg.proposal.dayNumber}: {msg.proposal.title}
                    </h3>

                    <div className="mt-3 space-y-3">
                      {msg.proposal.activities.map(
                        (activity, activityIndex) => (
                          <div
                            key={activityIndex}
                            className="rounded-md bg-gray-50 p-3"
                          >
                            <p className="font-semibold">{activity.timeSlot}</p>
                            <p className="mt-1">{activity.description}</p>
                            <p className="mt-1 text-sm text-gray-600">
                              Location: {activity.location}
                            </p>
                            <p className="mt-1 text-sm font-medium">
                              Estimated cost: $
                              {activity.estimatedCost.toFixed(2)}
                            </p>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-3 border-t border-gray-200 pt-3 font-bold">
                      Estimated daily total: $
                      {msg.proposal.dailyEstimatedCost.toFixed(2)}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token");

                            const response = await fetch(
                              "http://localhost:4000/ai/apply-day-change",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  tripId: trip.id,
                                  proposal: msg.proposal,
                                }),
                              },
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(
                                data.message || "Failed to apply changes",
                              );
                            }
                            await queryClient.invalidateQueries({
                              queryKey: ["trips"],
                            });

                            setMessages((prev) =>
                              prev.map((message, messageIndex) =>
                                messageIndex === index
                                  ? {
                                      ...message,
                                      applied: true,
                                      content:
                                        "✅Changes applied successfully! Your saved itinerary has been updated.",
                                    }
                                  : message,
                              ),
                            );
                          } catch (error) {
                            setError(
                              error instanceof Error
                                ? error.message
                                : "Something went wrong",
                            );
                          }
                        }}
                      >
                        Apply Changes
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setMessages((prev) =>
                            prev.map((message, messageIndex) =>
                              messageIndex === index
                                ? {
                                    ...message,
                                    cancelled: true,
                                    content:
                                      "Proposal cancelled. Your saved itinerary has not been changed.",
                                  }
                                : message,
                            ),
                          );
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {isLoading && (
          <p className="text-sm text-gray-500">TripWise AI is thinking...</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="border-t border-gray-200 p-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const userMessage = message.trim();
            if (!userMessage || isLoading) return;

            setMessage("");
            setError("");
            setIsLoading(true);

            setMessages((previousMessages) => [
              ...previousMessages,
              { role: "user", content: userMessage },
            ]);

            try {
              const token = localStorage.getItem("token");

              const response = await fetch("http://localhost:4000/ai/chat", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  tripId: trip.id,
                  message: userMessage,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || "Failed to get AI response");
              }

              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: data.reply,
                  ...(data.type === "proposal" && data.proposal
                    ? { proposal: data.proposal }
                    : {}),
                },
              ]);
            } catch (error) {
              setError(
                error instanceof Error ? error.message : "Something went wrong",
              );
            } finally {
              setIsLoading(false);
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your trip..."
            className="min-w-0 flex-1 rounded-lg border text-black border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripChat;
