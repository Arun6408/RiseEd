export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;


  return (
    <div>
      <h1>Course ID: {courseId}</h1>
    </div>
  );
}
