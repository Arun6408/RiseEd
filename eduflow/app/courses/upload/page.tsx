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
  }, [selectedChapterId]);

  return (
    <div className="w-screen h-screen bg-gray-100 flex items-center justify-evenly">
      {/* Course Section */}
      <div className="w-96 h-52 bg-blue-500 flex p-4 flex-col items-center justify-evenly">
        <div className="flex gap-5 items-center">
          <p>Add Course</p>
          <button className="px-4 py-2 h-fit bg-blue-300">+course</button>
        </div>
        <div>
          {error ? (
            <p className="text-white">{error}</p>
          ) : (
            courses &&
            courses.map((course) => (
              <div key={course.courseId} className="flex gap-5 items-center">
                <p>{course.title}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chapter Section */}
      <div className="w-fit h-52 bg-blue-500 flex p-4 flex-col items-center justify-evenly">
        <div className="flex gap-5 items-center">
          <div className="flex flex-col gap-1">
            <label htmlFor="chapter-select" className="text-white">
              Select Course
            </label>
            <select
              id="chapter-select"
              className="px-2 py-1 bg-blue-300 rounded"
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
          <p>Add Chapter</p>
          <button className="px-4 py-2 h-fit bg-blue-300">+chapter</button>
        </div>
        <div>
          {error ? (
            <p className="text-white">{error}</p>
          ) : (
            chapters.map((chapter) => (
              <div key={chapter.chapterId} className="flex gap-5 items-center">
                <p>{chapter.title}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Topic Section */}
      <div className="w-96 h-52 bg-blue-500 flex p-4 flex-col items-center justify-evenly">
        <div className="flex gap-5 items-center">
          <div className="flex flex-col gap-1">
            <label htmlFor="topic-select" className="text-white">
              Select Chapter
            </label>
            <select
              id="topic-select"
              className="px-2 py-1 bg-blue-300 rounded"
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
          <p>Add Topic</p>
          <button className="px-4 py-2 h-fit bg-blue-300">+topic</button>
        </div>
        <div>
          {error ? (
            <p className="text-white">{error}</p>
          ) : (
            topics.map((topic, index) => (
              <div key={index} className="flex gap-5 items-center">
                <p>{topic.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;