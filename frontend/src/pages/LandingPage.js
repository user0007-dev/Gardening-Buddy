import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Camera, Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-[#1A4D2E]" />
            <span className="text-2xl font-heading font-semibold text-[#1A4D2E]">Verdant</span>
          </div>
          <div className="flex gap-4">
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6 text-lg"
                data-testid="go-to-dashboard-btn"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')} 
                  className="text-[#1A4D2E] rounded-full px-6 py-4"
                  data-testid="login-nav-btn"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/signup')} 
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-6 py-4"
                  data-testid="signup-nav-btn"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-heading tracking-tight leading-none text-[#1A4D2E] mb-6">
                Cultivate your sanctuary.
              </h1>
              <p className="text-lg md:text-xl font-body leading-relaxed text-stone-700 mb-8">
                Transform your home into a thriving garden. Learn, grow, and nurture with AI-powered guidance and expert knowledge.
              </p>
              <Button 
                onClick={() => navigate(user ? '/dashboard' : '/signup')} 
                className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6 text-lg hover:scale-105 active:scale-95 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]"
                data-testid="hero-cta-btn"
              >
                Start Growing <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] rounded-3xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)]"
            >
              <img 
                src="https://images.unsplash.com/photo-1738951260025-cfaf2517e698?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxsdXNoJTIwdmVnZXRhYmxlJTIwZ2FyZGVuJTIwY2xvc2UlMjB1cHxlbnwwfHx8fDE3NjUyNTc0MDZ8MA&ixlib=rb-4.1.0&q=85"
                alt="Lush garden"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-[#F5F5F0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] text-center mb-16">
            Everything you need to succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] group"
            >
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1A4D2E]">
                <Leaf className="w-8 h-8 text-[#1A4D2E] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-heading font-medium text-[#1A4D2E] mb-4">Plant Library</h3>
              <p className="text-base font-body leading-relaxed text-stone-600">
                Explore a curated collection of vegetables, fruits, and herbs perfect for home growing. Learn specific care requirements for each plant.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] group"
            >
              <div className="w-16 h-16 bg-[#F2CCB7] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E07A5F]">
                <Camera className="w-8 h-8 text-[#E07A5F] group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-heading font-medium text-[#1A4D2E] mb-4">AI Plant ID</h3>
              <p className="text-base font-body leading-relaxed text-stone-600">
                Snap a photo of any plant and get instant identification with detailed care instructions powered by advanced AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] group"
            >
              <div className="w-16 h-16 bg-[#D9F99D] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#BEF264]">
                <Brain className="w-8 h-8 text-[#1A4D2E] group-hover:text-[#1A4D2E]" />
              </div>
              <h3 className="text-2xl font-heading font-medium text-[#1A4D2E] mb-4">Knowledge Quiz</h3>
              <p className="text-base font-body leading-relaxed text-stone-600">
                Test and improve your gardening knowledge with interactive quizzes. Track your progress and become an expert.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] mb-6">
              Ready to grow your own food?
            </h2>
            <p className="text-lg md:text-xl font-body leading-relaxed text-stone-700 mb-8">
              Join thousands of home gardeners cultivating their own fresh produce.
            </p>
            <Button 
              onClick={() => navigate('/signup')} 
              className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white rounded-full px-8 py-6 text-lg hover:scale-105 active:scale-95 shadow-[0_4px_20px_-2px_rgba(224,122,95,0.3)]"
              data-testid="bottom-cta-btn"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-[#1A4D2E] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-6 h-6" />
            <span className="text-xl font-heading font-semibold">Verdant</span>
          </div>
          <p className="text-sm text-[#C8E6C9]">© 2025 Verdant. Cultivating home gardens worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
