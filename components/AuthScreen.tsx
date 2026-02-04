
import React, { useState, useEffect } from 'react';
import { Icons, BRAND } from '../constants';
import { supabase } from '../utils/supabase';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
  initialLoginState?: boolean;
  onBack?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, initialLoginState = true, onBack }) => {
  const [isLogin, setIsLogin] = useState(initialLoginState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for remembered email on mount
    const savedEmail = localStorage.getItem('surveillance_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Persistence Logic for email
      if (rememberMe) {
        localStorage.setItem('surveillance_remembered_email', email);
      } else {
        localStorage.removeItem('surveillance_remembered_email');
      }

      if (isLogin) {
        // Supabase Login
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            role: 'admin'
          });
        }
      } else {
        // Supabase Signup
        if (!name) throw new Error("Name is required.");
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
        if (authError) throw authError;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email,
            name: name,
            role: 'admin'
          });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Back to Home Link */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center space-x-2 text-secondary hover:text-primary transition-colors z-50 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-xs font-black uppercase tracking-widest">Return to Home</span>
        </button>
      )}

      {/* Static Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-8 md:mb-10 flex flex-col items-center">
          <img src={BRAND.logo} alt="Brand Logo" className="w-20 h-20 mb-4 logo-tactical" />
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-primary">{BRAND.name}</h1>
          <p className="text-[9px] md:text-[10px] text-secondary font-black uppercase tracking-[0.4em] mt-2">Tactical Intelligence Portal</p>
        </div>

        <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl backdrop-blur-xl bg-surface/80">
          <div className="flex mb-8 bg-background p-1 rounded-2xl border border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
            >
              Access
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {!isLogin && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary mb-2 ml-1">Personnel Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 outline-none focus:border-blue-500 transition-all text-sm font-bold text-primary"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 outline-none focus:border-blue-500 transition-all text-sm font-bold text-primary"
                placeholder="operator@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 md:px-5 py-3 md:py-4 outline-none focus:border-blue-500 transition-all text-sm font-bold text-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault();
                  setRememberMe(!rememberMe);
                }}
              >
                <div
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'border-border bg-background'}`}
                >
                  {rememberMe && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors select-none">Remember Operative</span>
              </label>
              <button type="button" className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 hover:text-blue-500 transition-colors">Forgot Password?</button>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-in shake duration-300">
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>{isLogin ? 'INITIATE SECURE LOGIN' : 'Register New Operative'}</span>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-1">
          <p className="text-[9px] md:text-[10px] text-secondary font-black uppercase tracking-[0.3em] opacity-30 px-4 leading-relaxed">
            SurveillanceChat
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
