"use client";
import React, { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "axios";
import { setToken } from "@/utils/util";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaMoneyBillWave,
  FaFileInvoice,
} from "react-icons/fa";
import Loader from "@/components/utils/Loader";

interface Salary {
  id: number;
  basic: string;
  rentallowance: string;
  foodallowance: string;
  travelallowance: string;
  otherallowance: string;
  taxdeduction: string;
  providentfund: string;
  otherdeductions: string;
  netsalary: string;
}

interface Transaction {
  id: number;
  transactiondate: string;
  transactionid: string;
  salarymonth: string;
  amount: string;
  status: string;
  payslipurl: string | null;
}

interface User {
  name: string;
  role: string;
  email: string;
  phone: string;
  age: number;
  joinedat: string;
}

interface UserDetails {
  department: string;
  assignedclasses: string;
}

interface ApiResponse {
  salaries: Salary[];
  transactions: Transaction[];
  user: User;
  userDetails: UserDetails;
}

const TeacherProfile: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setToken();
        const response = await axios.get<ApiResponse>(
          process.env.NEXT_PUBLIC_API_URL + "/salaries"
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (!data)
    return (
      <Loader/>
    );

  const { user, userDetails, salaries, transactions } = data;
  const salary = salaries[0];

  return (
    <TeacherLayout activeLink="/teacher/profile">
      <motion.div
        className="p-10 min-h-max overflow-x-hidden text-teal-900 w-full bg-gradient-to-br from-teal-50 to-teal-200 transition-all"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-extrabold text-teal-100 dark:text-teal-200 text-center mb-12 shadow-lg py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700">
          Teacher Profile
        </h1>

        <motion.div
          className="glass-card my-5"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold py-2">Personal Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xl text-teal-900 dark:text-teal-200">
            <div className="flex gap-2">
              <FaUser className="icon" /> <strong>Name:</strong> {user.name}
            </div>
            <div className="flex gap-2">
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            </div>
            <div className="flex gap-2">
              <FaEnvelope className="icon" /> <strong>Email:</strong>{" "}
              {user.email}
            </div>
            <div className="flex gap-2">
              <FaPhone className="icon" /> <strong>Phone:</strong> {user.phone}
            </div>
            <div>
              <strong>Age:</strong> {user.age}
            </div>
            <div>
              <strong>Joined At:</strong>{" "}
              {new Date(user.joinedat).toDateString()}
            </div>
            <div className="flex gap-2">
              <FaUniversity className="icon" /> <strong>Department:</strong>{" "}
              {userDetails.department}
            </div>
            <p>
              <strong>Assigned Classes:</strong> {userDetails.assignedclasses}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="glass-card my-6 rounded-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="section-title">Salary Breakdown</h2>
          <div className="text-xl text-teal-900 px-5 py-3 bg-teal-100">
            <div className="flex justify-between font-bold text-green-700  pr-7 py-1">
              <span>Basic Salary:</span>
              <span className="text-green-700 ">
                ₹{salary.basic}
              </span>
            </div>
            <div className="flex flex-col w-full">
            <h3 className="text-2xl font-semibold text-green-700">
            Allowances
            </h3>
              <p className="w-full flex justify-between  text-green-700 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Rent Allowance:{" "}
                <span className="">+₹{salary.rentallowance}</span>
              </p>
              <p className="w-full flex justify-between  text-green-700 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Food Allowance:{" "}
                <span className="">+₹{salary.foodallowance}</span>
              </p>
              <p className="w-full flex justify-between  text-green-700 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Travel Allowance:{" "}
                <span className="">
                  +₹{salary.travelallowance}
                </span>
              </p>
              <p className="w-full flex justify-between  text-green-700 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Other Allowance:{" "}
                <span className="text-teal-700">+₹{salary.otherallowance}</span>
              </p>
            </div>
            <h3 className="text-2xl font-semibold  text-red-600  dark:text-teal-300 mt-4">
              Deductions
            </h3>
            <div className="flex flex-col">
            <p className="w-full flex justify-between  text-red-500 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Tax Deduction:{" "}
                <span>-₹{salary.taxdeduction}</span>
              </p>
              <p className="w-full flex justify-between  text-red-500 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Provident Fund:{" "}
                <span>-₹{salary.providentfund}</span>
              </p>
              <p className="w-full flex justify-between text-red-500 hover:bg-teal-300 px-7 py-1 rounded-lg">
                Other Deductions:{" "}
                <span>
                  -₹{salary.otherdeductions}
                </span>
              </p>
            </div>
            <div className="border-t-4 border-teal-600 mt-6 pt-3 flex justify-between text-2xl font-extrabold">
              <span>Net Salary:</span>
              <span className="text-teal-800">₹{salary.netsalary}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="glass-card my-5"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 className="section-title">Transactions</h2>
          <table className="w-full border-collapse bg-teal-50 text-lg text-left text-teal-900 dark:text-teal-200">
            <thead className="bg-gradient-to-t from-teal-200 to-teal-400  dark:bg-teal-700">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Salary Month</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="text-base border-t border-teal-200">
                  <td className="px-4 py-3">
                    {new Date(t.transactiondate).toDateString()}
                  </td>
                  <td className="px-4 py-3">{t.transactionid}</td>
                  <td className="px-4 py-3">{t.salarymonth}</td>
                  <td className="px-4 py-3">₹{t.amount}</td>
                  <td className={`px-2 py-2 text-white`}><p className={`w-fit px-2 py-1 rounded-md ${t.status==='Paid'?' bg-green-400':t.status === 'Pending'?'bg-yellow-400':'bg-red-400'}`}>{t.status}</p></td>
                  <td className="px-4 py-3">
                    {t.payslipurl ? (
                      <a href={t.payslipurl} className="text-teal-600">
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 30px rgba(0, 255, 255, 0.3);
        }
        .section-title {
          font-size: 2rem;
          font-weight: bold;
          color: #005f73;
        }
        .icon {
          color: #008080;
          margin-right: 5px;
        }
      `}</style>
    </TeacherLayout>
    
  );
};

export default TeacherProfile;
