"use client";
import AllCoursesPageComponent from "@/components/pages/Courses/AllCoursesPageComponent";
import PrincipalLayout from "../PrincipalLayout";

const CoursePage: React.FC = () => {
  return (
    <PrincipalLayout activeLink="/principal/courses">
      <AllCoursesPageComponent />
    </PrincipalLayout>
  );
};

export default CoursePage;
