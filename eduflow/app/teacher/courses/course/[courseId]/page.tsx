"use client";

import TeacherLayout from "@/app/teacher/TeacherLayout";
import RightNav from "@/components/Navbars/RightNav";
import { getChapters, getCourses } from "@/utils/util";
import { useEffect, useState } from "react";

export default function CoursePage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: number }>;
}) {
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParamsAndChapters = async () => {
      const resolvedParams = await paramsPromise;
      setCourseId(resolvedParams.courseId);

      const fetchedCourse = await getCourses(resolvedParams.courseId);
      const fetchedChapters = await getChapters({
        courseId: resolvedParams.courseId,
        chapterId: null,
      });
      setCourse(fetchedCourse);
      setChapters(fetchedChapters);
    };

    fetchParamsAndChapters();
  }, [paramsPromise]);

  return (
    <TeacherLayout activeLink="/teacher/courses">
      <div className="w-full">
        <div className="w-full mx-auto">
          {/* Course Details with Chapters */}
          {course && (
            <div className="mb-16 p-12 bg-white shadow-lg ">
              <h1 className="text-6xl font-extrabold text-teal-700 mb-8">
                {course.title}
              </h1>
              <div className="text-lg text-gray-700 space-y-6">
                <p className="mb-4">
                  <span className="font-semibold text-teal-900">Class:</span>{" "}
                  {course.class}
                </p>
                <p className="mb-4">
                  <span className="font-semibold text-teal-900">Taught by:</span>{" "}
                  {course.taughtBy}
                </p>
                <p className="text-lg text-gray-600">
                  <span className="font-semibold text-teal-900">Description:</span>{" "}
                  {course.description}
                </p>
              </div>

              {/* List of Chapters inside Course */}
              {chapters && (
                <div className="mt-12">
                  <h2 className="text-4xl font-bold text-teal-700 mb-8">
                    Chapters in this Course
                  </h2>
                  <div className="space-y-10">
                    {chapters.map((chapter: any, index: number) => (
                      <div
                        key={chapter.chapterId}
                        className="relative bg-teal-800 p-6 rounded-xl"
                      >
                        <div className="relative flex justify-between items-center">
                          <div>
                          <h3 className="text-3xl font-semibold text-white mb-3">
                          {chapter.title}
                        </h3>
                        <p className="text-sm text-teal-200 mb-4">{chapter.description}</p>
                        <p className="text-xs text-teal-100">{chapter.content}</p>
                          </div>
                          <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-200 opacity-30 rounded-full blur-3xl animate-pulse"></div>
                          <button className="px-4 py-2 rounded-lg h-fit text-white bg-teal-500">Start Chapter</button>
                        </div>
                        <div className="border-t border-teal-400 mt-6" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <RightNav />
      </div>
    </TeacherLayout>
  );
}
