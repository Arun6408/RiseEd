"use client";
import { useSearchParams } from "next/navigation";
import StudentLayout from "../../StudentLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { handleUpload, setToken } from "@/utils/util";

type HomeWork = {
  homeworkid: string;
  createdbyuserid: string;
  title: string;
  description: string;
  assignedclasses: string;
  duedate: string;
  filetype: string;
  fileurl: string;
  createdat: string;
  teachername: string;
};

const SubmitHomeworkPage = () => {
  const searchParams = useSearchParams();
  const [homeworkId, setHomeworkId] = useState<string | null>(null);
  const [homeworkData, setHomeworkData] = useState<HomeWork | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    const id = searchParams.get("homeworkid");
    if (id) setHomeworkId(id);
  }, [searchParams]);

  useEffect(() => {
    const fetchHomework = async () => {
      if (homeworkId) {
        try {
          const url = `${process.env.NEXT_PUBLIC_API_URL}/homework?homeworkid=${homeworkId}`;
          setToken();
          const { data } = await axios.get(url);
          setHomeworkData(data.data[0]);
        } catch (error) {
          console.error("Error fetching homework", error);
        }
      }
    };
    fetchHomework();
  }, [homeworkId]);

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const uploadedUrl = await handleUpload(file, file.type);
    if (!uploadedUrl) {
      alert("File upload failed");
      return;
    }

    setFileUrl(uploadedUrl);
    setFileType(file.type);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/homework/submit`, {
        homeworkId,
        answerText,
        fileType: file.type,
        fileUrl: uploadedUrl,
      });
      alert("Homework submitted successfully");
    } catch (error) {
      console.error("Submission error", error);
    }
  };

  return (
    <StudentLayout activeLink="/student/homework">
      <div className="p-6 shadow-lg rounded-lg border border-gray-200">
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 text-white text-center py-6 rounded-t-lg">
          <h1 className="text-3xl font-bold">Submit Your Homework</h1>
        </div>

        {homeworkData && (
          <div className="p-6 bg-teal-50 rounded-lg shadow-md mt-4">
            <h2 className="text-2xl font-semibold text-teal-700">{homeworkData.title}</h2>
            <p className="text-gray-600 mt-2">{homeworkData.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-4 text-gray-700">
              <p><strong>Teacher:</strong> {homeworkData.teachername}</p>
              <p><strong>Class:</strong> {homeworkData.assignedclasses}</p>
              <p><strong>Due Date:</strong> {homeworkData.duedate.split('T')[0]}</p>
              <p><strong>File Type:</strong> {homeworkData.filetype}</p>
            </div>

            {homeworkData.fileurl && (
              <a
                href={homeworkData.fileurl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
              >
                View Attached File
              </a>
            )}
          </div>
        )}

        <div className="mt-6 bg-white shadow-md p-6 rounded-lg">
          <label className="block text-teal-700 font-semibold mb-2">Your Answer:</label>
          <textarea
            placeholder="Enter your answer"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="border border-teal-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <label className="block mt-4 text-teal-700 font-semibold">Attach File:</label>
          <div className="relative border border-teal-300 rounded-md p-2 cursor-pointer bg-white text-gray-700 hover:bg-teal-50">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="application.pdf"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <p className="text-center text-teal-600">Click to select a file</p>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-teal-500 text-white px-6 py-3 rounded-md hover:bg-teal-600 transition w-full text-lg font-semibold shadow-lg transform hover:scale-105"
          >
            Submit Homework
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default SubmitHomeworkPage;
