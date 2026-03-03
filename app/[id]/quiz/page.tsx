"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: string;
  quizId: string;
  question: string;
  answers: string[];
  correct: string;
}

interface Quiz {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  questions: Question[];
  createdAt: string;
}

const QuizPageTake = () => {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const quizId = params.id as string;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${quizId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.status}`);
        }

        const data: Quiz = await response.json();
        setQuiz(data);

        // Initialize answers object
        const initialAnswers: Record<string, string> = {};
        data.questions.forEach((q) => {
          initialAnswers[q.id] = "";
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!submitted) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: answer,
      }));
    }
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let correctCount = 0;
    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correct) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    if (quiz) {
      const initialAnswers: Record<string, string> = {};
      quiz.questions.forEach((q) => {
        initialAnswers[q.id] = "";
      });
      setAnswers(initialAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="p-4 bg-red-50 border border-red-300 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-slate-600">Quiz not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full py-25 overflow-auto flex justify-center bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {quiz.title}
            </h1>
            <p className="text-sm text-slate-500">
              {quiz.questions.length} question
              {quiz.questions.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="text-sm text-slate-500">
                {Math.round(
                  ((currentQuestionIndex + 1) / quiz.questions.length) * 100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Results */}
          {submitted && (
            <div
              className={`mb-8 p-6 rounded-lg border ${
                score >= quiz.questions.length / 2
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Your Score: {score} / {quiz.questions.length}
              </h2>
              <p className="text-slate-700">
                You got {Math.round((score / quiz.questions.length) * 100)}%
                correct
              </p>
            </div>
          )}

          {/* Current Question */}
          {!submitted && quiz.questions[currentQuestionIndex] && (
            <div
              className={`p-6 border rounded-lg mb-8 ${"bg-slate-50 border-slate-300"}`}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {currentQuestionIndex + 1}.{" "}
                {quiz.questions[currentQuestionIndex].question}
              </h3>

              <div className="space-y-3">
                {quiz.questions[currentQuestionIndex].answers.map(
                  (answer, answerIndex) => (
                    <label
                      key={answerIndex}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        answers[quiz.questions[currentQuestionIndex].id] ===
                        answer
                          ? "bg-blue-100 border-blue-500"
                          : "bg-white border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name={quiz.questions[currentQuestionIndex].id}
                        value={answer}
                        checked={
                          answers[quiz.questions[currentQuestionIndex].id] ===
                          answer
                        }
                        onChange={() =>
                          handleAnswerSelect(
                            quiz.questions[currentQuestionIndex].id,
                            answer,
                          )
                        }
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-slate-700">{answer}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Results View - Show All Questions */}
          {submitted && (
            <div className="space-y-8 mb-8">
              {quiz.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-6 border rounded-lg ${
                    answers[question.id] === question.correct
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {index + 1}. {question.question}
                  </h3>

                  <div className="space-y-3">
                    {question.answers.map((answer, answerIndex) => (
                      <label
                        key={answerIndex}
                        className={`flex items-center p-3 border rounded-lg ${
                          answers[question.id] === answer
                            ? "bg-blue-100 border-blue-500"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={answer}
                          checked={answers[question.id] === answer}
                          disabled
                          className="mr-3 w-4 h-4"
                        />
                        <span className="text-slate-700">{answer}</span>

                        {answer === question.correct && (
                          <span className="ml-auto text-green-600 font-semibold">
                            ✓ Correct
                          </span>
                        )}

                        {answers[question.id] === answer &&
                          answer !== question.correct && (
                            <span className="ml-auto text-red-600 font-semibold">
                              ✗ Incorrect
                            </span>
                          )}
                      </label>
                    ))}
                  </div>

                  {answers[question.id] !== question.correct && (
                    <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Correct answer:</span>{" "}
                        {question.correct}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!submitted ? (
              <>
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1 bg-white text-slate-900 border-slate-300 hover:bg-slate-50 font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </Button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    Next
                  </Button>
                )}

                <Button
                  onClick={() => router.push(`/${quizId}`)}
                  variant="outline"
                  className="flex-1 bg-white text-slate-900 border-slate-300 hover:bg-slate-50 font-semibold py-3"
                >
                  Back
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleRetake}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  Retake Quiz
                </Button>
                <Button
                  onClick={() => router.push(`/${quizId}`)}
                  variant="outline"
                  className="flex-1 bg-white text-slate-900 border-slate-300 hover:bg-slate-50 font-semibold py-3"
                >
                  Back to Quiz
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPageTake;
