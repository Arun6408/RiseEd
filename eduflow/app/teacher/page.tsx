"use client";
import { useEffect, useState } from "react";
import TeacherLayout from "./TeacherLayout";
import axios from "axios";
import { setToken } from "@/utils/util";
import dynamic from "next/dynamic";
import Loader from "@/components/utils/Loader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SalaryTransaction = {
  salarymonth: string;
  amount: string;
  status: string;
  transactiondate: string;
};

type ContentStats = {
  noofcourses: string;
  noofchapters: string;
  nooftopics: string;
};

type VideoCreatedMonthly = {
  month: string;
  totalvideos: string;
};

type HomeworkStats = {
  homeworkid: number;
  title: string;
  totalsubmitted: string;
  totalnotsubmitted: string;
};

type AttendanceStats = {
  presentdays: string;
  absentdays: string;
};

type VideoWatchStats = {
  topictitle: string;
  noofstudentswatched: string;
  totaltimewatched: string;
  averagecompletionpercentage: string;
};

type Events = {
  upcoming: string[];
  completed: string[];
  ongoing: string[];
};

type DashboardDataType = {
  studentCount: string;
  lastSalaryTransaction: SalaryTransaction;
  contentStats: ContentStats;
  totalVideoDuration: string;
  videosCreatedMonthly: VideoCreatedMonthly[];
  homeworkStats: HomeworkStats[];
  attendanceStats: AttendanceStats;
  videoWatchStats?: VideoWatchStats[];
  events: Events;
  quizScores?: any[];
};

