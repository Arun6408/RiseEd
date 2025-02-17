"use client";

import { useEffect, useState } from "react";
import TeacherLayout from "../../TeacherLayout";
import axios from "axios";
import { setToken } from "@/utils/util";
import Loader from "@/components/utils/Loader";

interface Submission {
  submissionId: number;
  studentId: number;
  studentName: string;
  studentClass: string;
  answerText: string;
  fileType: string;
  fileUrl: string;
  grade: number;
}

interface Homework {
  homeworkid: number;
  title: string;
  description: string;
  assignedclasses: string;
  duedate: string;
  filetype: string;
  fileurl: string;
  createdat: string;
  teachername: string;
  submissions: Submission[];
}

const HomeworkPage: React.FC = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        setToken();
        const response = await axios.get(`${API_URL}/homework/submit`);
        setHomeworks(response.data.data.homeworks);
      } catch (error) {
        console.error("Error fetching homework:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, []);

  const handleGrade = async (submissionId: number, grade:number) => {
    try {
      setToken();
      const {data} = await axios.patch(`${API_URL}/homework/submit`, { submissionId, grade});
      if (data.status === "success") {
        alert('Grade updated successfully');
      }
      else {
        alert('Failed to update grade. Please try again.');
      }
    } catch (error) {
      
    }
  };

  if (loading) return <Loader />;

  return (
    <TeacherLayout activeLink="/teacher/homework">
      <div className="container mx-auto p-8 bg-teal-50 rounded-3xl shadow-xl">
        <h1 className="text-5xl font-extrabold mb-12 text-teal-800 text-center tracking-wide">
          Homework Submissions
        </h1>
        {homeworks.length === 0 ? (
          <p className="text-center text-lg text-teal-600">
            No homework assigned yet.
          </p>
        ) : (
          homeworks.map((homework) => (
            <div
              key={homework.homeworkid}
              className="mb-12 transition-all transform hover:shadow-2xl rounded-xl p-8 bg-gradient-to-b from-teal-300 to-teal-600"
            >
              <h2 className="text-3xl font-semibold text-teal-800 mb-2">
                {homework.title}
              </h2>
              <p className="text-teal-700 text-lg mb-2">
                {homework.description}
              </p>
              <div className="flex gap-4 text-lg text-teal-700 mb-2">
                <div className="flex items-center">
                  <span className="material-icons text-teal-700 mr-2">
                    event
                  </span>
                  <span>
                    <strong>Due Date:</strong>{" "}
                    {new Date(homework.duedate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="material-icons text-teal-700 mr-2">
                    class
                  </span>
                  <span>
                    <strong>Assigned Classes:</strong>{" "}
                    {homework.assignedclasses}
                  </span>
                </div>
                <div className="flex items-center text-teal-700">
                  <span className="material-icons text-teal-700 mr-2">
                    attach_file
                  </span>
                  <span>
                    <strong>Attached Homework File:</strong>{" "}
                    <a
                      href={homework.fileurl}
                      target="_blank"
                      className="text-teal-700 underline hover:text-teal-900 transition-colors"
                    >
                      View File
                    </a>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-lg text-gray-800">
                  <thead className="bg-teal-100">
                    <tr>
                      <th className="border px-2 text-left text-teal-700">
                        Student Name
                      </th>
                      <th className="border px-2 text-left text-teal-700">
                        Class
                      </th>
                      <th className="border px-2 text-left text-teal-700">
                        Answer Text
                      </th>
                      <th className="border px-2 text-left text-teal-700">
                        File Submission
                      </th>
                      <th className="border px-2 text-left text-teal-700">
                        Grade
                      </th>
                      <th className="border p-5 text-left text-teal-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {homework.submissions.length > 0 ? (
                      homework.submissions.map((submission) => (
                        <tr
                          key={`${homework.homeworkid}-${submission.submissionId}-${submission.studentId}`}
                          className="transition-all hover:bg-teal-50 bg-teal-100 text-teal-700"
                        >
                          <td className="border px-4 py-2">
                            {submission.studentName}
                          </td>
                          <td className="border px-4 py-2">
                            {submission.studentClass}
                          </td>
                          <td className="border px-4 py-2">
                            {submission.answerText}
                          </td>
                          <td className="border px-4 py-2">
                            {submission.fileUrl ? (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                className="text-teal-500 underline hover:text-teal-700 transition-colors"
                              >
                                View Submission
                              </a>
                            ) : (
                              <span className="text-teal-400">
                                No file submitted
                              </span>
                            )}
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="number"
                              value={submission.grade || 0}
                              className="bg-transparent px-3 py-1 w-20 outline outline-1 outline-teal-800"
                              onChange={(e) => {
                                setHomeworks((prevHomeworks) =>
                                  prevHomeworks.map((hw) => ({
                                    ...hw,
                                    submissions: hw.submissions.map((sub) =>
                                      sub.submissionId === submission.submissionId
                                        ? { ...sub, grade: parseFloat(e.target.value)}
                                        : sub
                                    ),
                                  }))
                                );
                              }}
                              
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <button
                              onClick={() =>
                                handleGrade(submission.submissionId, submission.grade)
                              }
                              className="bg-teal-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 hover:shadow-xl transition-all duration-200 ease-in-out"
                            >
                              Update Grade
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center p-6 text-teal-400"
                        >
                          No submissions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </TeacherLayout>
  );
};

export default HomeworkPage;
