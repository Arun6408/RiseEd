"use client";

import {
  getChapters,
  getCourses,
  getTopics,
  getVideoDuration,
  handleUpload,
  setToken,
} from "@/utils/util";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import TeacherLayout from "../../TeacherLayout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { useRouter } from "next/navigation";
import Loader from "@/components/utils/Loader";
import { Course } from "@/types";

const Page = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(
    null
  );

  // chapter form variables
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");
  const [chapterContent, setChapterContent] = useState("");

  // course form variables
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseClass, setCourseClass] = useState("");
  const [courseContent, setCourseContent] = useState("");

  // topic form variables
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [topicType, setTopicType] = useState("video");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const inputVideoRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const addQuestion = () => {
    console.log(`addQuestion`);
    if (!currentQuestion || !currentAnswer) {
      return alert("Please fill out both fields.");
    }
    setQuestions([
      ...questions,
      { question: currentQuestion, answer: currentAnswer },
    ]);
    setCurrentQuestion("");
    setCurrentAnswer("");
  };

  const handleQuestionChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    console.log(`handleQuestionChange`);
    const updatedQuestions = questions.map((q, idx) =>
      idx === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };
  const clearForm = () => {
    setSelectedCourseId(null);
    setSelectedChapterId(null);
    setChapterTitle("");
    setChapterDescription("");
    setChapterContent("");
    setCourseTitle("");
    setCourseDescription("");
    setCourseClass("");
    setCourseContent("");
    setTopicTitle("");
    setTopicDescription("");
    setTopicContent("");
    setTopicType("");
    setVideoFile(null);
    setPdfFile(null);
    setQuestions([]);
    setChapters([]);
    setTopics([]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);

      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = () => {
        setVideoDuration(videoElement.duration);
      };

      videoElement.src = URL.createObjectURL(file);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses(null);
        setCourses(data);
      } catch (err) {
        setError("Error fetching courses");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedCourseId) return;
      try {
        const data = await getChapters({
          courseId: selectedCourseId,
          chapterId: null,
        });
        setChapters(data);
      } catch (err) {
        setError("Error fetching chapters");
      }
    };
    fetchChapters();
  }, [selectedCourseId]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedChapterId) return;
      try {
        const data = await getTopics({
          courseId: selectedCourseId!,
          chapterId: selectedChapterId!,
          topicId: null,
        });
        setTopics(data);
      } catch (err) {
        setError("Error fetching topics");
      }
    };
    fetchTopics();
  }, [selectedChapterId]);

  const handleCourseSubmit = async () => {
    setLoading(true);
    try {
      const newCourse: Omit<Course, "courseId"> = {
        title: courseTitle,
        description: courseDescription,
        class: courseClass,
        content: courseContent,
        taughtBy: "",
      };

      setToken();
      const res = await axios.post<{ courseId: number }>(
        `${process.env.NEXT_PUBLIC_API_URL}/courses`,
        newCourse
      );

      const createdCourse: Course = {
        ...newCourse,
        courseId: res.data.courseId,
      };

      setLoading(false);
      setCourses([...courses, createdCourse]);
      clearForm();
    } catch (err) {
      setLoading(false);
      console.error("Error submitting course:", err);
      setError("Failed to create course. Please try again.");
    }
  };

  const handleChapterSubmit = async () => {
    setLoading(true);
    try {
      const newChapter = {
        title: chapterTitle,
        description: chapterDescription,
        content: chapterContent,
      };
      setToken();
      const res = await axios.post<{ chapterId: number }>(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${selectedCourseId}/chapters`,
        newChapter
      );
      const createdChapter = {
        chapterId: res.data.chapterId,
        ...newChapter,
      };
      setChapters([...chapters, createdChapter]);
      clearForm();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error submitting chapter:", error);
      setError("Failed to create chapter. Please try again.");
    }
  };

  const handleTopicSubmit = async () => {
    setLoading(true);
    let videoFileUrl: string | null = null;
    let pdfFileUrl: string | null = null;
    try {
      if (videoFile) {
        videoFileUrl = await handleUpload(videoFile, videoFile.type);
      }
      if (pdfFile) pdfFileUrl = await handleUpload(pdfFile, pdfFile.type);
      console.log("videoFileUrl:", videoFileUrl);
      console.log("pdfFileUrl:", pdfFileUrl);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const newTopic = {
        title: topicTitle,
        description: topicDescription,
        content: topicContent,
        topicType,
        videoUrl: videoFileUrl,
        videoDuration: videoDuration,
        pdfUrl: pdfFileUrl,
        questionAndAnswers: JSON.stringify(questions),
      };
      console.log(newTopic);
      setToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${selectedCourseId}/chapters/${selectedChapterId}/topics`,
        newTopic
      );
      console.log(res.data);
      if (res.data.status === "success") {
        setLoading(false);
        alert("Topic created successfully");
        clearForm();
      } else {
        setLoading(false);
        alert("Failed to create topic. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      alert("Failed to create topic. Please try again.");
      setError("Failed to create topic. Please try again");
    }
  };

  return (
    <div className="w-screen h-screen relative">
      {loading && <Loader />}
      <TeacherLayout activeLink="/teacher/courses">
        <div className="w-full h-full flex flex-col  bg-teal-50 items-center justify-evenly ">
          {/* Course Section */}
          <div className="p-8 w-full mb-12 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-teal-800">
                Available Courses
              </h1>
              <Modal>
                <ModalTrigger className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300">
                  Add Course
                </ModalTrigger>
                <ModalBody>
                  <form action="">
                    <ModalContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <label
                            htmlFor="course-title"
                            className="text-black text-sm"
                          >
                            Course Title
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <input
                            type="text"
                            id="course-title"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={courseTitle}
                            onChange={(e) => setCourseTitle(e.target.value)}
                            required
                            placeholder="Enter course title"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="course-description"
                            className="text-black text-sm"
                          >
                            Course Description
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <textarea
                            id="course-description"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={courseDescription}
                            onChange={(e) =>
                              setCourseDescription(e.target.value)
                            }
                            required
                            placeholder="Enter course description"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="course-class"
                            className="text-black text-sm"
                          >
                            Course Class (e.g., 3,4,5)
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <input
                            type="text"
                            id="course-class"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={courseClass}
                            onChange={(e) => setCourseClass(e.target.value)}
                            required
                            placeholder="Enter course class (comma-separated)"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="course-content"
                            className="text-black text-sm"
                          >
                            Course Content
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <textarea
                            id="course-content"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={courseContent}
                            onChange={(e) => setCourseContent(e.target.value)}
                            required
                            placeholder="Enter course content"
                          />
                        </div>
                      </div>
                    </ModalContent>
                    <ModalFooter className="gap-4">
                      <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
                        onClick={clearForm}
                      >
                        Clear
                      </button>
                      <button
                        className=" text-white  text-sm px-2 py-1 rounded-md border border-teal-600 bg-teal-500 hover:bg-teal-600 w-28"
                        type="button"
                        onClick={handleCourseSubmit}
                      >
                        Add Course
                      </button>
                    </ModalFooter>
                  </form>
                </ModalBody>
              </Modal>
            </div>
            <table className="min-w-full bg-teal-500 rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Course ID
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Title
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Classes
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Description
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Taught By
                  </th>
                  <th className="py-4 px-6 font-semibold text-lg text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="hover:bg-teal-400 transition duration-300"
                  >
                    <td className="py-4 px-6 text-white">{course.courseId}</td>
                    <td className="py-4 px-6 text-white">{course.title}</td>
                    <td className="py-4 px-6 text-white">{course.class}</td>
                    <td className="py-4 px-6 text-white">
                      {course.description}
                    </td>
                    <td className="py-4 px-6 text-white">{course.taughtBy}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300"
                        onClick={() => {
                          router.push(
                            `/teacher/courses/course/${course.courseId}`
                          );
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chapter Section */}
          <div className="p-8 w-full bg-teal-50 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-teal-800">
                Available Chapters
              </h1>
              <Modal>
                <ModalTrigger className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300">
                  Add Chapter
                </ModalTrigger>
                <ModalBody>
                  <form action="">
                    <ModalContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col">
                          <label
                            htmlFor="chapter-title"
                            className="text-black text-sm"
                          >
                            Selected Course
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <select
                            id="chapter-select"
                            className="mt-1 px-4 py-1 border-2 w-fit rounded focus:outline-none"
                            onChange={(e) =>
                              setSelectedCourseId(Number(e.target.value))
                            }
                            value={selectedCourseId || ""}
                          >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                              <option
                                key={course.courseId}
                                value={course.courseId}
                              >
                                {course.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="chapter-title"
                            className="text-black text-sm"
                          >
                            Chapter Title
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <input
                            type="text"
                            id="chapter-title"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={chapterTitle}
                            onChange={(e) => setChapterTitle(e.target.value)}
                            required
                            placeholder="Enter chapter title"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="chapter-description"
                            className="text-black text-sm"
                          >
                            Chapter Description
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <textarea
                            id="chapter-description"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={chapterDescription}
                            onChange={(e) =>
                              setChapterDescription(e.target.value)
                            }
                            placeholder="Enter chapter description"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="chapter-content"
                            className="text-black text-sm"
                          >
                            Chapter Content
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <textarea
                            id="chapter-content"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={chapterContent}
                            onChange={(e) => setChapterContent(e.target.value)}
                            placeholder="Enter chapter content"
                          />
                        </div>
                      </div>
                    </ModalContent>
                    <ModalFooter className="gap-4">
                      <button
                        type="button"
                        className="px-2 py-1 bg-gray-200 text-black  border-gray-300 rounded-md text-sm w-28"
                        onClick={clearForm} // Call clearForm on click
                      >
                        Clear
                      </button>
                      <button
                        className=" text-white  text-sm px-2 py-1 rounded-md border  bg-teal-500 hover:bg-teal-600  w-28"
                        type="submit"
                        onClick={() => {
                          handleChapterSubmit();
                        }}
                      >
                        Add Chapter
                      </button>
                    </ModalFooter>
                  </form>
                </ModalBody>
              </Modal>
            </div>
            <div className="flex items-center justify-start pb-4 gap-6">
              <label htmlFor="course-select" className="text-teal-800 text-lg">
                Select Course<span className="text-red-500">*</span>
              </label>
              <select
                id="course-select"
                className="px-4 py-3 bg-teal-400 text-white rounded-lg focus:outline-none shadow-md"
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                value={selectedCourseId || ""}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <table className="min-w-full bg-teal-500 rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Chapter ID
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Title
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Description
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Content
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Course ID
                  </th>
                  <th className="py-4 px-6 font-semibold text-lg text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {chapters.length ? (
                  chapters.map((chapter) => (
                    <tr
                      key={chapter.chapterId}
                      className="hover:bg-teal-400 transition duration-300"
                    >
                      <td className="py-4 px-6 text-white">
                        {chapter.chapterId}
                      </td>
                      <td className="py-4 px-6 text-white">{chapter.title}</td>
                      <td className="py-4 px-6 text-white">
                        {chapter.description}
                      </td>
                      <td className="py-4 px-6 text-white">
                        {chapter.content}
                      </td>
                      <td className="py-4 px-6 text-white">
                        {chapter.courseId}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300"
                          onClick={() => {
                            router.push(
                              `/teacher/courses/course/${selectedCourseId}/${chapter.chapterId}`
                            );
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 px-6 text-center text-white"
                    >
                      Please Select Course to Fetch Chapters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Topic Section */}
          <div className="p-8 w-full bg-teal-50 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-teal-800">Topics</h1>
              <Modal>
                <ModalTrigger className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300">
                  Add Topic
                </ModalTrigger>
                <ModalBody className="">
                  <form action="">
                    <ModalContent className="h-[500px] overflow-y-scroll scrollbar-hide flex flex-col gap-4">
                      <div className="flex justify-between gap-6">
                        <div className="flex flex-col w-full">
                          <label
                            htmlFor="chapter-title"
                            className="text-black text-sm"
                          >
                            Selected Course
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <select
                            id="chapter-select"
                            className="mt-1 px-4 py-1 border-2 rounded focus:outline-none"
                            onChange={(e) => {
                              setSelectedCourseId(Number(e.target.value));
                              setSelectedChapterId(null);
                            }}
                            value={selectedCourseId || ""}
                            required={true}
                          >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                              <option
                                key={course.courseId}
                                value={course.courseId}
                              >
                                {course.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col w-full">
                          <label
                            htmlFor="topic-select"
                            className="text-black text-sm"
                          >
                            Selected Chapter
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <select
                            id="topic-select"
                            className="mt-1 px-4 py-1 border-2 rounded focus:outline-none"
                            onChange={(e) =>
                              setSelectedChapterId(Number(e.target.value))
                            }
                            value={selectedChapterId || ""}
                            required={true}
                          >
                            <option value="">Select a chapter</option>
                            {chapters.map((chapter) => (
                              <option
                                key={chapter.chapterId}
                                value={chapter.chapterId}
                              >
                                {chapter.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col w-full">
                          <label
                            htmlFor="topic-title"
                            className="text-black text-sm"
                          >
                            Topic Title
                            <span className="text-red-500 text-xl">*</span>:
                          </label>
                          <input
                            type="text"
                            id="topic-title"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={topicTitle}
                            onChange={(e) => setTopicTitle(e.target.value)}
                            required
                            placeholder="Enter topic title"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="topic-description"
                          className="text-black text-sm"
                        >
                          Topic Description
                          <span className="text-red-500 text-xl">*</span>:
                        </label>
                        <textarea
                          id="topic-description"
                          className="mt-1 py-1 border-2 px-2 rounded"
                          value={topicDescription}
                          onChange={(e) => setTopicDescription(e.target.value)}
                          placeholder="Enter topic description"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="topic-content"
                          className="text-black text-sm"
                        >
                          Topic Content
                          <span className="text-red-500 text-xl">*</span>:
                        </label>
                        <textarea
                          id="topic-content"
                          className="mt-1 py-1 border-2 px-2 rounded"
                          value={topicContent}
                          onChange={(e) => setTopicContent(e.target.value)}
                          placeholder="Enter topic content"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="topic-type"
                          className="text-black text-sm"
                        >
                          Topic Type
                          <span className="text-red-500 text-xl">*</span>:
                        </label>
                        <select
                          id="topic-type"
                          className="mt-1 px-2 py-1 border-2 rounded"
                          value={topicType}
                          onChange={(e) => setTopicType(e.target.value)}
                        >
                          <option value="">Select Topic Type</option>
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="q&a">Q&A</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="video-url"
                          className="text-black text-lg font-semibold"
                        >
                          Upload Video:
                        </label>
                        <div className="border-2 rounded-lg">
                          <input
                            ref={inputVideoRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              handleVideoUpload(e);
                              setVideoFile(e.target.files && e.target.files[0]);
                            }}
                          />
                        </div>
                        <p>Duration: {videoDuration.toFixed(2)} seconds</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="upload-pdf"
                          className="text-black text-lg"
                        >
                          Upload PDF:
                        </label>
                        <div className="border-2 rounded-lg">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                              //@ts-ignore
                              setPdfFile(e.target.files[0]);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label
                            htmlFor="question"
                            className="text-black text-sm"
                          >
                            Question:
                          </label>
                          <input
                            id="question"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                            placeholder="Enter a question"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="answer"
                            className="text-black text-sm"
                          >
                            Answer:
                          </label>
                          <input
                            id="answer"
                            className="mt-1 py-1 border-2 px-2 rounded"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Enter the answer"
                          />
                        </div>
                        <div
                          className="py-2 px-4 bg-teal-600 w-fit text-white rounded hover:bg-teal-500"
                          onClick={addQuestion}
                        >
                          Add Question
                        </div>

                        {/* Render the list of questions */}
                        <div className="mt-4">
                          <h3 className="text-lg font-bold">
                            Questions and Answers:
                          </h3>
                          {questions.map((qa, index) => (
                            <div key={index} className="mt-2 border-b pb-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700">
                                  Q{index + 1}:
                                </label>
                                <input
                                  type="text"
                                  value={qa.question}
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      index,
                                      "question",
                                      e.target.value
                                    )
                                  }
                                  className="py-1 px-2 border rounded flex-1"
                                  placeholder="Edit question"
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <label className="text-sm text-gray-700">
                                  A{index + 1}:
                                </label>
                                <input
                                  type="text"
                                  value={qa.answer}
                                  onChange={(e) =>
                                    handleQuestionChange(
                                      index,
                                      "answer",
                                      e.target.value
                                    )
                                  }
                                  className="py-1 px-2 border rounded flex-1"
                                  placeholder="Edit answer"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ModalContent>
                    <ModalFooter className="gap-4">
                      <div
                        className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
                        onClick={clearForm}
                      >
                        Clear
                      </div>
                      <button
                        className=" text-white  text-sm px-2 py-1 rounded-md border  bg-teal-500 hover:bg-teal-600  w-28"
                        onClick={() => handleTopicSubmit()}
                        type="button"
                      >
                        Add Topic
                      </button>
                    </ModalFooter>
                  </form>
                </ModalBody>
              </Modal>
            </div>
            <div className="flex items-center justify-start pb-4 gap-6">
              <div className="flex items-center gap-6">
                <label
                  htmlFor="course-select"
                  className="text-teal-800 text-lg"
                >
                  Select Course<span className="text-red-500">*</span>
                </label>
                <select
                  id="course-select"
                  className="px-4 py-3 bg-teal-400 text-white rounded-lg focus:outline-none shadow-md"
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  value={selectedCourseId || ""}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label htmlFor="topic-select" className="text-teal-800 text-lg">
                  Select Chapter<span className="text-red-500">*</span>
                </label>
                <select
                  id="topic-select"
                  className="px-4 py-3 bg-teal-400 text-white rounded-lg focus:outline-none shadow-md"
                  onChange={(e) => setSelectedChapterId(Number(e.target.value))}
                  value={selectedChapterId || ""}
                >
                  <option value="">Select a chapter</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.chapterId} value={chapter.chapterId}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <table className="min-w-full bg-teal-500 rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Topic ID
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Title
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Topic Type
                  </th>
                  <th className="py-4 px-6 font-semibold text-left text-lg">
                    Chapter ID
                  </th>
                  <th className="py-4 px-6 font-semibold text-lg text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {topics.length ? (
                  topics.map((topic) => (
                    <tr
                      key={topic.topicId}
                      className="hover:bg-teal-400 transition duration-300"
                    >
                      <td className="py-4 px-6 text-white">{topic.topicId}</td>
                      <td className="py-4 px-6 text-white">{topic.title}</td>
                      <td className="py-4 px-6 text-white">
                        {topic.topicType}
                      </td>
                      <td className="py-4 px-6 text-white">
                        {topic.chapterId}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          className="py-2 px-6 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition duration-300"
                          onClick={() => {
                            router.push(
                              `/teacher/courses/course/${selectedCourseId}/${selectedChapterId}/${topic.topicId}`
                            );
                          }}
                        >
                          View Topic
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 px-6 text-center text-white"
                    >
                      Please Select Course and Chapter to Fetch Topics
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </TeacherLayout>
    </div>
  );
};

export default Page;
