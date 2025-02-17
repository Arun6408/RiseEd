import React from "react";
import StudentLayout from "./StudentLayout";

const page = () => {
  return (
    <StudentLayout activeLink="/student">
      <div>Student page</div>
    </StudentLayout>
  );
};

export default page;
