"use client";
import AllCoursesPageComponent from "@/components/pages/Courses/AllCoursesPageComponent";
import StudentLayout from "../StudentLayout";

const CoursePage: React.FC = () => {
  return (
    <StudentLayout activeLink="/student/courses">
      <AllCoursesPageComponent />
    </StudentLayout>
  );
};

export default CoursePage;
