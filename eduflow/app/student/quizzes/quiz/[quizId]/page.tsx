"use client";
import { useEffect, useState } from "react";
import QuizPageComponent from "@/components/pages/Quiz/QuizPageComponent";
import StudentLayout from "@/app/student/StudentLayout";

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
    <StudentLayout activeLink="/student/quizzes">
      {quizId && <QuizPageComponent quizId={quizId} />}
    </StudentLayout>
  );
}

export default page
