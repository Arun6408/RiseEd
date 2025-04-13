"use client";
import PrincipalLayout from "@/app/principal/PrincipalLayout";
import TopicPageComponent from "@/components/pages/Courses/TopicPageComponent";
import Loader from "@/components/utils/Loader";
import { useEffect, useState } from "react";

export default function TopicsPage({
  params: paramsPromise,
}: {
  params: Promise<{
    courseId: number;
    chapterId: number;
    topicId: number | null;
  }>;
}) {
  const [courseId, setCourseId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParamsAndTopics = async () => {
      const resolvedParams = await paramsPromise;
      setCourseId(resolvedParams.courseId);
      setChapterId(resolvedParams.chapterId);
      setTopicId(resolvedParams.topicId);
    };

    fetchParamsAndTopics();
  }, [paramsPromise]);


  if(!courseId || !chapterId  || !topicId) return <Loader/>

  return (
    <PrincipalLayout activeLink="/student/courses">
      <TopicPageComponent courseId={courseId} chapterId={chapterId} topicId={topicId}/>
    </PrincipalLayout>
  );
}
