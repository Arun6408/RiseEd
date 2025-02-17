"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { setToken } from "@/utils/util";
import cookie from "cookie";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  username: string;
}

const SuperAdmin = () => {
  const Router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setToken();
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/superAdmin/login`
        );
        setUsers(res.data.data.users);
      } catch (error) {
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLoginClick = async (username: string) => {
    try {
      setToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/superAdmin/login`,
        { username }
      );
      const data = res.data;
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
      const user = data.user;
      if (user.role === "superAdmin") Router.push("/superAdmin");
      else if (user.role === "principal") Router.push("/principal");
      else if (user.role === "headMaster") Router.push("/headMaster");
      else if (user.role === "teacher") Router.push("/teacher");
      else if (user.role === "student") Router.push("/student");
      else if (user.role === "parent") Router.push("/parent");
    } catch (error) {
      setUsers([]);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center p-10">
      <div
        className={`flex flex-col justify-start bg-white shadow-xl p-4 w-full rounded-xl h-full`}
      >
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="p-2 overflow-x-clip overflow-y-scroll">
            <div className="flex gap-2 flex-col my-2">
              <p className="text-xl font-semibold">Login As:</p>
              <div className="flex gap-4">
                <button
                  className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg"
                  onClick={() => handleLoginClick("principal")}
                >
                  <span className="font-semibold text-white">Principal</span>
                </button>
                <button
                  className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg"
                  onClick={() => handleLoginClick("headMaster")}
                >
                  <span className="font-semibold text-white">HeadMaster</span>
                </button>
                <button
                  className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg"
                  onClick={() => handleLoginClick("teacher1")}
                >
                  <span className="font-semibold text-white">Teacher</span>
                </button>
                <button
                  className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg"
                  onClick={() => handleLoginClick("student1")}
                >
                  <span className="font-semibold text-white">Student</span>
                </button>
                <button
                  className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg"
                  onClick={() => handleLoginClick("parent1")}
                >
                  <span className="font-semibold text-white">Parent</span>
                </button>
              </div>
            </div>
            <h2 className="font-bold text-2xl">List of Users:</h2>
            <table className="table-auto w-full mt-4 border border-gray-300 m-2 ">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-200 hover:bg-gray-100">
                  <th className="px-4 py-2 text-left">S.No</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-100 border-gray-200"
                  >
                    <td className="px-4 py-2 text-left">{index + 1}</td>
                    <td className="px-4 py-2 text-left">{user.name}</td>
                    <td className="px-4 py-2 text-left">{user.email}</td>
                    <td className="px-4 py-2 text-left">{user.role}</td>
                    <td className="px-4 py-2 text-left">{user.username}</td>
                    <td className="px-4 py-2 text-left">
                      <button
                        className="bg-teal-500 px-6 py-2 rounded-lg text-white hover:bg-teal-600"
                        onClick={() => {
                          handleLoginClick(user.username);
                        }}
                      >
                        Login
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
