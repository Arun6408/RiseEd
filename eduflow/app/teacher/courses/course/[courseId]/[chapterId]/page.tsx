"use client";

import TeacherLayout from "@/app/teacher/TeacherLayout";
import ChapterPageComponent from "@/components/pages/Courses/ChapterPageComponent";
import Loader from "@/components/utils/Loader";
import { useEffect, useState } from "react";

export default function ChapterPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: number; chapterId: number }>;
}) {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await paramsPromise;
      setCourseId(resolvedParams.courseId);
      setChapterId(resolvedParams.chapterId);
    };

    fetchParams();
  }, [paramsPromise]);


  if(!chapterId || !courseId) return <Loader/>

  return (
    <TeacherLayout activeLink="/teacher/courses">
      <ChapterPageComponent courseId={courseId} chapterId={chapterId}/>
    </TeacherLayout>
  );
}
