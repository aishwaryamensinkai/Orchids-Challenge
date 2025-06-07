"use client";
import React from "react";

const Header = () => (
  <div className="flex flex-col items-center mb-12 mt-2">
    {/* SVG Magic Wand */}
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      className="mb-2"
    >
      <defs>
        <linearGradient
          id="wand-gradient"
          x1="0"
          y1="0"
          x2="24"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#a21caf" />
        </linearGradient>
      </defs>
      <path
        d="M5 19l14-14M7 7l10 10"
        stroke="url(#wand-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="19" cy="5" r="1.5" fill="#a21caf" />
      <circle cx="5" cy="19" r="1" fill="#6366f1" />
    </svg>
    <h1
      className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x text-center mb-3"
      style={{ backgroundSize: "200% 200%" }}
    >
      AI Website Cloner
    </h1>
    <p className="text-gray-600 text-xl text-center max-w-2xl mb-4">
      Advanced website cloning powered by AI. Extract design context, analyze
      layouts, and generate high-quality HTML clones with content variation.
    </p>
    <div className="border-b border-gray-200 w-full max-w-2xl"></div>
    {/* Add animated gradient CSS */}
    <style jsx global>{`
      @keyframes gradient-x {
        0%,
        100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
      .animate-gradient-x {
        animation: gradient-x 4s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default Header;
