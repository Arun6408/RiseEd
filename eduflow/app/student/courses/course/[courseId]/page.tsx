"use client";

import StudentLayout from "@/app/student/StudentLayout";
import CoursePageComponent from "@/components/pages/Courses/CoursePageComponent";
import Loader from "@/components/utils/Loader";
import { useEffect, useState } from "react";

export default function CoursePage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: number }>;
}) {

  const [courseId, setCourseId] = useState<number | null>(null);
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await paramsPromise;
      setCourseId(resolvedParams.courseId);
    };
    fetchParams();
  }, [paramsPromise]);

  if(!courseId) return <Loader/>
  return (
    <StudentLayout activeLink="/student/courses">
      <CoursePageComponent  courseId={courseId} />
    </StudentLayout>
  );
}
