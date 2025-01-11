"use client";
import AllCoursesPageComponent from "@/components/utils/AllCoursesPageComponent";
import TeacherLayout from "../TeacherLayout";

const CoursePage: React.FC = () => {
  return (
    <TeacherLayout activeLink="/teacher/courses">
      <AllCoursesPageComponent role={"teacher"} />
    </TeacherLayout>
  );
};

export default CoursePage;
