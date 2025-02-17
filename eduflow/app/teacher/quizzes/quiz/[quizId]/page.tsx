"use client";
import { useEffect, useState } from "react";
import TeacherLayout from "../../../TeacherLayout";
import QuizPageComponent from "@/components/pages/Quiz/QuizPageComponent";

const page = ({
    params: paramsPromise,
  }: {
    params: Promise<{ quizId: number }>;
  }) => {
    const [quizId, setQuizId] = useState<number>();
    const getQuizId = async () => {
      const fetchedParams = await paramsPromise;
      setQuizId(fetchedParams.quizId);
    };
    useEffect(()=>{getQuizId()},[])
  return  (
    <TeacherLayout activeLink="/teacher/quizzes">
      {quizId && <QuizPageComponent quizId={quizId} />}
    </TeacherLayout>
  );
}

export default page
