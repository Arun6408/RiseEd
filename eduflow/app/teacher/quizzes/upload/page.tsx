"use client";
import React, { useEffect, useState } from "react";
import TeacherLayout from "../../TeacherLayout";
import axios from "axios";
import { motion } from "framer-motion";
import { Course } from "@/types";
import { getCourses } from "@/utils/util";

type Question = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  difficulty: string;
};

type QuizData = {
  quizTitle: string;
  quizDescription: string;
  quizCourseId: string;
  assignedClasses: string;
  questions: Question[];
};

const QuizForm: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  const [quizData, setQuizData] = useState<QuizData>({
    quizTitle: "",
    quizDescription: "",
    quizCourseId: "",
    assignedClasses: "",
    questions: [
      {
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        difficulty: "",
      },
    ],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index][e.target.name as keyof Question] = e.target.value;
    setQuizData({ ...quizData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
          difficulty: "",
        },
      ],
    });
  };
  const clearForm = () => {
    setQuizData({
      quizTitle: "",
      quizDescription: "",
      quizCourseId: "",
      assignedClasses: "",
      questions: [
        {
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "",
          difficulty: "",
        },
      ],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/quiz", quizData);
      alert("Quiz created successfully");
      clearForm();
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses(null);
        setCourses(data);
      } catch (err) {
        console.log("Error fetching courses");
      }
    };
    fetchCourses();
  }, []);

  return (
    <TeacherLayout activeLink="/teacher/quizzes">
      <motion.div
        className="p-8 mx-auto bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Create a New Quiz
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full flex items-center justify-evenly py-2">
          <div className="w-full px-4">
            <label className="w-full block text-lg font-semibold mb-2">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="text"
              name="quizTitle"
              value={quizData.quizTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full px-4">
            <label className="w-full block text-lg font-semibold mb-2">
              Quiz Description <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="text"
              name="quizDescription"
              value={quizData.quizDescription}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col w-full px-4">
            <label htmlFor="chapter-title" className="w-full block text-lg font-semibold mb-2">
              Select Course
              <span className="text-red-500 text-xl">*</span>:
            </label>
            <select
              id="chapter-select"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              name="quizCourseId"
              onChange={handleChange}
              value={quizData.quizCourseId}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          </div>
          <div className="px-4">
            <label className="block text-lg font-semibold mb-2">
              Assigned to <span className="text-sm font-medium">(Classes seperated with comma&apos;s)</span> <span className="text-red-500">*</span>
            </label>
            <input
              className="w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="text"
              name="assignedClasses"
              value={quizData.assignedClasses}
              onChange={handleChange}
              required
            />
          </div>
          {quizData.questions.map((q, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 border-l-4 border-blue-500 shadow-md rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-3">
                Question {index + 1}
              </h3>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                type="text"
                name="question"
                placeholder="Enter question"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, e)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  type="text"
                  name="optionA"
                  placeholder="Option A"
                  value={q.optionA}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                />
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  type="text"
                  name="optionB"
                  placeholder="Option B"
                  value={q.optionB}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                />
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  type="text"
                  name="optionC"
                  placeholder="Option C"
                  value={q.optionC}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                />
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  type="text"
                  name="optionD"
                  placeholder="Option D"
                  value={q.optionD}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                />
              </div>
              <div className="flex gap-4">
              <div className='mt-3'>
                <label className='block text-lg font-semibold mb-2'>Correct Answer <span className='text-red-500'>*</span></label>
                <select className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' name='correctAnswer' value={q.correctAnswer} onChange={(e) => handleQuestionChange(index, e)} required>
                  <option value=''>Select Correct Answer</option>
                  <option value='A'>Option A</option>
                  <option value='B'>Option B</option>
                  <option value='C'>Option C</option>
                  <option value='D'>Option D</option>
                </select>
              </div>
              <div className='mt-3'>
                <label className='block text-lg font-semibold mb-2'>Difficulty Level <span className='text-red-500'>*</span></label>
                <select className='p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500' name='difficulty' value={q.difficulty} onChange={(e) => handleQuestionChange(index, e)} required>
                  <option value=''>Select Difficulty</option>
                  <option value='Easy'>Easy</option>
                  <option value='Medium'>Medium</option>
                  <option value='Hard'>Hard</option>
                </select>
              </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={addQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow-md transition-all"
            >
              Add Question
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all"
            >
              Submit Quiz
            </button>
          </div>
        </form>
      </motion.div>
    </TeacherLayout>
  );
};

export default QuizForm;