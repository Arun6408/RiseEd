'use client';
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";


const Login = () => {
  const Router = useRouter();
  const [email, setEmail] = useState("superadmin@example.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      });
      const data = response.data;
      if(data.status !== "success") {
        console.error(data.message);
      }
      
      if(data.token) {
        const bearerToken = `Bearer ${data.token}`;
        localStorage.setItem("token", bearerToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      const user = data.user;
      if(user.role === "super_admin") {
        Router.push("/super_admin");
      } else if(user.role === "principal") {
        Router.push("/principal");
      } else if(user.role === "head_master") {
        Router.push("/head_master");
      } else if(user.role === "teacher") {
        Router.push("/teacher");
      } else if(user.role === "student") {
        Router.push("/student");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      Login Page
      <form onSubmit={(e) => handleSubmit(e)} className="flex gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="bg-transparent"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          className="bg-transparent"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
