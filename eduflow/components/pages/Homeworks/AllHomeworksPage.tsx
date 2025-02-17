"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { getRole, getUserId, handleUpload, setToken } from "@/utils/util";
import Loader from "@/components/utils/Loader";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Homework =
  | {
      homeworkid: number;
      createdbyuserid: number;
      title: string;
      description: string;
      assignedclasses: string;
      duedate: string;
      filetype: string | null;
      fileurl: string | null;
      createdat: string;
      teachername: string;
      submittedStudents: string[];
      pendingStudents: string[];
      submittedCount: number;
      totalStudents: number;
      pendingSubmissions: number;
    }
  | {
      homeworkid: number;
      title: string;
      description: string;
      assignedclasses: string;
      duedate: string;
      filetype: string | null;
      fileurl: string | null;
      createdat: string;
      teachername: string;
    };

interface NewHomework {
  title: string;
  description: string;
  assignedClasses: string;
  fileType: string | null;
  fileUrl: string | null;
  dueDate: string;
}

const AllHomeworksPage = () => {
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [newHomework, setNewHomework] = useState<NewHomework>({
    title: "",
    description: "",
    assignedClasses: "",
    dueDate: "",
    fileType: null,
    fileUrl: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const userId = getUserId();

  const clearForm = () => {
    setNewHomework({
      title: "",
      description: "",
      assignedClasses: "",
      dueDate: "",
      fileType: null,
      fileUrl: null,
    });
    setSelectedFile(null);
  };

  useEffect(() => {
    const fetchHomeworks = async () => {
      try {
        setToken();
        const response = await axios.get(`${API_URL}/homework`);
        const formattedHomeworks = response.data.data.map((hw: Homework) => ({
          ...hw,
          duedate: new Date(hw.duedate).toISOString().split("T")[0],
        }));
        setHomeworks(formattedHomeworks);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching homeworks:", error);
      }
    };
    fetchHomeworks();
    setRole(getRole());
  }, []);

  const createHomework = async () => {
    try {
      if (selectedFile) {
        const fileUrl = await handleUpload(selectedFile, selectedFile?.type);
        newHomework.fileUrl = fileUrl;
      }
      setToken();
      await axios.post(`${API_URL}/homework`, newHomework);
      const response = await axios.get(`${API_URL}/homework`);
      const formattedHomeworks = response.data.data.map((hw: Homework) => ({
        ...hw,
        duedate: new Date(hw.duedate).toISOString().split("T")[0],
      }));
      setHomeworks(formattedHomeworks);
      alert("Homework created successfully");
      clearForm();
    } catch (error) {
      console.error("Error creating homework:", error);
    }
  };

  if (!isLoaded) return <Loader />;

  return (
    <div className="p-8 bg-teal-100 min-h-full">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-teal-700">
        Homeworks 📚
      </h1>

      {role !== "student" && (
        <div className="flex justify-center">
          <Modal>
            <ModalTrigger className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 transition">
              + Create Homework
            </ModalTrigger>
            <ModalBody>
              <ModalContent>
                <div className="p-6 bg-white rounded-lg shadow-xl">
                  <h2 className="text-2xl font-bold mb-4 text-teal-700">
                    Create Homework
                  </h2>
                  <div className="w-full flex gap-3 my-2">
                    <div className="w-full">
                      <label htmlFor="title">
                        Title:<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        className="w-full p-3 border border-teal-400 rounded-lg mb-3 shadow-sm focus:ring-2 focus:ring-teal-500"
                        value={newHomework.title}
                        onChange={(e) =>
                          setNewHomework({
                            ...newHomework,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="dueDate">
                        Due Date:<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dueDate"
                        className="w-full p-3 border border-teal-400 rounded-lg mb-3 shadow-sm focus:ring-2 focus:ring-teal-500"
                        min={new Date().toISOString().split("T")[0]}
                        value={newHomework.dueDate}
                        onChange={(e) =>
                          setNewHomework({
                            ...newHomework,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="assignedClasses">
                        Assigned Classes(comma separated):
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="assignedClasses"
                        placeholder="Assigned Classes"
                        className="w-full p-3 border border-teal-400 rounded-lg mb-3 shadow-sm focus:ring-2 focus:ring-teal-500"
                        value={newHomework.assignedClasses}
                        onChange={(e) =>
                          setNewHomework({
                            ...newHomework,
                            assignedClasses: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label htmlFor="description">
                      Description:<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Description"
                      name="description"
                      className="w-full p-3 border border-teal-400 rounded-lg mb-3 shadow-sm focus:ring-2 focus:ring-teal-500"
                      value={newHomework.description}
                      onChange={(e) =>
                        setNewHomework({
                          ...newHomework,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <select
                    className="w-full p-3 border border-teal-400 rounded-lg mb-3 shadow-sm focus:ring-2 focus:ring-teal-500"
                    value={
                      newHomework.fileType === null ? "" : newHomework.fileType
                    }
                    onChange={(e) =>
                      setNewHomework({
                        ...newHomework,
                        fileType: e.target.value === "" ? null : e.target.value,
                      })
                    }
                  >
                    <option value="">Select File Type</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="ppt">PPT</option>
                  </select>
                  <input
                    type="file"
                    className="w-full p-3 border border-teal-400 rounded-lg mb-3 shadow-sm"
                    accept=".pdf,.doc,.ppt"
                    onChange={(e) =>
                      setSelectedFile(e.target.files && e.target.files[0])
                    }
                  />
                </div>
              </ModalContent>
              <ModalFooter>
                <button
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 transition"
                  onClick={createHomework}
                >
                  Submit 📤
                </button>
              </ModalFooter>
            </ModalBody>
          </Modal>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {homeworks.map((hw) => (
          <div
            key={hw.homeworkid}
            className="bg-white border border-teal-400 rounded-xl p-6 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 z-10 flex flex-col gap-1"
          >
            <h2 className="text-2xl font-semibold text-teal-700">{hw.title}</h2>
            <p className="text-gray-600">{hw.description}</p>
            <p className="text-teal-600 font-medium">
              Due Date: <span className="font-semibold">{hw.duedate}</span>
            </p>
            <p className="text-gray-500">Created By: {hw.teachername}</p>

            <p className="text-gray-500">
                Assigned Classes: {hw.assignedclasses}
            </p>
            {role === "teacher" && "submittedCount" in hw && (
              <>
                <p className="text-green-600">
                  ✅ Submitted: {hw.submittedCount}
                </p>
                <p className="text-red-600">
                  ⏳ Pending: {hw.pendingSubmissions}
                </p>
              </>
            )}

            <div
              className={`mt-4 flex  items-center ${
                hw.fileurl ? " justify-between " : " justify-end "
              }`}
            >
              {hw.fileurl && (
                <a
                  href={hw.fileurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-500 underline hover:text-teal-700 transition"
                >
                  📎 View Attachment
                </a>
              )}
              {role === "teacher" &&
                "createdbyuserid" in hw &&
                hw.createdbyuserid === userId && (
                  <button
                    className="bg-teal-400 hover:bg-teal-600 text-white px-4 py-1 rounded-lg transition"
                    onClick={() => {
                      router.push(`/${role}/homework/submittedHomeworks`);
                    }}
                  >
                    Check HomeWork
                  </button>
                )}
              {role === "student" && (
                <button
                  className="bg-teal-400 hover:bg-teal-600 text-white px-4 py-1 rounded-lg transition"
                  onClick={() => {
                    router.push(
                      `/${role}/homework/submitHomework?homeworkid=${hw.homeworkid}`
                    );
                  }}
                >
                  Submit Homework
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllHomeworksPage;
