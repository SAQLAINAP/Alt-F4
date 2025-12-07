import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      const user = authService.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } else {
      const success = authService.register(username, password);
      if (success) {
        // Auto login after register
        const user = authService.login(username, password);
        if (user) onLogin(user);
      } else {
        setError('Username already exists');
      }
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
            <label className="block text-[#FFE066] font-bold mb-2 uppercase text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1A1A1A] border-2 border-[#404040] text-white p-3 font-bold focus:outline-none focus:border-[#8CBED6] focus:shadow-[4px_4px_0px_0px_#8CBED6] transition-all"
              placeholder="ENTER ID"
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
            className="w-full bg-[#FFE066] text-black border-2 border-black p-4 font-black uppercase tracking-wide hover:bg-[#E6C64C] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_black] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isLogin ? <><LogIn size={20} /> Access System</> : <><UserPlus size={20} /> Initialize User</>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-[#404040] text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[#8CBED6] font-bold hover:text-white underline underline-offset-4 decoration-2 decoration-[#FFE066]"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an ID? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};