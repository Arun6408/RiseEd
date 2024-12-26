'use client';
import { getTopics } from "@/utils/util";
import { useEffect, useState } from "react";

export default function TopicsPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string; chapterId: string; topicId: string | null }>;
}) {
  const [topics, setTopics] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  useEffect(() => {
    const fetchParamsAndTopics = async () => {
      const resolvedParams = await paramsPromise; // Unwrap the params Promise
      setCourseId(resolvedParams.courseId);
      setChapterId(resolvedParams.chapterId);
      setTopicId(resolvedParams.topicId);

      const fetchedTopics = await getTopics({
        courseId: resolvedParams.courseId,
        chapterId: resolvedParams.chapterId,
        topicId: resolvedParams.topicId,
      });
      setTopics(fetchedTopics);
    };

    fetchParamsAndTopics();
  }, [paramsPromise]);

  return (
    <div>
      <h1>Course ID: {courseId}</h1>
      <h2>Chapter ID: {chapterId}</h2>
      <h3>Topic ID: {topicId}</h3>
      <div>Topics: {JSON.stringify(topics)}</div>
    </div>
  );
}
