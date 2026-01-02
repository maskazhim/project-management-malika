import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Hexagon, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { login, team } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email)) {
      navigate('/');
    } else {
      setError('Email not found in team registry.');
    }
  };

  // Quick fill for demo
  const quickLogin = (demoEmail: string) => {
      setEmail(demoEmail);
      login(demoEmail);
      navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg mb-4">
                <Hexagon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to Malika AI</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your agency workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Email</label>
                <input 
                    type="email" 
                    required 
                    placeholder="you@malika.ai"
                    className="w-full rounded-xl border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 p-3 text-gray-900 placeholder-gray-400"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                />
            </div>
            
            {error && (
                <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex justify-center items-center"
            >
                Enter Workspace <ArrowRight className="w-4 h-4 ml-2" />
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200/60">
            <p className="text-xs text-gray-400 text-center mb-3">Quick Login (Demo)</p>
            <div className="flex flex-wrap justify-center gap-2">
                {team.map(m => (
                    <button 
                        key={m.id} 
                        onClick={() => quickLogin(m.email)}
                        className="text-xs bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 px-3 py-1 rounded-full transition-colors"
                    >
                        {m.name}
                    </button>
                ))}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;