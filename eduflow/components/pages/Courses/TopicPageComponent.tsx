"use client";
import VideoTracker from "@/components/utils/VideoTracker";
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
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [lastSentMinute, setLastSentMinute] = useState<number>(-1);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prevTime) => {
        const newTime = prevTime + 1;
        const currentMinute = Math.floor(newTime / 60);

        if (currentMinute > lastSentMinute) {
          sendTimeSpent(false, newTime);
          setLastSentMinute(currentMinute);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSentMinute]);

  const sendTimeSpent = async (isClosing: boolean, currentTime?: number) => {
    const timeToSend = currentTime ?? timeSpent;
    if(topicId && (timeToSend || isClosing)){
      try {
        console.log("sendTimeSpent: " + timeToSend);
        setToken();
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}/topics/${topicId}`,
          {
            timeSpentOnTopic: timeToSend - lastSentMinute * 60,
          }
        );
      } catch (error) {
        console.error("Error updating time spent: ", error);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => sendTimeSpent(true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      sendTimeSpent(true);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
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
                    <VideoTracker videoUrl={topic.videoUrl} topicId={topicId} videoId={topic.videoId}>
                      Your browser does not support the video tag.
                    </VideoTracker>
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
