import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        user = await authService.register(email, password);
      }

      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.loginWithGoogle();
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#262626] border-4 border-[#FFE066] shadow-[8px_8px_0px_0px_#8CBED6] p-8 animate-fade-in">

        <div className="text-center mb-8">
          <div className="inline-block bg-black text-[#FFE066] border-2 border-[#FFE066] p-3 text-2xl font-black mb-4 shadow-[4px_4px_0px_0px_#8CBED6]">
            CC
          </div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join the Club'}
          </h1>
          <p className="text-[#E0E0E0] mt-2 font-medium">
            Career Companion System v1.0
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#FFE066] font-bold mb-2 uppercase text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1A1A] border-2 border-[#404040] text-white p-3 font-bold focus:outline-none focus:border-[#8CBED6] focus:shadow-[4px_4px_0px_0px_#8CBED6] transition-all"
              placeholder="ENTER EMAIL"
            />
          </div>

          <div>
            <label className="block text-[#FFE066] font-bold mb-2 uppercase text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border-2 border-[#404040] text-white p-3 font-bold focus:outline-none focus:border-[#8CBED6] focus:shadow-[4px_4px_0px_0px_#8CBED6] transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 p-3 flex items-center gap-2 text-red-500 font-bold text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFE066] text-black border-2 border-black p-4 font-black uppercase tracking-wide hover:bg-[#E6C64C] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? <><LogIn size={20} /> Access System</> : <><UserPlus size={20} /> Initialize User</>)}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-[2px] bg-[#404040] flex-1"></div>
          <span className="text-[#888] font-bold uppercase text-sm">OR</span>
          <div className="h-[2px] bg-[#404040] flex-1"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-black border-2 border-[#404040] p-4 font-bold uppercase tracking-wide hover:bg-gray-100 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#8CBED6] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center gap-2 mb-6 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="pt-6 border-t-2 border-[#404040] text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[#8CBED6] font-bold hover:text-white underline underline-offset-4 decoration-2 decoration-[#FFE066]"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};