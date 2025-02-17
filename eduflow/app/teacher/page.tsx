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

type events = {
  upcoming: string[];
  completed: string[];
  ongoing: string[];
}

type dashboardDataType = {
  studentCount: string;
  lastSalaryTransaction: SalaryTransaction;
  contentStats: ContentStats;
  totalVideoDuration: string;
  videosCreatedMonthly: VideoCreatedMonthly[];
  homeworkStats: HomeworkStats[];
  attendanceStats: AttendanceStats;
  videoWatchStats: VideoWatchStats[];
  events: events;
};
const Page = () => {
  const [dashboardData, setDashboardData] = useState<dashboardDataType | null>(
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

  const videoCreationOption = {
    color: ["#0F766E"],
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dashboardData.videosCreatedMonthly.map((d) =>
        new Date(d.month).toLocaleString("default", {
          month: "short",
          year: "numeric",
        })
      ),
    },
    yAxis: { type: "value" },
    series: [
      {
        type: "line",
        data: dashboardData.videosCreatedMonthly.map((d) => d.totalvideos),
        smooth: true,
      },
    ],
  };
  const attendanceOption = {
    color: ["#27cbbd", "#0F766E"],
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        data: [
          { value: dashboardData.attendanceStats.presentdays, name: "Present" },
          { value: dashboardData.attendanceStats.absentdays, name: "Absent" },
        ],
        animationType: "scale",
      },
    ],
  };

  const assignmentOption = {
    color: ["#0F766E", "#E11D48"],
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: dashboardData.homeworkStats.map((d) => d.title.split(" ")[0]),
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "Submitted",
        type: "bar",
        data: dashboardData.homeworkStats.map((d) => d.totalsubmitted),
      },
      {
        name: "Not Submitted",
        type: "bar",
        data: dashboardData.homeworkStats.map((d) => d.totalnotsubmitted),
      },
    ],
  };

  const eventOption = {
    color: ["#0F766E", "#F59E0B", "#10B981"],
    tooltip: { trigger: "item", formatter: "{b}: ({d}%)" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"], // Doughnut shape
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "outside", // Move labels outside the chart
          formatter: "{b}", // Show category, count, and percentage
          fontSize: 14,
          color: "#333",
        },
        labelLine: {
          show: true,
          length: 15, // Extend label lines for better readability
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          </div>
          <div className="bg-white py-3 rounded-xl shadow-md px-5 border-t-4 border-teal-700">
            <div className="flex items-center justify-left space-x-2 font-semibold text-teal-700">
              <span>Created</span>
              <select
                className="border border-teal-700 rounded-md px-3 py-1 text-teal-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 hover:bg-teal-100 transition"
                onChange={(e) => handleCreatedChange(e.target.value)}
              >
                <option
                  className="bg-teal-200 hover:bg-teal-500 hovertext-white"
                  value="courses"
                >
                  Courses
                </option>
                <option
                  className="bg-teal-200 hover:bg-teal-500 hovertext-white"
                  value="chapters"
                >
                  Chapters
                </option>
                <option
                  className="bg-teal-200 hover:bg-teal-500 hovertext-white"
                  value="topics"
                >
                  Topics
                </option>
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
              {Number(dashboardData.totalVideoDuration)/60} <span className="text-lg">mins</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Video Creation Trend", option: videoCreationOption },
            { title: "Attendance Overview", option: attendanceOption },
            { title: "Assignment Statistics", option: assignmentOption },
          ].map((chart, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-teal-700 mb-4">
                {chart.title}
              </h3>
              <ReactECharts option={chart.option} className="w-full h-64" />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="overflow-auto bg-white p-6 rounded-xl shadow-md mt-12 flex-grow">
            <h2 className="text-2xl font-semibold text-teal-900 mb-5">
              Video Performance
            </h2>
            <table className="min-w-full border rounded-lg">
              <thead className="bg-teal-700 text-white">
                <tr>
                  {[
                    "Topic Title",
                    "Students Watched",
                    "Time Watched (mins)",
                    "Avg Completion (%)",
                  ].map((header, index) => (
                    <th key={index} className="p-3 text-left">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboardData.videoWatchStats.map((video, index) => (
                  <tr key={index} className="border-t hover:bg-teal-50">
                    <td className="p-3">{video.topictitle}</td>
                    <td className="p-3 text-center">
                      {video.noofstudentswatched}
                    </td>
                    <td className="p-3 text-center">
                      {video.totaltimewatched}
                    </td>
                    <td className="p-3 text-center">
                      {video.averagecompletionpercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-md mt-12 min-w-[400px]">
  <h3 className="text-lg font-semibold px-4 text-teal-700 mb-4">Events Overview</h3>
  <ReactECharts option={eventOption} className="w-full h-64" />
</div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Page;
