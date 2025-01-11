import TeacherLayout from "./TeacherLayout";

const Page = () => {
  return (
    <TeacherLayout activeLink="/teacher">
      <h1>Welcome to Teacher's Dashboard</h1>
      <p>Here you can manage your courses, e-books, and other resources.</p>
    </TeacherLayout>
  );
};

export default Page;
