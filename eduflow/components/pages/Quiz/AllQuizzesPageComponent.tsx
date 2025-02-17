"use client";
import { QuizDetails } from "@/types";
import { getRole, setToken } from "@/utils/util";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AllQuizPage = () => {
  const [quizzes, setQuizzes] = useState<QuizDetails[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const role = getRole();

  useEffect(() => {
    async function allQuizzes() {
      setToken();
      const fetchedQuizzes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/quiz`
      );
      setQuizzes(fetchedQuizzes.data.data.quizzes);
    }
    allQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.quiztitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 to-teal-200">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-teal-800 via-teal-600 to-teal-500 text-white text-center py-20 shadow-xl rounded-b-3xl">
        <h1 className="text-6xl font-extrabold tracking-wide drop-shadow-lg">
          🚀 Explore Quizzes
        </h1>
        <p className="text-xl mt-3 opacity-90">
          Challenge yourself & test your knowledge!
        </p>

        {/* Decorative Elements */}
        <div className="absolute top-6 left-10 w-24 h-24 bg-teal-300 opacity-30 blur-3xl rounded-full"></div>
        <div className="absolute top-14 right-16 w-32 h-32 bg-teal-200 opacity-20 blur-4xl rounded-full"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-10 bg-teal-400 opacity-25 blur-2xl rounded-full"></div>

        {/* Search Bar */}
        <div className="mt-10 flex justify-center">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="px-5 py-3 w-96 rounded-full text-gray-800 border-2 border-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-500 shadow-lg transition-all duration-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Quiz Cards */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-grow">
        {filteredQuizzes.length === 0 ? (
          <div>
            <button className="text-xl px-4 py-3 text-white bg-gradient-to-tr from-teal-300 to-bg-teal-700 hover:bg-gradient-to-bl rounded-xl">
              +Create Quiz
            </button>
            <p className="text-center text-gray-600 text-lg">
              No quizzes found.
            </p>
          </div>
        ) : (
          <div>
            <div className="w-full mb-5 flex justify-between">
              <h1 className="text-3xl text-teal-900 font-bold">Courses:</h1>
              <button className="text-xl px-4 py-3 text-white bg-gradient-to-tr from-teal-400 to-teal-600 hover:bg-gradient-to-bl rounded-xl" onClick={()=>{router.push(`/${role}/quizzes/upload`)}}>
                +Create Quiz
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.quizid}
                  className="relative flex flex-col justify-between bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-teal-400 transform hover:-translate-y-3 overflow-hidden"
                >
                  <div className="flex flex-col">
                    <h3 className="text-3xl font-extrabold text-teal-700 mb-2">
                      {quiz.quiztitle}
                    </h3>
                    <p className="text-gray-600 mb-2 leading-relaxed">
                      {quiz.quizdescription}
                    </p>
                    <p className="font-semibold text-teal-800 text-lg">
                      <span className="font-medium">Course:</span>{" "}
                      {quiz.coursetitle}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Instructor:</span>{" "}
                      {quiz.teachername}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Classes:</span>{" "}
                      {quiz.assignedclasses}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Created On:</span>{" "}
                      {new Date(quiz.createdat).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="mt-6 w-full py-3 text-gray-800 outline-gray-200 outline-2 outline font-bold rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
                      onClick={() => {
                        router.push(
                          `/${role}/courses/course/` + quiz.quizcourseid
                        );
                      }}
                    >
                      View Course
                    </button>
                    <button
                      className="mt-6 w-full py-3 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center"
                      onClick={() => {
                        router.push(`/${role}/quizzes/quiz/${quiz.quizid}`);
                      }}
                    >
                      🏆 Start Quiz
                    </button>
                  </div>
                  <div className="absolute -top-10 -left-10 w-28 h-28 bg-teal-300 opacity-20 blur-3xl rounded-full"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-teal-400 opacity-10 blur-2xl rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-8 rounded-t-3xl shadow-inner">
        <p>© {new Date().getFullYear()} Quiz Galaxy | All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-lg">
          <a href="#" className="hover:text-teal-400 transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-teal-400 transition">
            Terms of Service
          </a>
          <a href="#" className="hover:text-teal-400 transition">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AllQuizPage;
