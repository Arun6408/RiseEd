'use client';
import TeacherLayout from "@/app/teacher/TeacherLayout";
import { getTopics } from "@/utils/util";
import { useEffect, useState } from "react";

export default function TopicsPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: number; chapterId: number; topicId: number | null }>;
}) {
  const [topic, setTopic] = useState<any>(null);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [topicId, setTopicId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParamsAndTopics = async () => {
      const resolvedParams = await paramsPromise;
      setCourseId(resolvedParams.courseId);
      setChapterId(resolvedParams.chapterId);
      setTopicId(resolvedParams.topicId);

      const fetchedTopics = await getTopics({
        courseId: resolvedParams.courseId,
        chapterId: resolvedParams.chapterId,
        topicId: resolvedParams.topicId,
      });

      console.log(fetchedTopics);
      // Parse questionAndAnswers if it's a string
      if (fetchedTopics?.questionAndAnswers) {
        try {
          fetchedTopics.questionAndAnswers = JSON.parse(fetchedTopics.questionAndAnswers);
        } catch (error) {
          console.error("Error parsing questionAndAnswers:", error);
          fetchedTopics.questionAndAnswers = [];
        }
      }
      
      setTopic(fetchedTopics);
    };

    fetchParamsAndTopics();
  }, [paramsPromise]);

  return (
    <TeacherLayout activeLink="/teacher/courses">
      <div className="w-full bg-gradient-to-b from-teal-100 to-gray-50">
        <div className="mx-auto bg-white shadow-lg p-10">
          {topic && (
            <>
              {/* Title */}
              <h1 className="text-4xl font-extrabold text-teal-700 mb-6">{topic.title}</h1>

              {/* Description */}
              <p className="text-lg text-gray-800 mb-8">
                <span className="font-semibold text-teal-900">Description:</span> {topic.description}
              </p>

              {/* Video */}
              {topic.videoUrl && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-teal-700 mb-4">Video</h2>
                  <video
                    controls
                    className="w-full rounded-lg shadow-lg"
                    src={topic.videoUrl}
                    autoPlay={true}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Content */}
              {topic.content && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-teal-700 mb-4">Content</h2>
                  <p className="text-gray-700 leading-relaxed">{topic.content}</p>
                </div>
              )}

              {/* PDFs */}
              {topic.pdfUrl && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-teal-700 mb-4">PDFs</h2>
                  <a
                    href={topic.pdfUrl}
                    target="_blank"
                    className="inline-block px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-500"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                </div>
              )}

              {/* Question & Answers */}
              {topic.questionAndAnswers && topic.questionAndAnswers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-teal-700 mb-4">Questions & Answers</h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    {topic.questionAndAnswers.map((qa: any, index: number) => (
                      <li key={index}>
                        <span className="font-semibold">Q:</span> {qa.question}
                        <br />
                        <span className="font-semibold">A:</span> {qa.answer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}