import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-[#1A4D2E]" />
            <span className="text-2xl font-heading font-semibold text-[#1A4D2E]">Verdant</span>
          </Link>
          
          <h1 className="text-4xl font-heading tracking-tight text-[#1A4D2E] mb-2">Welcome back</h1>
          <p className="text-base text-stone-600 mb-8">Continue your gardening journey</p>
          
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-[#2C3329]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 bg-white border-stone-200 focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20 rounded-xl px-4 py-3"
                placeholder="you@example.com"
                data-testid="login-email-input"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-[#2C3329]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 bg-white border-stone-200 focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20 rounded-xl px-4 py-3"
                placeholder="••••••••"
                data-testid="login-password-input"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6 text-lg"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-stone-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1A4D2E] hover:underline font-medium" data-testid="signup-link">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1712912828110-7d541554f05d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxwZXJzb24lMjBoYW5kcyUyMGhvbGRpbmclMjBzb2lsJTIwcGxhbnR8ZW58MHx8fHwxNzY1MjU3NDA4fDA&ixlib=rb-4.1.0&q=85"
          alt="Person holding plant"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
