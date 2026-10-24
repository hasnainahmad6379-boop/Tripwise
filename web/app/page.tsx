import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
const Home = () => {
  return (
    <main className="min-h-screen bg-white">
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full bg-[#DCE9D9] px-4 py-2 text-sm font-medium text-[#2C5745]">
          Your personal AI travel planner
        </p>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Your next adventure starts with{" "}
          <span className="text-[#2C5745]">TripWise.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          Plan unforgettable trips with AI-powered itineraries, weather
          forecasts, and budget estimates—all in one place.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-[#2C5745] hover:bg-[#84A282] px-6 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-lg border-2 border-[#2C5745] px-6 py-3 font-semibold text-[#2C5745] transition-all duration-200 hover:bg-[#2C5745] hover:text-white active:scale-95"
          >
            Log In
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
