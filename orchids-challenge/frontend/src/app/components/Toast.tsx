"use client";
import React, { useEffect } from "react";

const Toast = ({
  message,
  type,
  onClose,
  duration = 3000,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg text-white transition-all animate-fade-in ${
        type === "success"
          ? "bg-green-600"
          : type === "error"
          ? "bg-red-600"
          : "bg-blue-600"
      }`}
    >
      <div className="flex items-center gap-2">
        {type === "success" && <span>✅</span>}
        {type === "error" && <span>❌</span>}
        {type === "info" && <span>ℹ️</span>}
        <span>{message}</span>
        <button
          className="ml-4 text-white/80 hover:text-white"
          onClick={onClose}
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default Toast;
