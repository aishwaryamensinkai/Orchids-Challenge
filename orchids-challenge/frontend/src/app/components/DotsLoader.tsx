"use client";
import React from "react";

const DotsLoader = () => (
  <div className="flex items-center justify-center mb-4" aria-label="Loading">
    <span className="dot bg-blue-500"></span>
    <span className="dot bg-blue-400"></span>
    <span className="dot bg-gray-300"></span>
    <style jsx>{`
      .dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin: 0 6px;
        display: inline-block;
        animation: bounce 1.2s infinite both;
      }
      .dot:nth-child(1) {
        animation-delay: 0s;
      }
      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0.7);
          opacity: 0.7;
        }
        40% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

export default DotsLoader;
