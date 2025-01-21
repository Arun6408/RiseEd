import React from "react";

const Loader = () => {
  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-white/60"
      style={{ zIndex: 9999 }}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Loader Circle */}
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-800 via-teal-700 to-teal-400 rounded-full blur-xl animate-pulse"></div>
          <div className="w-20 h-20 border-4 border-gray-600 border-t-teal-800 rounded-full animate-spin"></div>
        </div>

        {/* Loader Text */}
        <p className="text-teal-800 text-2xl font-semibold tracking-wide text-center">
          <span className="text-teal-900">Loading</span>
          <span className="text-teal-600">...</span>
        </p>

        {/* Subtext with custom opacity pulse effect */}
        <p
          className="text-teal-800 text-md font-semibold text-center bg-white"
          style={{
            animation: "pulse 1.5s infinite", 
            opacity: "0.9",
          }}
        >
          Hang tight, we are almost there!
        </p>
      </div>
    </div>
  );
};

export default Loader;
