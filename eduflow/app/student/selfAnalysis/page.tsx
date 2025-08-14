"use client";
import { useEffect, useState } from "react";
import StudentLayout from "../StudentLayout";
import axios from "axios";
import { setToken } from "@/utils/util";
import dynamic from "next/dynamic";
import Loader from "@/components/utils/Loader";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type SubjectPerformance = {
  department: string;
  quizzestaken: string;
  avgscore: string | null;
  homeworkassigned: string;
  homeworksubmitted: string;
  avghomeworkgrade: string;
};

type LearningTrend = {
  month: string;
  quizzestaken: string;
  avgscore: string;
  homeworksubmitted: string;
  avghomeworkgrade: string;
};

type DifficultyAnalysis = {
  difficulty: string;
  questionsattempted: string;
  correctanswers: string;
  accuracypercentage: string;
};

type TimeManagement = {
  quizid: number;
  quiztitle: string;
  timespent: number;
  totalques: number;
  avgtimeperquestion: string;
  timeefficiency: string;
};

type PeerComparison = {
  classavgquizscore: string;
  classavghomeworkgrade: string;
  totalclassstudents: string;
};

type StudyPattern = {
  studyhour: string;
  activitycount: string;
  activitytype: string;
};

type WeakArea = {
  question: string;
  difficulty: string;
  correctcount: number;
  wrongcount: number;
  skippedcount: number;
  understandinglevel: string;
};

type AttendancePattern = {
  dayofweek: string;
  dayspresent: string;
  dayname: string;
};

type CourseProgress = {
  coursetitle: string;
  department: string;
  totalchapters: string;
  totaltopics: string;
  completionpercentage: string;
};

type ImprovementTrend = {
  period: string;
  avgquizscore: string | null;
  avghomeworkgrade: string | null;
};

type SelfAnalysisData = {
  subjectPerformance: SubjectPerformance[];
  learningTrends: LearningTrend[];
  difficultyAnalysis: DifficultyAnalysis[];
  timeManagement: TimeManagement[];
  peerComparison: PeerComparison;
  studyPatterns: StudyPattern[];
  weakAreas: WeakArea[];
  attendancePattern: AttendancePattern[];
  courseProgress: CourseProgress[];
  learningConsistency: { consistencyscore: string };
  improvementTrends: ImprovementTrend[];
  insights: string[];
};

