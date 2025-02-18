import React, { useState, useEffect } from "react";

const Loader = () => {
  const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLongLoadingMessage(true);
    }, 3000); // Show message after 3 seconds

    return () => clearTimeout(timeout); // Cleanup timeout
  }, []);

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-white/60"
      style={{ zIndex: 9999 }}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Loader Circle */}
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-800 via-teal-700 to-teal-400 rounded-full blur-xl animate-pulse"></div>
          <div className="w-24 h-24 border-4 border-gray-600 border-t-teal-800 rounded-full animate-spin"></div>
        </div>

        {/* Loader Text */}
        <p className="text-teal-800 text-3xl font-semibold tracking-wide text-center">
          <span className="text-teal-900">Loading</span>
          <span className="text-teal-600">...</span>
        </p>

        {/* Subtext with custom opacity pulse effect */}
        <p
          className="text-teal-800 text-lg font-semibold text-center bg-white"
          style={{
            animation: "pulse 1.5s infinite",
            opacity: "0.9",
          }}
        >
          Hang tight, we are almost there!
        </p>

        {/* Long Loading Message */}
        {showLongLoadingMessage && (
          <p className="text-teal-800 text-lg font-semibold text-center mt-4">
            This is taking a bit longer than usual. Please be patient!
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;
