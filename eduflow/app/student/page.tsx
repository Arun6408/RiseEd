"use client";
import React, { useEffect, useState } from "react";
import StudentLayout from "./StudentLayout";
import { setToken } from "@/utils/util";
import axios from "axios";
import dynamic from "next/dynamic";
import Loader from "@/components/utils/Loader";
import { FaGraduationCap, FaTasks, FaBrain, FaCoins } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import ZCoin from "@/components/utils/ZCoin";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type AssignmentStats = {
  totalhomeworks: string;
  submittedontime: string;
  submittedlate: string;
  missed: string;
  currentpending: string;
};

type QuizStats = {
  quizattempted: string;
};

type QuizScore = {
  createdat: string;
  score: number;
  quiztitle: string;
};

type ZcoinSummary = {
  userid: number;
  coursebought: string;
  quizzesbought: string;
  topicearnings: string;
  homeworkearnings: string;
  quizearnings: string;
};

type UpcomingEvent = {
  id: number;
  title: string;
  eventtype: string;
  startdate: string;
};

type CurrentGrade = {
  grade: string;
};

type AttendanceStats = {
  daysPresent: number;
  daysAbsent: number;
};

type DashboardDataType = {
  Assignments: AssignmentStats;
  quizzes: QuizStats;
  quizScores: QuizScore[];
  zcoinSummary: ZcoinSummary;
  upcomingEvents: UpcomingEvent[];
  currentGrade: CurrentGrade;
  attendance: AttendanceStats;
};

