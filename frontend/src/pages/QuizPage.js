import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function QuizPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/quiz/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data.questions);
      setAnswers(new Array(response.data.questions.length).fill(''));
      setQuizStarted(true);
      toast.success('Quiz loaded! Good luck!');
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.some(answer => !answer)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/quiz/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      toast.success(`Quiz completed! You scored ${response.data.score}/${response.data.total_questions}`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
    setQuizStarted(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#1A4D2E] hover:bg-[#F5F5F0] rounded-full"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Quiz Start Screen */}
        {!quizStarted && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#E8F5E9] rounded-2xl flex items-center justify-center">
                <Brain className="w-10 h-10 text-[#1A4D2E]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] mb-4">
              Gardening Knowledge Quiz
            </h1>
            <p className="text-lg text-stone-600 mb-8">
              Test your knowledge of soil types, plant care, and gardening fundamentals
            </p>
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] mb-8">
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#4CAF50]" />
                  <p className="text-stone-700">5 multiple-choice questions</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#4CAF50]" />
                  <p className="text-stone-700">AI-generated unique questions</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-[#4CAF50]" />
                  <p className="text-stone-700">Track your progress over time</p>
                </div>
              </div>
            </div>
            <Button
              onClick={startQuiz}
              disabled={loading}
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6 text-lg"
              data-testid="start-quiz-btn"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Quiz Questions */}
        {quizStarted && !result && questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-stone-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-[#1A4D2E]">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#1A4D2E]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] mb-8"
                data-testid="question-card"
              >
                <h2 className="text-2xl font-heading text-[#1A4D2E] mb-6" data-testid="question-text">
                  {questions[currentQuestion].question}
                </h2>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-2xl border-2 ${
                        answers[currentQuestion] === option
                          ? 'border-[#1A4D2E] bg-[#E8F5E9]'
                          : 'border-stone-200 hover:border-[#1A4D2E]/30 hover:bg-[#F5F5F0]'
                      }`}
                      data-testid={`option-${index}`}
                    >
                      <span className="font-medium text-[#2C3329]">{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="rounded-full px-8 py-6 border-[#1A4D2E] text-[#1A4D2E]"
                data-testid="previous-btn"
              >
                Previous
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !answers[currentQuestion]}
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6"
                  data-testid="submit-quiz-btn"
                >
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion]}
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6"
                  data-testid="next-btn"
                >
                  Next
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Quiz Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
            data-testid="result-section"
          >
            <div className="flex justify-center mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                result.percentage >= 80 ? 'bg-[#D9F99D]' :
                result.percentage >= 60 ? 'bg-[#F2CCB7]' : 'bg-stone-200'
              }`}>
                {result.percentage >= 80 ? (
                  <CheckCircle className="w-12 h-12 text-[#1A4D2E]" />
                ) : (
                  <Brain className="w-12 h-12 text-stone-700" />
                )}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] mb-4">
              Quiz Complete!
            </h1>
            <p className="text-lg text-stone-600 mb-8">
              {result.percentage >= 80 ? 'Excellent work! You\'re a gardening expert!' :
               result.percentage >= 60 ? 'Good job! Keep learning and growing!' :
               'Nice try! Review the material and try again.'}
            </p>
            <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-sm text-stone-600 mb-2">Score</p>
                  <p className="text-3xl font-heading font-semibold text-[#1A4D2E]" data-testid="final-score">
                    {result.score}/{result.total_questions}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Percentage</p>
                  <p className="text-3xl font-heading font-semibold text-[#1A4D2E]" data-testid="final-percentage">
                    {result.percentage.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-2">Grade</p>
                  <p className={`text-3xl font-heading font-semibold ${
                    result.percentage >= 80 ? 'text-[#4CAF50]' :
                    result.percentage >= 60 ? 'text-[#E07A5F]' : 'text-stone-500'
                  }`}>
                    {result.percentage >= 80 ? 'A' :
                     result.percentage >= 60 ? 'B' : 'C'}
                  </p>
                </div>
              </div>
              
              {/* Answer Review */}
              <div className="text-left space-y-4">
                <h3 className="text-xl font-heading font-medium text-[#1A4D2E] mb-4">Answer Review</h3>
                {questions.map((question, index) => (
                  <div key={index} className="p-4 bg-[#F5F5F0] rounded-2xl">
                    <p className="font-medium text-[#2C3329] mb-2">{question.question}</p>
                    <div className="flex items-start gap-2">
                      {answers[index] === result.correct_answers[index] ? (
                        <CheckCircle className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm text-stone-600">
                          Your answer: <span className={answers[index] === result.correct_answers[index] ? 'text-[#4CAF50] font-medium' : 'text-[#E07A5F] font-medium'}>{answers[index]}</span>
                        </p>
                        {answers[index] !== result.correct_answers[index] && (
                          <p className="text-sm text-stone-600">
                            Correct answer: <span className="text-[#4CAF50] font-medium">{result.correct_answers[index]}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="rounded-full px-8 py-6 border-[#1A4D2E] text-[#1A4D2E]"
                data-testid="back-to-dashboard-result-btn"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={handleRestart}
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6"
                data-testid="take-another-quiz-btn"
              >
                Take Another Quiz
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
