import React from "react";
import StudentLayout from "../StudentLayout";
import AllHomeworksPage from "@/components/pages/Homeworks/AllHomeworksPage";

const page = () => {
  return (
    <StudentLayout activeLink="/student/homework">
      <AllHomeworksPage/>
    </StudentLayout>
  );
};

export default page;
