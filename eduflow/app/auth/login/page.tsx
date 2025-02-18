"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as cookie from "cookie";
import styles from "./login.module.css";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import Loader from "@/components/utils/Loader";

export default function Login() {
  const Router = useRouter();
  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password }
      );
      const data = response.data;
      if (data.status !== "success") {
        console.error(data.message);
      }
      if (data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          document.cookie = cookie.serialize(
            "user",
            JSON.stringify(data.user),
            { maxAge: 60 * 60 * 24, path: "/" }
          );
        }
      }
      const role = data.user.role;
      if (role === "superAdmin") Router.push("/superAdmin");
      else if (role === "principal") Router.push("/principal");
      else if (role === "headMaster") Router.push("/head_master");
      else if (role === "teacher") Router.push("/teacher");
      else if (role === "student") Router.push("/student");
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  };
  if(loading) return <Loader/>

  return (
    <div
      className={`flex justify-start w-full items-center min-h-screen ${styles.background}`}
    >
      <div className="flex w-1/2 relative justify-center items-center">
        <div className="absolute rounded-full bg-purple-400 w-36 aspect-square z-10 top-5 left-[30%]"></div>
        <div className="absolute rounded-full bg-pink-400 w-20 aspect-square z-10 bottom-10 right-[30%]"></div>
        <div className="absolute rounded-full bg-orange-400 w-20 aspect-square z-10 top-25 right-[30%]"></div>
        <div className="flex flex-col bg-white/10 px-12 py-20 z-20 rounded-lg shadow-lg max-w-sm backdrop-blur-md border border-white/20">
          <h2
            className="text-3xl font-semibold text-center mb-6 text-slate-900"
            style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}
          >
            Login
          </h2>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-8 h-12 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // Toggle type
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-8 h-12 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)} // Toggle visibility
                className="absolute right-[5%] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-gradient-to-tr from-blue-400 via-cyan-400 to-green-400 font-bold text-xl text-white rounded-md hover:bg-gradient-to-bl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};