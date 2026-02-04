import React from 'react';
import { Icons, BRAND } from '../constants';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-background text-primary flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,14,20,0.9),rgba(10,14,20,0.95)),url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-fixed z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] z-0" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 text-center mt-20 md:mt-0">
        <div className="mb-8 relative group cursor-pointer" onClick={onEnter}>
          <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-500 animate-pulse"></div>
          <div className="relative p-2 bg-surface/50 backdrop-blur-sm border border-border rounded-2xl ring-1 ring-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
             <img src={BRAND.logo} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 logo-tactical drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-sm">
          {BRAND.name}
        </h1>
        
        <p className="max-w-xl text-lg md:text-xl text-secondary mb-10 font-medium leading-relaxed">
          Advanced localized surveillance architecture powered by generative AI. 
          <span className="block mt-2 text-blue-400 font-mono text-sm tracking-widest uppercase opacity-80">
            // Secure • Intelligent • Real-time
          </span>
        </p>

        <button 
          onClick={onEnter}
          className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-sm rounded-full transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            Initialize System 
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl w-full">
          <FeatureCard 
            icon={<Icons.Activity className="w-6 h-6 text-emerald-400" />} 
            title="Real-time Feed" 
            desc="Low-latency monitoring" 
          />
          <FeatureCard 
            icon={<Icons.Shield className="w-6 h-6 text-blue-400" />} 
            title="Secure Core" 
            desc="Encrypted local storage" 
          />
          <FeatureCard 
            icon={<Icons.Search className="w-6 h-6 text-purple-400" />} 
            title="AI Analysis" 
            desc="Gemini-powered audit" 
          />
          <FeatureCard 
            icon={<Icons.Mic className="w-6 h-6 text-orange-400" />} 
            title="Tactical Comm" 
            desc="Direct voice link" 
          />
        </div>
      </main>
    
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-secondary text-xs uppercase tracking-[0.2em] opacity-40">
          Restricted Access // Auth Level 1 Required
        </p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-surface/30 backdrop-blur-md border border-white/5 p-4 rounded-xl flex flex-col items-center text-center hover:bg-surface/50 transition-colors group">
    <div className="mb-3 p-2 bg-gradient-to-br from-white/5 to-white/0 rounded-lg group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="font-bold text-sm text-primary mb-1 uppercase tracking-tight">{title}</h3>
    <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">{desc}</p>
  </div>
);

export default LandingPage;
