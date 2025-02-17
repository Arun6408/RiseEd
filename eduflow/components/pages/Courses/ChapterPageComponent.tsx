"use client";

import RightNav from "@/components/Navbars/RightNav";
import { getChapters, getRole, getTopics } from "@/utils/util";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ChapterPageComponent({
  courseId,chapterId
}: {
courseId: number; chapterId: number;
}) {
  const [chapter, setChapter] = useState<any>(null);
  const [topics, setTopics] = useState<any>(null);
  const Router = useRouter();
  const role = getRole();

  useEffect(() => {
    const fetchData = async () => {

      const fetchedChapter = await getChapters({
        courseId,
        chapterId
      });
      const fetchedTopics = await getTopics({
        courseId,
        chapterId,
        topicId: null,
      });
      setChapter(fetchedChapter);
      setTopics(fetchedTopics);
    };

    fetchData();
  }, []);

  const handleTopicClick = (topicId:number) =>{
    Router.push(`/${role}/courses/course/${courseId}/${chapterId}/${topicId}`);
  }

  return (
      <div className="w-full">
        <div className="w-full mx-auto">
          {/* Chapter Details */}
          {chapter && (
            <div className="p-12 bg-white shadow-lg">
              <h1 className="text-6xl font-extrabold text-teal-700 mb-8">
                {chapter.title}
              </h1>
              <div className="text-lg text-gray-700 space-y-6">
                <p className="mb-4">
                  <span className="font-semibold text-teal-900">
                    Description:
                  </span>{" "}
                  {chapter.description}
                </p>
                <p className="text-lg text-gray-600">
                  <span className="font-semibold text-teal-900">Content:</span>{" "}
                  {chapter.content}
                </p>
              </div>

              {/* Topics in Chapter */}
              {topics && (
                <div className="mt-12">
                  <h2 className="text-4xl font-bold text-teal-700 mb-8">
                    Topics in this Chapter
                  </h2>
                  <div className="space-y-10">
                    {topics.map((topic: any, index: number) => (
                      <div
                        key={topic.topicId}
                        className="relative bg-teal-800 p-6 rounded-xl"
                      >
                        <div className="relative flex justify-between items-center">
                          <div>
                            <h3 className="text-3xl font-semibold text-white mb-3">
                              {topic.title}
                            </h3>
                            <p className="text-sm text-teal-200 mb-4">
                              Type: {topic.topicType}
                            </p>
                          </div>
                          <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-200 opacity-30 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
                          <button
                            className="z-10 px-4 py-2 rounded-lg text-white bg-teal-500 cursor-pointer"
                            onClick={() =>
                              handleTopicClick(topic.topicId)
                            }
                          >
                            View Topic
                          </button>
                        </div>
                        <div className="border-t border-teal-400 mt-6" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <RightNav />
      </div>
  );
}
