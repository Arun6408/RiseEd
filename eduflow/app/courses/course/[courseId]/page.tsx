'use client';
import { getCourses } from "@/utils/util";
import { useEffect, useState } from "react";

export default function Page({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courses, setCourses] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchParamsAndCourses = async () => {
      const resolvedParams = await paramsPromise; // Unwrap the params Promise
      setCourseId(resolvedParams.courseId);

      const fetchedCourses = await getCourses(resolvedParams.courseId);
      setCourses(fetchedCourses);
    };

    fetchParamsAndCourses();
  }, [paramsPromise]);

  

  return (
    <div>
      <h1>Course ID: {courseId}</h1>
      <div>Courses: {JSON.stringify(courses)}</div>
    </div>
  );
}
