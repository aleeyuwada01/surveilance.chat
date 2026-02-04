import React, { useState } from 'react';
import { Icons, BRAND } from '../constants';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col relative overflow-x-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,14,20,0.9),rgba(10,14,20,0.95)),url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] z-0" />

      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onLogin}>
            <img src={BRAND.logo} alt="Logo" className="w-8 h-8 logo-tactical" />
            <span className="font-black italic uppercase tracking-tighter text-lg">{BRAND.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="text-sm font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={onSignup}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 pt-24">
        <div className="max-w-[1400px] mx-auto px-6 py-20 flex flex-col items-center">

          <div className="text-center mb-16 max-w-4xl mx-auto">
            {/* Badge Removed per user request */}

            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">
              Chat with your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600">Surveillance Camera!</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-secondary mb-10 font-medium leading-relaxed">
              Quickest way to review your security. Save hours of CCTV footage monitoring time using our AI solution.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLogin}
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] w-full sm:w-auto"
              >
                Login
              </button>
              <button
                onClick={onSignup}
                className="px-8 py-4 bg-surface/50 hover:bg-surface border border-white/10 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all backdrop-blur-md w-full sm:w-auto"
              >
                Create Account
              </button>
            </div>
          </div>

          {/* UI Preview Section (Dashboard Glimpse) */}
          <div className="w-full max-w-6xl mx-auto mb-32 relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-3xl opacity-50"></div>
            <div className="relative bg-surface border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[500px]">
              {/* Mock Video Player */}
              <div className="flex-1 bg-black relative group">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                  alt="Office CCTV"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                {/* Live Overlay */}
                <div className="absolute top-6 left-6 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Feed</span>
                </div>

                {/* Recognition Boxes (Simulated) */}
                <div className="absolute top-1/3 left-1/4 w-32 h-48 border-2 border-emerald-500/50 rounded-lg flex flex-col justify-end p-2 md:group-hover:opacity-100 opacity-60 transition-opacity">
                  <span className="bg-emerald-500 text-black text-[8px] font-bold px-1 py-0.5 self-start uppercase">Person 98%</span>
                </div>
              </div>

              {/* Mock Chat Interface */}
              <div className="w-full md:w-[400px] bg-surface border-l border-border flex flex-col">
                <div className="p-4 border-b border-border bg-background/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icons.MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Node Analysis</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                  {/* Chat Bubbles */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-xs font-bold shadow-lg">
                      What happened in the lobby at 2 PM?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-sm max-w-[90%] text-xs text-secondary shadow-sm">
                      <span className="text-[9px] font-black text-blue-400 block mb-1 uppercase tracking-wider">AI Analysis</span>
                      Reviewed 2:00 PM - 2:05 PM window.<br />
                      • Delivery personnel entry captured (2:01 PM)<br />
                      • Badge scan confirmed.<br />
                      • No unauthorized access detected.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] text-xs font-bold shadow-lg">
                      Any vehicles?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-sm max-w-[90%] text-xs text-secondary shadow-sm">
                      <span className="text-[9px] font-black text-blue-400 block mb-1 uppercase tracking-wider">AI Analysis</span>
                      Negative. No vehicle movement detected in the primary zone during this interval.
                    </div>
                  </div>
                </div>

                {/* Input Mock */}
                <div className="p-4 border-t border-border bg-background/30 backdrop-blur-sm">
                  <div className="bg-background border border-border rounded-xl p-3 flex items-center justify-between opacity-50">
                    <span className="text-xs text-secondary/50 font-medium">Ask a question about this footage...</span>
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="mb-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
                  Ask Surveillance.chat
                </h2>
                <p className="text-secondary leading-relaxed">
                  Let it explain to you in a detailed, timelined way (or summary if you prefer), what your cameras capture over any given time period.
                  Depending on your questions, it will pinpoint specific events and provide clear answers.
                </p>
                <p className="text-secondary leading-relaxed">
                  Even at <span className="text-blue-400 font-bold">x32 speed</span>, reviewing 24 hours of footage takes around 45 minutes.
                  <br />
                  <span className="text-white font-bold">Surveillance.chat</span> offers daily text summaries and intelligent search for quick retrieval of relevant footage.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FeatureCard icon={<Icons.Activity className="text-emerald-400" />} title="Daily Summaries" />
                <FeatureCard icon={<Icons.Search className="text-blue-400" />} title="Smart Search" />
                <FeatureCard icon={<Icons.Shield className="text-purple-400" />} title="Event Pinpointing" />
                <FeatureCard icon={<Icons.Mic className="text-orange-400" />} title="Instant Answers" />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="max-w-xl mx-auto mb-20">
            <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6 text-center">Contact Protocol</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-secondary mb-2">Operative Name</label>
                  <input type="text" className="w-full bg-background border border-border rounded-xl p-3 text-sm text-primary focus:border-blue-500 outline-none transition-colors" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-secondary mb-2">Comms Address</label>
                  <input type="email" className="w-full bg-background border border-border rounded-xl p-3 text-sm text-primary focus:border-blue-500 outline-none transition-colors" placeholder="email@secure.net" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-secondary mb-2">Message</label>
                  <textarea rows={4} className="w-full bg-background border border-border rounded-xl p-3 text-sm text-primary focus:border-blue-500 outline-none transition-colors" placeholder="Inquiry details..."></textarea>
                </div>
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all">
                  Transmit Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="text-secondary text-[10px] uppercase tracking-[0.2em] opacity-40">
            © 2026 {BRAND.name}. Secure Infrastructure. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="bg-surface/30 border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-surface/50 transition-colors">
    <div className="mb-3 p-3 bg-white/5 rounded-xl">
      {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${(icon as React.ReactElement).props.className}` })}
    </div>
    <h3 className="font-bold text-xs text-primary uppercase tracking-tight">{title}</h3>
  </div>
);

export default LandingPage;
