"use client";
import { useEffect, useState } from "react";

import Loader from "@/components/utils/Loader";
import AllEbooksPageComponent from "@/components/pages/Ebooks/AllEbooksPageCompoenent";
import TeacherLayout from "../TeacherLayout";

const Page = () => {
  return (
    <TeacherLayout activeLink="/teacher/ebooks">
      <AllEbooksPageComponent/>
    </TeacherLayout>
  );
};
export default Page;
