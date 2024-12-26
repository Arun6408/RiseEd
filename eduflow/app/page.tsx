"use client";

import { clearCookies } from "@/utils/util";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <h1>Landing Page</h1>
      <button
        className="w-auto m-5 text-white p-5 h-auto bg-blue-400 dark:bg-gray-500 "
        onClick={clearCookies}
      >
        Clear Cookies
      </button>
    </div>
  );
}
