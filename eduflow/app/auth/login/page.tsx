'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import cookie from "cookie";

const Login = () => {
  const Router = useRouter();
  const [email, setEmail] = useState('superadmin@example.com');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      });
      const data = response.data;
      if (data.status !== 'success') {
        console.error(data.message);
      }

      if (data.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          document.cookie = cookie.serialize("user", JSON.stringify(data.user), {
            maxAge: 60 * 60 * 24 , 
            path: "/",
          });
        }
        console.log(axios.defaults.headers.common['Authorization']);
      }
      setTimeout(() => {
        console.log("This message is displayed after 5 seconds");
      }, 5000); 

      const user = data.user;
      if (user.role === 'superAdmin') {
        Router.push('/superAdmin');
      } else if (user.role === 'principal') {
        Router.push('/principal');
      } else if (user.role === 'headMaster') {
        Router.push('/head_master');
      } else if (user.role === 'teacher') {
        Router.push('/teacher');
      } else if (user.role === 'student') {
        Router.push('/student');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
