'use client';
import { getChapters } from "@/utils/util";
import { useEffect, useState } from "react";

export default function ChaptersPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const [chapters, setChapters] = useState<any>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParamsAndChapters = async () => {
      const resolvedParams = await paramsPromise; // Unwrap the params Promise
      setCourseId(Number(resolvedParams.courseId));
      setChapterId(Number(resolvedParams.chapterId));

      const fetchedChapters = await getChapters({
        courseId: Number(resolvedParams.courseId),
        chapterId: Number(resolvedParams.chapterId),
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
