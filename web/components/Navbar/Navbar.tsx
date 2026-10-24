"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-3 sm:px-10 sm:py-4">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-[#2C5745] sm:text-2xl"
      >
        TripWise
      </Link>

      <div className="flex items-center gap-2 sm:gap-5">
        {isLoggedIn ? (
          <>
            <Link
              href="/dashboard"
              className="rounded-lg border border-transparent px-2.5 py-1.5 text-sm font-medium text-[#2C5745] transition-all duration-200 hover:border-[#2C5745] hover:bg-[#DCE9D9] hover:shadow-sm active:scale-95 sm:px-4 sm:py-2 sm:text-base"
            >
              Dashboard
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="rounded-lg bg-[#2C5745] px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#84A282] active:scale-95 sm:px-4 sm:py-2 sm:text-base"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg border border-transparent px-2.5 py-1.5 text-sm font-medium text-[#2C5745] transition-all duration-200 hover:border-[#2C5745] hover:bg-[#DCE9D9] hover:shadow-sm active:scale-95 sm:px-4 sm:py-2 sm:text-base"
            >
              Log In
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-[#2C5745] px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#84A282] active:scale-95 sm:px-4 sm:py-2 sm:text-base"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
