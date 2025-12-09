import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signup(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create account');
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
          
          <h1 className="text-4xl font-heading tracking-tight text-[#1A4D2E] mb-2">Start growing today</h1>
          <p className="text-base text-stone-600 mb-8">Create your free account</p>
          
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="signup-form">
            <div>
              <Label htmlFor="name" className="text-[#2C3329]">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 bg-white border-stone-200 focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20 rounded-xl px-4 py-3"
                placeholder="John Doe"
                data-testid="signup-name-input"
              />
            </div>
            
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
                data-testid="signup-email-input"
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
                minLength={6}
                className="mt-2 bg-white border-stone-200 focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20 rounded-xl px-4 py-3"
                placeholder="••••••••"
                data-testid="signup-password-input"
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6 text-lg"
              data-testid="signup-submit-btn"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1A4D2E] hover:underline font-medium" data-testid="login-link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      
      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1723347101054-c246b0034f11?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBoYXJ2ZXN0JTIwYmFza2V0fGVufDB8fHx8MTc2NTI1NzQxMXww&ixlib=rb-4.1.0&q=85"
          alt="Fresh vegetables"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
