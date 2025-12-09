import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Library, Camera, Brain, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const response = await axios.get(`${API}/quiz/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const avgScore = quizHistory.length > 0 
    ? (quizHistory.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizHistory.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-[#1A4D2E]" />
            <span className="text-2xl font-heading font-semibold text-[#1A4D2E]">Verdant</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] rounded-full">
              <User className="w-4 h-4 text-[#1A4D2E]" />
              <span className="text-sm font-medium text-[#2C3329]" data-testid="user-name">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-[#1A4D2E] hover:bg-[#F5F5F0] rounded-full"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] mb-4" data-testid="dashboard-welcome">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-lg text-stone-600">Your gardening journey continues here.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]"
            data-testid="quizzes-taken-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-2xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Quizzes Taken</p>
                <p className="text-3xl font-heading font-semibold text-[#1A4D2E]" data-testid="quiz-count">{quizHistory.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]"
            data-testid="avg-score-card"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#D9F99D] rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-stone-600">Average Score</p>
                <p className="text-3xl font-heading font-semibold text-[#1A4D2E]" data-testid="avg-score">{avgScore}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F2CCB7] rounded-2xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#E07A5F]" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Growing</p>
                <p className="text-3xl font-heading font-semibold text-[#1A4D2E]">Strong</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-heading text-[#1A4D2E] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/plants')}
              className="bg-white rounded-3xl p-6 hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] group text-left border border-stone-100"
              data-testid="browse-plants-btn"
            >
              <Library className="w-8 h-8 text-[#1A4D2E] mb-4" />
              <h3 className="text-xl font-heading font-medium text-[#1A4D2E] mb-2">Browse Plants</h3>
              <p className="text-sm text-stone-600">Explore our plant library</p>
            </button>

            <button
              onClick={() => navigate('/identify')}
              className="bg-white rounded-3xl p-6 hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] group text-left border border-stone-100"
              data-testid="identify-plant-btn"
            >
              <Camera className="w-8 h-8 text-[#E07A5F] mb-4" />
              <h3 className="text-xl font-heading font-medium text-[#1A4D2E] mb-2">Identify Plant</h3>
              <p className="text-sm text-stone-600">Use AI to identify plants</p>
            </button>

            <button
              onClick={() => navigate('/quiz')}
              className="bg-white rounded-3xl p-6 hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] group text-left border border-stone-100"
              data-testid="take-quiz-btn"
            >
              <Brain className="w-8 h-8 text-[#1A4D2E] mb-4" />
              <h3 className="text-xl font-heading font-medium text-[#1A4D2E] mb-2">Take Quiz</h3>
              <p className="text-sm text-stone-600">Test your knowledge</p>
            </button>
          </div>
        </motion.div>

        {/* Recent Quiz History */}
        {quizHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-heading text-[#1A4D2E] mb-6">Recent Quiz Attempts</h2>
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]" data-testid="quiz-history">
              <div className="space-y-4">
                {quizHistory.slice(0, 5).map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="flex justify-between items-center p-4 bg-[#F5F5F0] rounded-2xl"
                    data-testid={`quiz-attempt-${index}`}
                  >
                    <div>
                      <p className="font-medium text-[#2C3329]">
                        Score: {attempt.score}/{attempt.total_questions}
                      </p>
                      <p className="text-sm text-stone-600">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-heading font-semibold ${
                        attempt.percentage >= 80 ? 'text-[#4CAF50]' : 
                        attempt.percentage >= 60 ? 'text-[#E07A5F]' : 'text-stone-500'
                      }`}>
                        {attempt.percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
