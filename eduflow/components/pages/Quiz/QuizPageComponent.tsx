"use client";
import { QuizDetails, QuizQuestions } from "@/types";
import { getRole, getUserId, setToken } from "@/utils/util";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface QuizPageComponentProps {
  quizId: number;
}

const QuizPageComponent = ({ quizId }: QuizPageComponentProps) => {
  const [quizDetails, setQuizDetails] = useState<QuizDetails>();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestions[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<
    number | null
  >(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0); // in seconds
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const router = useRouter();
  const userId = getUserId();
  const role = getRole();

  const fetchQuiz = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/quiz/${quizId}`;
      setToken();
      const { data } = await axios.get(url);
      setQuizDetails(data.data.quizDetails);
      setQuizQuestions(data.data.questions);
    } catch (error) {
      console.error("Error Occurred: ", error);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let timeCounter: NodeJS.Timeout | null = null;

    if (currentQuestionIndex !== null) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer!);
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timeCounter = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (timeCounter) clearInterval(timeCounter);
    };
  }, [currentQuestionIndex]);

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSkippedCount(0);
    setTimeSpent(0);
    setTimeLeft(quizQuestions.length * 60); // 1 min for each question
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer) {
      const correct =
        selectedAnswer === quizQuestions[currentQuestionIndex!].correctanswer;
      if (correct) {
        setScore(score + 4);
        setCorrectCount(correctCount + 1);
      } else {
        setScore(score - 1);
        setWrongCount(wrongCount + 1);
      }
    }

    setShowAnswer(true);
    setTimeout(() => {
      setShowAnswer(false);
      setSelectedAnswer(null);
      if (
        currentQuestionIndex !== null &&
        currentQuestionIndex < quizQuestions.length - 1
      ) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleQuizSubmit();
      }
    }, 3000);
  };

  const handleSkipQuestion = () => {
    setSkippedCount(skippedCount + 1);
    setSelectedAnswer(null);
    if (
      currentQuestionIndex !== null &&
      currentQuestionIndex < quizQuestions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handleQuizSubmit = async () => {
    setCurrentQuestionIndex(null);
    setShowResult(true);
    //save QuizResults
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/quizResults`,
      {
        quizId,
        userId,
        totalQues: quizQuestions.length,
        correctCount,
        wrongCount,
        skippedCount,
        timeSpent,
        score,
      }
    );
    if (data.status === "success") {
      console.log(data.message);
    } else {
      alert(data.message);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-teal-100 p-6">
      {currentQuestionIndex === null && !showResult && (
        <div className="bg-white shadow-lg rounded-lg m-20 p-8 text-center w-fit h-fit border-4 border-teal-500">
          {quizDetails && (
            <div>
              <h1 className="text-4xl font-bold text-teal-700">
                {quizDetails.quiztitle}
              </h1>
              <p className="text-teal-600 mt-4 text-lg">
                {quizDetails.quizdescription}
              </p>
              <p className="mt-3 text-teal-700 text-lg">
                <strong>Course:</strong> {quizDetails.coursetitle}
              </p>
              <p className="text-teal-700 text-lg">
                <strong>Teacher:</strong> {quizDetails.teachername}
              </p>
              <p className="text-teal-700 text-lg">
                <strong>Assigned Classes:</strong> {quizDetails.assignedclasses}
              </p>
              <p className="text-teal-700 text-lg">
                <strong>Noof Questions:</strong> {quizQuestions.length}
              </p>
              <h1 className="text-xl text-left font-bold text-teal-700">
                Quiz Rules
              </h1>
              <ul className="text-lg text-teal-600 mt-4 text-left">
                <li>✅ +4 for each correct answer</li>
                <li>❌ -1 for each wrong answer</li>
                <li>🔄 0 for skipped questions</li>
                <li>⏳ Time limit: {quizQuestions.length} minites</li>
              </ul>
              <button
                onClick={handleStartQuiz}
                className="mt-6 bg-teal-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-teal-600 transition duration-300 text-lg"
              >
                Start Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {currentQuestionIndex !== null && (
        <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full border-4 border-teal-500">
          <div className="flex justify-between w-full px-4">
            <h2 className="text-3xl font-semibold text-teal-700">
              Question {currentQuestionIndex + 1}
            </h2>
            <div className="text-lg font-semibold text-red-500">
              ⏳ {formatTime(timeLeft)}
            </div>
          </div>
          <div className="w-full flex justify-between px-4 my-1">
            <div className="text-teal-600 mx-2 mt-4 text-left text-lg">
              Q) {quizQuestions[currentQuestionIndex].question}
            </div>
            <div
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                quizQuestions[currentQuestionIndex].difficulty === "Easy"
                  ? "bg-green-400"
                  : quizQuestions[currentQuestionIndex].difficulty === "Medium"
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
            >
              {quizQuestions[currentQuestionIndex].difficulty}
            </div>
          </div>
          <ul className="mt-6 space-y-4">
            {["a", "b", "c", "d"].map((option) => (
              <li key={option}>
                <button
                  onClick={() => setSelectedAnswer(option.toUpperCase())}
                  disabled={showAnswer}
                  className={`w-full px-6 py-3 rounded-lg shadow-md transition duration-300 text-lg ${
                    selectedAnswer === option.toUpperCase()
                      ? "bg-teal-400 text-white"
                      : "outline outline-1 outline-gray-200 text-teal-800"
                  } text-left hover:bg-teal-400 hover:text-white`}
                >
                  {option.toUpperCase()}){" "}
                  {
                    quizQuestions[currentQuestionIndex][
                      `option${option}` as keyof QuizQuestions
                    ]
                  }
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer || showAnswer}
            className="mt-6 bg-green-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400 transition duration-300 text-lg"
          >
            Submit Answer
          </button>
          <button
            onClick={handleSkipQuestion}
            className="mt-6 ml-4 bg-yellow-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 text-lg"
          >
            Skip
          </button>
          {showAnswer && (
            <p className="mt-6 text-xl font-bold text-green-500">
              Correct Answer:{" "}
              {
                quizQuestions[currentQuestionIndex][
                  `option${quizQuestions[
                    currentQuestionIndex
                  ].correctanswer.toLowerCase()}` as keyof QuizQuestions
                ]
              }
            </p>
          )}
        </div>
      )}

      {showResult && (
        <div className="bg-white shadow-xl rounded-2xl p-10 text-center w-full max-w-2xl border-4 border-teal-500">
          <h1 className="text-4xl font-extrabold text-teal-700 mb-6">
            🎉 Quiz Completed! 🎉
          </h1>

          <div className="bg-teal-50 text-teal-900 p-6 rounded-xl shadow-md">
            <p className="text-2xl font-semibold">Final Score</p>
            <p className="text-5xl font-extrabold text-teal-700 mt-2">
              {score} / {quizQuestions.length * 4}
            </p>

            <div className="mt-6 flex justify-center gap-6">
              <div className="flex flex-col items-center p-6 bg-green-100 text-green-800 rounded-xl shadow-md w-24">
                ✅ <span className="text-3xl font-bold">{correctCount}</span>
                <span className="text-sm font-semibold">Correct</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-red-100 text-red-800 rounded-xl shadow-md w-24">
                ❌ <span className="text-3xl font-bold">{wrongCount}</span>
                <span className="text-sm font-semibold">Wrong</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-yellow-100 text-yellow-800 rounded-xl shadow-md w-24">
                🔄 <span className="text-3xl font-bold">{skippedCount}</span>
                <span className="text-sm font-semibold">Skipped</span>
              </div>
            </div>

            <p className="mt-6 text-lg font-semibold text-teal-800">
              ⏳ Time Spent: {formatTime(timeSpent)}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                router.push(`/${role}`);
              }}
              className="mt-8 bg-teal-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-lg hover:bg-teal-600 transition-all duration-300"
            >
              Go Home 🏠
            </button>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 bg-teal-500 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-lg hover:bg-teal-600 transition-all duration-300"
            >
              Try Again 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPageComponent;
