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
          `http://localhost:5000/api/auth/superAdmin/login`
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
  }, [users]);

  const handleLoginClick = async (username: string) => {
    try {
      setToken();
      const res = await axios.post(
        `http://localhost:5000/api/auth/superAdmin/login`,
        { username }
      );
      const data = res.data;
      console.log(res.data);
      if (data.status !== "success") {
        console.error(data.message);
      }
      if (data.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.token);
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
    } catch (error) {
      console.error(error);
      setUsers([]);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center p-10">
      <div
        className={`flex flex-col justify-start bg-white shadow-xl p-4 w-full rounded-xl h-full`}
        
      >
        <h2 className="font-bold text-2xl">List of Users</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="p-2 overflow-x-clip overflow-y-scroll">
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
                {users.map((user,index) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-100 border-gray-200"
                  >
                    <td className="px-4 py-2 text-left">{index+1}</td>
                    <td className="px-4 py-2 text-left">{user.name}</td>
                    <td className="px-4 py-2 text-left">{user.email}</td>
                    <td className="px-4 py-2 text-left">{user.role}</td>
                    <td className="px-4 py-2 text-left">{user.username}</td>
                    <td className="px-4 py-2 text-left">
                      <button
                        className="bg-blue-500 px-6 py-2 rounded-lg text-white hover:bg-blue-400"
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