const SelfAnalysisPage = () => {
  const [analysisData, setAnalysisData] = useState<SelfAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysisData = async () => {
    try {
      setToken();
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/student/selfAnalysis`
      );
      setAnalysisData(data.data);
    } catch (error) {
      console.error("Error fetching self-analysis data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  if (loading) return <Loader />;
  if (!analysisData) return <div>No data available</div>;

  // Chart options
  const subjectPerformanceOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Quizzes Taken", "Homework Submitted", "Avg Quiz Score", "Avg Homework Grade"] },
    xAxis: { type: "category", data: analysisData.subjectPerformance.map(subj => subj.department) },
    yAxis: [
      { type: "value", name: "Count", position: "left" },
      { type: "value", name: "Score/Grade", position: "right", max: 10 }
    ],
    series: [
      {
        name: "Quizzes Taken",
        type: "bar",
        data: analysisData.subjectPerformance.map(subj => parseInt(subj.quizzestaken)),
        itemStyle: { color: "#10B981" }
      },
      {
        name: "Homework Submitted",
        type: "bar",
        data: analysisData.subjectPerformance.map(subj => parseInt(subj.homeworksubmitted)),
        itemStyle: { color: "#3B82F6" }
      },
      {
        name: "Avg Quiz Score",
        type: "line",
        yAxisIndex: 1,
        data: analysisData.subjectPerformance.map(subj => subj.avgscore ? parseFloat(subj.avgscore) : 0),
        itemStyle: { color: "#F59E0B" }
      },
      {
        name: "Avg Homework Grade",
        type: "line",
        yAxisIndex: 1,
        data: analysisData.subjectPerformance.map(subj => parseFloat(subj.avghomeworkgrade)),
        itemStyle: { color: "#8B5CF6" }
      }
    ]
  };

  const difficultyAnalysisOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: analysisData.difficultyAnalysis.map(diff => ({
          value: parseFloat(diff.accuracypercentage),
          name: `${diff.difficulty} (${diff.accuracypercentage}%)`
        })),
        itemStyle: {
          color: (params: any) => {
            const colors = ["#10B981", "#F59E0B", "#EF4444"];
            return colors[params.dataIndex % colors.length];
          }
        }
      }
    ]
  };

  const timeManagementOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: analysisData.timeManagement.map(tm => tm.quiztitle) },
    yAxis: [
      { type: "value", name: "Time (minutes)" },
      { type: "value", name: "Questions" }
    ],
    series: [
      {
        name: "Time Spent",
        type: "bar",
        data: analysisData.timeManagement.map(tm => tm.timespent),
        itemStyle: { color: "#3B82F6" }
      },
      {
        name: "Total Questions",
        type: "line",
        yAxisIndex: 1,
        data: analysisData.timeManagement.map(tm => tm.totalques),
        itemStyle: { color: "#EF4444" }
      }
    ]
  };

  const studyPatternsOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: analysisData.studyPatterns.map(pattern => ({
          value: parseInt(pattern.activitycount),
          name: `${pattern.studyhour}:00 - ${pattern.activitytype}`
        })),
        itemStyle: {
          color: (params: any) => {
            const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"];
            return colors[params.dataIndex % colors.length];
          }
        }
      }
    ]
  };

  const courseProgressOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "gauge",
        progress: { show: true },
        detail: { valueAnimation: true, formatter: "{value}%" },
        data: analysisData.courseProgress.map(course => ({
          value: parseFloat(course.completionpercentage),
          name: course.coursetitle
        }))
      }
    ]
  };

  const getUnderstandingLevelColor = (level: string) => {
    switch (level) {
      case "Fully Understood": return "bg-green-100 text-green-800";
      case "Partially Understood": return "bg-yellow-100 text-yellow-800";
      case "Needs Improvement": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case "Fast": return "bg-green-100 text-green-800";
      case "Normal": return "bg-blue-100 text-blue-800";
      case "Slow": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <StudentLayout activeLink="/student/selfAnalysis">
      <div className="p-6 min-h-max bg-gradient-to-br from-teal-50 to-blue-50">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-900 mb-2">Self Analysis Dashboard</h1>
          <p className="text-teal-700">Deep insights into your learning journey and performance patterns</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
            <h3 className="text-sm font-medium text-teal-600">Learning Consistency</h3>
            <p className="text-2xl font-bold text-teal-900">
              {(parseFloat(analysisData.learningConsistency.consistencyscore) * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-blue-600">Class Average Quiz Score</h3>
            <p className="text-2xl font-bold text-blue-900">
              {parseFloat(analysisData.peerComparison.classavgquizscore).toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-green-600">Class Average Homework Grade</h3>
            <p className="text-2xl font-bold text-green-900">
              {parseFloat(analysisData.peerComparison.classavghomeworkgrade).toFixed(1)}/10
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-purple-600">Total Class Students</h3>
            <p className="text-2xl font-bold text-purple-900">
              {analysisData.peerComparison.totalclassstudents}
            </p>
          </div>
        </div>

        {/* Subject Performance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Subject Performance Overview</h2>
          <ReactECharts option={subjectPerformanceOption} className="w-full h-80" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Difficulty Analysis</h3>
            <ReactECharts option={difficultyAnalysisOption} className="w-full h-64" />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Study Patterns by Hour</h3>
            <ReactECharts option={studyPatternsOption} className="w-full h-64" />
          </div>
        </div>

        {/* Time Management and Course Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Time Management Analysis</h3>
            <ReactECharts option={timeManagementOption} className="w-full h-64" />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Course Progress</h3>
            <ReactECharts option={courseProgressOption} className="w-full h-64" />
          </div>
        </div>

        {/* Weak Areas Analysis */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Weak Areas & Understanding Levels</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="p-3 text-left">Question</th>
                  <th className="p-3 text-left">Difficulty</th>
                  <th className="p-3 text-left">Performance</th>
                  <th className="p-3 text-left">Understanding Level</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.weakAreas.map((area, index) => (
                  <tr key={index} className="border-t hover:bg-teal-50">
                    <td className="p-3 font-medium max-w-xs truncate">{area.question}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                        area.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {area.difficulty}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>Correct: {area.correctcount}</div>
                        <div>Wrong: {area.wrongcount}</div>
                        <div>Skipped: {area.skippedcount}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUnderstandingLevelColor(area.understandinglevel)}`}>
                        {area.understandinglevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time Management Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Detailed Time Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisData.timeManagement.map((tm, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-teal-800 mb-2">{tm.quiztitle}</h4>
                <div className="space-y-2 text-sm">
                  <div>Time Spent: {tm.timespent} min</div>
                  <div>Questions: {tm.totalques}</div>
                  <div>Avg Time/Question: {tm.avgtimeperquestion} min</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeEfficiencyColor(tm.timeefficiency)}`}>
                      {tm.timeefficiency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Pattern */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Attendance Pattern</h2>
          <div className="grid grid-cols-7 gap-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
              const attendance = analysisData.attendancePattern.find(att => 
                parseInt(att.dayofweek) === (index + 1) % 7 || (index + 1) % 7 === 0 ? 7 : (index + 1) % 7
              );
              return (
                <div key={day} className="text-center">
                  <div className="text-sm font-medium text-teal-700 mb-2">{day}</div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    attendance ? "bg-green-500" : "bg-gray-300"
                  }`}>
                    {attendance ? attendance.dayspresent : "0"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course Progress Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Course Progress Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisData.courseProgress.map((course, index) => (
              <div key={index} className="border rounded-lg p-6 bg-gradient-to-r from-teal-50 to-blue-50">
                <h3 className="text-lg font-semibold text-teal-800 mb-3">{course.coursetitle}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-teal-700">Department:</span>
                    <span className="font-medium">{course.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700">Chapters:</span>
                    <span className="font-medium">{course.totalchapters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700">Topics:</span>
                    <span className="font-medium">{course.totaltopics}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-teal-700">Completion</span>
                      <span className="font-bold text-teal-800">{course.completionpercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${course.completionpercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">AI-Generated Insights</h2>
          <div className="space-y-4">
            {analysisData.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-blue-500 text-xl">💡</div>
                <p className="text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-teal-900 mb-4">Improvement Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisData.improvementTrends.map((trend, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-teal-800 mb-3">{trend.period}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-teal-700">Quiz Score:</span>
                    <span className="font-medium">
                      {trend.avgquizscore ? `${trend.avgquizscore}%` : "No data"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700">Homework Grade:</span>
                    <span className="font-medium">
                      {trend.avghomeworkgrade ? `${trend.avghomeworkgrade}/10` : "No data"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default SelfAnalysisPage;
