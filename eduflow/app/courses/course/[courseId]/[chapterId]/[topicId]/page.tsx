export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string; topicId: string }>;
}) {
  const { courseId, chapterId, topicId } = await params;

  console.log(courseId, chapterId, topicId);

  return (
    <div>
      <h1>Course ID: {courseId}</h1>
      <h2>Chapter ID: {chapterId}</h2>
      <h3>Topic ID: {topicId}</h3>
    </div>
  );
}
