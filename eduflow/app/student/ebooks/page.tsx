import React from "react";
import StudentLayout from "../StudentLayout";
import AllEbooksPageComponent from "@/components/pages/Ebooks/AllEbooksPageCompoenent";

const page = () => {
  return (
    <StudentLayout activeLink="/student/ebooks">
      <AllEbooksPageComponent/>
    </StudentLayout>
  );
};

export default page;