const Page = () => {
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setToken();
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/student/dashboard`
        );
        setDashboardData(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  if (!dashboardData) return <Loader />;

  const assignmentOption = {
    color: ["#0F766E", "#E11D48", "#F59E0B"],
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#0F766E",
      borderWidth: 1,
      textStyle: {
        color: "#333",
        fontSize: 14,
      },
    },
    legend: {
      orient: "vertical",
      right: 0,
      top: 0,
      textStyle: {
        color: "#333",
        fontSize: 14,
      },
      itemGap: 10,
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: "pie",
        radius: ["50%", "70%"],
        center: ["50%", "60%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c}",
          fontSize: 14,
          color: "#333",
          fontWeight: "bold",
          distance: 20,
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 20,
          smooth: true,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
        data: [
          {
            value: dashboardData.Assignments.submittedontime,
            name: "Submitted on Time",
          },
          {
            value: dashboardData.Assignments.submittedlate,
            name: "Submitted Late",
          },
          { value: dashboardData.Assignments.missed, name: "Missed" },
        ],
        animationType: "scale",
        animationEasing: "elasticOut",
        animationDelay: function (idx: number) {
          return idx * 100;
        },
      },
    ],
  };

  const attendanceOption = {
    color: ["#27cbbd", "#0F766E"],
    tooltip: { trigger: "item" },
    legend: {
      orient: "vertical",
      right: 10,
      top: "top",
    },
    series: [
      {
        type: "pie",
        data: [
          { value: dashboardData.attendance.daysPresent, name: "Present" },
          { value: dashboardData.attendance.daysAbsent, name: "Absent" },
        ],
        animationType: "scale",
      },
    ],
  };

  const zcoinOption = {
    color: ["#0F766E", "#27cbbd", "#10B981", "#E11D48", "#F59E0B"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: "{b}: {c}",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#0F766E",
      borderWidth: 1,
      textStyle: {
        color: "#333",
        fontSize: 14,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ["Earned", "Spent"],
      axisLabel: {
        color: "#333",
        fontSize: 14,
        fontWeight: "bold",
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#333",
        fontSize: 14,
        formatter: "{value}",
      },
    },
    series: [
      {
        type: "bar",
        barWidth: "40%",
        data: [
          {
            value: Number(dashboardData.zcoinSummary.quizearnings) +
              Number(dashboardData.zcoinSummary.homeworkearnings) +
              Number(dashboardData.zcoinSummary.topicearnings),
            itemStyle: { color: "#0F766E" },
          },
          {
            value: Number(dashboardData.zcoinSummary.coursebought) +
              Number(dashboardData.zcoinSummary.quizzesbought),
            itemStyle: { color: "#E11D48" },
          },
        ],
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          fontSize: 14,
          color: "#333",
          fontWeight: "bold",
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.2)",
          },
        },
      },
    ],
  };

  return (
    <StudentLayout activeLink="/student">
      <div className="p-6 min-h-max bg-gradient-to-br from-teal-50 to-teal-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white py-6 rounded-xl shadow-lg px-5 border-t-4 border-teal-700 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaGraduationCap className="text-teal-700 text-xl" />
              </div>
              <h2 className="font-semibold text-teal-700">Current Grade</h2>
            </div>
            <p className="text-4xl font-bold text-teal-900">
              {dashboardData.currentGrade.grade}
            </p>
          </div>
          <div className="bg-white py-6 rounded-xl shadow-lg px-5 border-t-4 border-teal-700 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaTasks className="text-teal-700 text-xl" />
              </div>
              <h2 className="font-semibold text-teal-700">Total Assignments</h2>
            </div>
            <p className="text-4xl font-bold text-teal-900">
              {dashboardData.Assignments.totalhomeworks}
            </p>
          </div>
          <div className="bg-white py-6 rounded-xl shadow-lg px-5 border-t-4 border-teal-700 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaBrain className="text-teal-700 text-xl" />
              </div>
              <h2 className="font-semibold text-teal-700">Quizzes Attempted</h2>
            </div>
            <p className="text-4xl font-bold text-teal-900">
              {dashboardData.quizzes.quizattempted}
            </p>
          </div>
          <div className="bg-white py-6 rounded-xl shadow-lg px-5 border-t-4 border-teal-700 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaCoins className="text-teal-700 text-xl" />
              </div>
              <h2 className="font-semibold text-teal-700">Total Zcoins</h2>
            </div>
            <div className="flex items-center space-x-1">
              <ZCoin />
              <p className="text-4xl font-bold text-teal-900">
              {Number(dashboardData.zcoinSummary.quizearnings) +
                Number(dashboardData.zcoinSummary.homeworkearnings) +
                Number(dashboardData.zcoinSummary.topicearnings) -
                Number(dashboardData.zcoinSummary.coursebought) -
                Number(dashboardData.zcoinSummary.quizzesbought)}
            </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <BsGraphUp className="text-teal-700 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-teal-700">
                Assignment Status
              </h3>
            </div>
            <ReactECharts option={assignmentOption} className="w-full h-64" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaCoins className="text-teal-700 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-teal-700">
                Zcoin Distribution
              </h3>
            </div>
            <ReactECharts option={zcoinOption} className="w-full h-64" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaGraduationCap className="text-teal-700 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-teal-700">
                Attendance Overview
              </h3>
            </div>
            <ReactECharts option={attendanceOption} className="w-full h-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FaBrain className="text-teal-700 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-teal-700">
                Quiz Scores
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="p-3 text-left">Quiz Title</th>
                    <th className="p-3 text-left">Score</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.quizScores.map((quiz, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-teal-50 transition-colors duration-200"
                    >
                      <td className="p-3">{quiz.quiztitle}</td>
                      <td className="p-3">{quiz.score}</td>
                      <td className="p-3">
                        {new Date(quiz.createdat).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <MdEvent className="text-teal-700 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-teal-700">
                Upcoming Events
              </h3>
            </div>
            <div className="space-y-4">
              {dashboardData.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="border-l-4 border-teal-700 pl-4 py-3 hover:bg-teal-50 rounded-r-lg transition-colors duration-200"
                >
                  <h4 className="font-medium text-teal-900">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {event.eventtype} •{" "}
                    {new Date(event.startdate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Page;
