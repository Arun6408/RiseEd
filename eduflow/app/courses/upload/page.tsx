"use client";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const getCourses = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/`
        );
        if (getCourses.data.status !== "success") {
          console.error("Failed to fetch courses:", getCourses.data.message);
          setError("Failed to fetch courses.");
          return;
        }
        setCourses(getCourses.data.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Error fetching courses.");
      }
    };

    fetchCourses();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Courses Page</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.courseId}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
