"use client";
import AllCoursesPageComponent from "@/components/pages/Courses/AllCoursesPageComponent";
import TeacherLayout from "../TeacherLayout";

const CoursePage: React.FC = () => {
  return (
    <TeacherLayout activeLink="/teacher/courses">
      <AllCoursesPageComponent />
    </TeacherLayout>
  );
};

export default CoursePage;
