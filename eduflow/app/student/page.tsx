"use client";
import { useEffect, useState } from "react";
import StudentLayout from "./StudentLayout";
import axios from "axios";
import { setToken } from "@/utils/util";
import dynamic from "next/dynamic";
import Loader from "@/components/utils/Loader";
import { number } from "echarts";

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
  maxmarks:number;
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

type Attendance = {
  daysPresent: number;
  daysAbsent: number;
};

type StudentDashboardData = {
  Assignments: AssignmentStats;
  quizzes: QuizStats;
  quizScores: QuizScore[];
  upcomingEvents: UpcomingEvent[];
  currentGrade: CurrentGrade;
  attendance: Attendance;
};

const Page = () => {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(
    null
  );

  const fetchDashboardData = async () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!dashboardData) return <Loader />;

  // Chart options for different visualizations
  const assignmentOption = {
    color: ["#10B981", "#F59E0B", "#EF4444", "#6B7280"],
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c}",
          fontSize: 14,
          color: "#333",
        },
        labelLine: {
          show: true,
          length: 15,
        },
        data: [
          { value: dashboardData.Assignments.submittedontime, name: "On Time" },
          { value: dashboardData.Assignments.submittedlate, name: "Late" },
          { value: dashboardData.Assignments.missed, name: "Missed" },
          { value: dashboardData.Assignments.currentpending, name: "Pending" },
        ],
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
          { value: dashboardData.attendance.daysPresent, name: "Present" },
          { value: dashboardData.attendance.daysAbsent, name: "Absent" },
        ],
      },
    ],
  };

  const quizScoresOption = {
    color: ["#0F766E"],
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dashboardData.quizScores.map((quiz) => 
        quiz.quiztitle.length > 15 
          ? quiz.quiztitle.substring(0, 15) + "..." 
          : quiz.quiztitle
      ),
    },
    yAxis: { 
      type: "value",
      max: 100,
      name: "Score (%)"
    },
    series: [
      {
        type: "bar",
        data: dashboardData.quizScores.map((quiz) => Number(((quiz.score/quiz.maxmarks)*100).toFixed(2))),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const upcomingEventsOption = {
    color: ["#0F766E", "#F59E0B", "#10B981", "#8B5CF6"],
    tooltip: { 
      trigger: "item",
      formatter: function(params: any) {
        const event = dashboardData.upcomingEvents[params.dataIndex];
        const date = new Date(event.startdate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return `${event.title}<br/>${event.eventtype}<br/>${date}`;
      }
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside",
          formatter: "{b}",
          fontSize: 12,
          color: "#333",
        },
        labelLine: {
          show: true,
          length: 10,
        },
        data: dashboardData.upcomingEvents.map((event) => ({
          value: 1,
          name: event.title.length > 20 ? event.title.substring(0, 20) + "..." : event.title
        })),
      },
    ],
  };

  return (
    <StudentLayout activeLink="/student">
      <div className="p-6 min-h-max bg-teal-50">
        {/* Header Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">Current Grade</h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              {dashboardData.currentGrade.grade}
            </p>
          </div>
          
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">Total Assignments</h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              {dashboardData.Assignments.totalhomeworks}
            </p>
          </div>
          
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">Quizzes Attempted</h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              {dashboardData.quizzes.quizattempted}
            </p>
          </div>
          
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <h2 className="font-semibold text-teal-700">Upcoming Events</h2>
            <p className="text-3xl font-bold text-teal-900 mt-2">
              {dashboardData.upcomingEvents.length}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              Assignment Status
            </h3>
            <ReactECharts option={assignmentOption} className="w-full h-64" />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              Attendance Overview
            </h3>
            <ReactECharts option={attendanceOption} className="w-full h-64" />
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">
              Quiz Performance
            </h3>
            <ReactECharts option={quizScoresOption} className="w-full h-64" />
          </div>
        </div>

        {/* Detailed Tables and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz Scores Table */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-teal-900 mb-5">
              Quiz Performance Details
            </h2>
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
                    <tr key={index} className="border-t hover:bg-teal-50">
                      <td className="p-3 font-medium">{quiz.quiztitle}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          quiz.score >= 80 ? 'bg-green-100 text-green-800' :
                          quiz.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quiz.score}%
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(quiz.createdat).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-teal-900 mb-5">
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {dashboardData.upcomingEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-teal-500 pl-4 py-3 bg-teal-50 rounded-r-lg">
                  <h3 className="font-semibold text-teal-900 text-lg">
                    {event.title}
                  </h3>
                  <p className="text-teal-700 text-sm mb-2">
                    {event.eventtype}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {new Date(event.startdate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignment Details Table */}
        <div className="bg-white p-6 rounded-xl shadow-md mt-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-5">
            Assignment Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.Assignments.submittedontime}
              </p>
              <p className="text-green-700 font-medium">On Time</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-600">
                {dashboardData.Assignments.submittedlate}
              </p>
              <p className="text-yellow-700 font-medium">Late</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-600">
                {dashboardData.Assignments.missed}
              </p>
              <p className="text-red-700 font-medium">Missed</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-gray-600">
                {dashboardData.Assignments.currentpending}
              </p>
              <p className="text-gray-700 font-medium">Pending</p>
            </div>
            
            <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-2xl font-bold text-teal-600">
                {dashboardData.Assignments.totalhomeworks}
              </p>
              <p className="text-teal-700 font-medium">Total</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Page;
