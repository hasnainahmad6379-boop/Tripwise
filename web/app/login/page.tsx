"use client";

import { useState } from "react";
import Link from "next/link";
import API_URL from "@/lib/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-[#F7F8F5] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-9">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#84A282]">
            Welcome back
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#2C5745] sm:text-4xl">
            Log in to TripWise
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
            Your next adventure is just around the corner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black placeholder:text-black outline-none transition-all focus:border-[#2C5745] focus:ring-2 focus:ring-[#DCE9D9] sm:text-base"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border placeholder:text-black   text-black border-gray-300 px-4 py-3 text-sm outline-none transition-all focus:border-[#2C5745] focus:ring-2 focus:ring-[#DCE9D9] sm:text-base"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#2C5745] px-5 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#84A282] hover:shadow-md active:scale-[0.98]"
          >
            Log In
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#2C5745] underline-offset-4 transition-colors hover:text-[#84A282] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
