'use client';
import { getChapters } from "@/utils/util";
import { useEffect, useState } from "react";

export default function ChaptersPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: number; chapterId: number }>;
}) {
  const [chapters, setChapters] = useState<any>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParamsAndChapters = async () => {
      const resolvedParams = await paramsPromise; // Unwrap the params Promise
      setCourseId(resolvedParams.courseId);
      setChapterId(resolvedParams.chapterId);

      const fetchedChapters = await getChapters({
        courseId: resolvedParams.courseId,
        chapterId: resolvedParams.chapterId,
      });
      setChapters(fetchedChapters);
    };

    fetchParamsAndChapters();
  }, [paramsPromise]);

  return (
    <div>
      <h1>Course ID: {courseId}</h1>
      <h2>Chapter ID: {chapterId}</h2>
      <div>Chapters: {JSON.stringify(chapters)}</div>
    </div>
  );
}
