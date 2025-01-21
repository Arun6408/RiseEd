"use client";
import { useEffect, useState } from "react";

import Loader from "@/components/utils/Loader";
import AllEbooksPageComponent from "@/components/utils/AllEbooksPageCompoenet";
import TeacherLayout from "../TeacherLayout";

const Page = () => {
  return (
    <TeacherLayout activeLink="/teacher/ebooks">
      <AllEbooksPageComponent role={"teacher"} />
    </TeacherLayout>
  );
};
export default Page;
