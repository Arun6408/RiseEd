"use client";
import { getTopics, setToken } from "@/utils/util";
import axios from "axios";
import { useEffect, useState } from "react";

export default function TopicPageComponent({
  courseId, chapterId, topicId
}: {
    courseId: number;
    chapterId: number;
    topicId: number;
}) {
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopics = async () => {

      const fetchedTopics = await getTopics({
        courseId: courseId,
        chapterId: chapterId,
        topicId: topicId,
      });

      if (fetchedTopics?.questionAndAnswers) {
        try {
          fetchedTopics.questionAndAnswers = JSON.parse(
            fetchedTopics.questionAndAnswers
          );
        } catch (error) {
          console.error("Error parsing questionAndAnswers:", error);
          fetchedTopics.questionAndAnswers = [];
        }
      }

      setTopic(fetchedTopics);
      setLoading(false);
    };

    fetchTopics();
  }, []);



  return (
      <div>
        {loading && <div>Loading...</div>}
      {!loading && (
        <div className="w-full bg-gradient-to-b from-teal-100 to-gray-50">
          <div className="mx-auto bg-white shadow-lg p-10">
            {topic && (
              <>
                <h1 className="text-4xl font-extrabold text-teal-700 mb-6">
                  {topic.title}
                </h1>
                <p className="text-lg text-gray-800 mb-8">
                  <span className="font-semibold text-teal-900">Description:</span> {topic.description}
                </p>
                {topic.content && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-teal-700 mb-4">Content</h2>
                    <p className="text-gray-700 leading-relaxed">{topic.content}</p>
                  </div>
                )}
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
      )}
      </div>
  );
}
