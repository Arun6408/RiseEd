"use client";

import { getChapters, getCourses, getTopics } from "@/utils/util";
import axios from "axios";
import { useEffect, useState } from "react";

type Course = {
  courseId: number;
  title: string;
  class: string;
  description: string;
  taughtBy: string;
};

const Page = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

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
  }, [selectedCourseId,selectedChapterId]);

  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-evenly">
      {/* Course Section */}
      <div className="w-96 h-56 bg-blue-600 rounded-lg shadow-lg flex flex-col p-6 justify-between">
        <div className="flex items-center justify-between">
          <p className="text-white text-lg font-semibold">Add Course</p>
          <button className="px-4 py-2 bg-blue-400 text-white rounded shadow hover:bg-blue-500">
            + Course
          </button>
        </div>
        <div className="mt-4">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            courses &&
            courses.map((course) => (
              <div key={course.courseId} className="flex items-center gap-3 py-1">
                <p className="text-white">{course.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Chapter Section */}
      <div className="w-96 h-56 bg-green-600 rounded-lg shadow-lg flex flex-col p-6 justify-between">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label htmlFor="chapter-select" className="text-white text-sm">
              Select Course
            </label>
            <select
              id="chapter-select"
              className="mt-1 px-2 py-1 bg-green-400 text-white rounded focus:outline-none"
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
          <div>
            <p className="text-white text-lg font-semibold">Add Chapter</p>
            <button className="px-4 py-2 mt-1 bg-green-400 text-white rounded shadow hover:bg-green-500">
              + Chapter
            </button>
          </div>
        </div>
        <div className="mt-4">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            chapters.map((chapter) => (
              <div key={chapter.chapterId} className="flex items-center gap-3 py-1">
                <p className="text-white">{chapter.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
  
      {/* Topic Section */}
      <div className="w-96 h-56 bg-purple-600 rounded-lg shadow-lg flex flex-col p-6 justify-between">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label htmlFor="topic-select" className="text-white text-sm">
              Select Chapter
            </label>
            <select
              id="topic-select"
              className="mt-1 px-2 py-1 bg-purple-400 text-white rounded focus:outline-none"
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
          <div>
            <p className="text-white text-lg font-semibold">Add Topic</p>
            <button className="px-4 py-2 mt-1 bg-purple-400 text-white rounded shadow hover:bg-purple-500">
              + Topic
            </button>
          </div>
        </div>
        <div className="mt-4">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            topics.map((topic, index) => (
              <div key={index} className="flex items-center gap-3 py-1">
                <p className="text-white">{topic.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;