const Page = () => {
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(
    null
  );
  const [currNoofCreations, setCurrNoofCreations] = useState<string>("courses");

  const handleCreatedChange = (val: string) => {
    setCurrNoofCreations(val);
  };

  const fetchDashboardData = async () => {
    try {
      setToken();
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/teacher/dashboard`
      );
      setDashboardData(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!dashboardData) return <Loader />;

  // Chart options for different visualizations
  const videoCreationOption = {
    color: ["#0F766E"],
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dashboardData.videosCreatedMonthly.length > 0 
        ? dashboardData.videosCreatedMonthly.map((d) =>
            new Date(d.month).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })
          )
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    },
    yAxis: { type: "value" },
    series: [
      {
        type: "line",
        data: dashboardData.videosCreatedMonthly.length > 0 
          ? dashboardData.videosCreatedMonthly.map((d) => d.totalvideos)
          : [0, 0, 0, 0, 0, 0],
        smooth: true,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const attendanceOption = {
    color: ["#10B981", "#EF4444"],
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c} days",
          fontSize: 14,
          color: "#333",
        },
        labelLine: {
          show: true,
          length: 15,
        },
        data: [
          { value: dashboardData.attendanceStats.presentdays, name: "Present" },
          { value: dashboardData.attendanceStats.absentdays, name: "Absent" },
        ],
        animationType: "scale",
      },
    ],
  };

  const assignmentOption = {
    color: ["#10B981", "#EF4444"],
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dashboardData.homeworkStats.map((d) => 
        d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title
      ),
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "Submitted",
        type: "bar",
        data: dashboardData.homeworkStats.map((d) => d.totalsubmitted),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: "Not Submitted",
        type: "bar",
        data: dashboardData.homeworkStats.map((d) => d.totalnotsubmitted),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const eventOption = {
    color: ["#0F766E", "#F59E0B", "#10B981"],
    tooltip: { trigger: "item", formatter: "{b}: ({d}%)" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}",
          fontSize: 14,
          color: "#333",
        },
        labelLine: {
          show: true,
          length: 15,
        },
        data: [
          { value: dashboardData.events.upcoming.length, name: "Upcoming" },
          { value: dashboardData.events.ongoing.length, name: "Ongoing" },
          { value: dashboardData.events.completed.length, name: "Completed" },
        ],
      },
    ],
  };

  return (
    <TeacherLayout activeLink="/teacher">
      <div className="p-6 min-h-max bg-teal-50">
        {/* Header Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">
              Total Students
            </h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              {dashboardData.studentCount}
            </p>
          </div>
          
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">Last Salary</h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              ₹{dashboardData.lastSalaryTransaction?.amount}
            </p>
            <p className="text-sm text-teal-600 mt-1">
              {dashboardData.lastSalaryTransaction?.salarymonth}
            </p>
          </div>
          
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <div className="flex items-center justify-left space-x-2 font-semibold text-teal-700">
              <span>Created</span>
              <select
                className="border border-teal-700 rounded-md px-3 py-1 text-teal-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 hover:bg-teal-100 transition"
                onChange={(e) => handleCreatedChange(e.target.value)}
              >
                <option value="courses">Courses</option>
                <option value="chapters">Chapters</option>
                <option value="topics">Topics</option>
              </select>
            </div>
            <p className="text-3xl font-bold text-teal-900 mt-3">
              {
                dashboardData.contentStats[
                  `noof${currNoofCreations}` as keyof ContentStats
                ]
              }
            </p>
          </div>

          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">
              All Videos Duration
            </h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              {Number(dashboardData.totalVideoDuration) > 0 
                ? `${(Number(dashboardData.totalVideoDuration) / 60).toFixed(1)}` 
                : "0"
              } <span className="text-lg">mins</span>
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              Video Creation Trend
            </h3>
            <ReactECharts option={videoCreationOption} className="w-full h-64" />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              Attendance Overview
            </h3>
            <ReactECharts option={attendanceOption} className="w-full h-64" />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              Assignment Statistics
            </h3>
            <ReactECharts option={assignmentOption} className="w-full h-64" />
          </div>
        </div>

        {/* Detailed Tables and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Homework Statistics Table */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-teal-900 mb-5">
              Homework Statistics
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="p-3 text-left">Assignment</th>
                    <th className="p-3 text-center">Submitted</th>
                    <th className="p-3 text-center">Not Submitted</th>
                    <th className="p-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.homeworkStats.map((homework, index) => (
                    <tr key={index} className="border-t hover:bg-teal-50">
                      <td className="p-3 font-medium">{homework.title}</td>
                      <td className="p-3 text-center">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {homework.totalsubmitted}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {homework.totalnotsubmitted}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold">
                        {Number(homework.totalsubmitted) + Number(homework.totalnotsubmitted)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Events Overview */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-teal-900 mb-5">
              Events Overview
            </h2>
            <ReactECharts option={eventOption} className="w-full h-64 mb-6" />
            
            {/* Events Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-2xl font-bold text-teal-600">
                  {dashboardData.events.upcoming.length}
                </p>
                <p className="text-teal-700 font-medium">Upcoming</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.events.ongoing.length}
                </p>
                <p className="text-yellow-700 font-medium">Ongoing</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.events.completed.length}
                </p>
                <p className="text-green-700 font-medium">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Creation Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-5">
            Content Creation Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData.contentStats.noofcourses}
              </p>
              <p className="text-blue-700 font-medium text-lg">Courses Created</p>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">
                {dashboardData.contentStats.noofchapters}
              </p>
              <p className="text-purple-700 font-medium text-lg">Chapters Created</p>
            </div>
            
            <div className="text-center p-6 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-3xl font-bold text-indigo-600">
                {dashboardData.contentStats.nooftopics}
              </p>
              <p className="text-indigo-700 font-medium text-lg">Topics Created</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        {dashboardData.events.upcoming.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md mt-8">
            <h2 className="text-xl font-semibold text-teal-900 mb-5">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.events.upcoming.map((event, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4 py-3 bg-teal-50 rounded-r-lg">
                  <h3 className="font-semibold text-teal-900 text-lg">
                    {event}
                  </h3>
                  <p className="text-teal-700 text-sm">
                    Upcoming Event
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default Page;
