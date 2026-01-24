
import React, { useState } from 'react';
import { Camera, SurveillanceEvent } from '../types';
import { traceSubjectPath } from '../services/geminiService';
import { Icons } from '../constants';

interface GlobalTrackingProps {
  cameras: Camera[];
  events: SurveillanceEvent[];
}

const GlobalTracking: React.FC<GlobalTrackingProps> = ({ cameras, events }) => {
  const [query, setQuery] = useState('');
  const [trace, setTrace] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const results = await traceSubjectPath(query, events, cameras);
      setTrace(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Interactive Search Header */}
      <div className="bg-surface p-10 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -mr-32 -mt-32 transition-all group-hover:bg-blue-500/10"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
              <Icons.Search className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Multi-Node Trace</h2>
              <p className="text-[10px] text-secondary font-black uppercase tracking-[0.2em]">Cross-Camera correlation engine</p>
            </div>
          </div>
          
          <form onSubmit={handleTrace} className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe subject (e.g. 'Person in red hoodie' or 'Silver sedan')"
                className="w-full bg-background border border-border rounded-2xl px-8 py-5 outline-none focus:border-blue-500 transition-all font-bold text-lg placeholder:text-secondary/30"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex space-x-2">
                <span className="text-[10px] font-black text-secondary bg-surface px-2 py-1 rounded border border-border">SHIFT + ENTER</span>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 active:scale-95 uppercase tracking-widest text-xs"
            >
              {isLoading ? 'Processing Map...' : 'Trace Path'}
            </button>
          </form>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="py-24 flex flex-col items-center space-y-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-primary uppercase tracking-tighter italic">Synthesizing Node Data</p>
              <p className="text-xs text-secondary font-medium uppercase tracking-[0.15em] mt-1">Comparing temporal vectors across {cameras.length} nodes</p>
            </div>
          </div>
        )}

        {!isLoading && trace.length > 0 && (
          <div className="space-y-10">
            {/* Intelligence Briefing Header */}
            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center justify-between">
              <div className="flex items-center space-x-6">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Icons.Shield className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Chain of Custody established</h3>
                    <p className="text-xs text-secondary mt-1">Confirmed {trace.length} points of contact with the subject.</p>
                 </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Max Match Confidence</div>
                <div className="text-3xl font-black text-emerald-500">{Math.max(...trace.map(t => t.confidence))}%</div>
              </div>
            </div>
            
            {/* Vertical Sequence Map */}
            <div className="relative space-y-4 before:absolute before:left-[2.25rem] before:top-8 before:bottom-8 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-blue-500/20 before:to-transparent">
              {trace.map((node, i) => {
                const camera = cameras.find(c => c.id === node.cameraId);
                return (
                  <div key={i} className="group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                    {/* Handoff marker if not first item */}
                    {i > 0 && (
                      <div className="ml-16 mb-4 flex items-center space-x-3 opacity-60">
                        <div className="w-px h-8 bg-blue-500/30"></div>
                        <div className="flex items-center space-x-2 bg-background border border-border px-3 py-1 rounded-full">
                          <Icons.Activity className="w-3 h-3 text-blue-500" />
                          <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Temporal Handoff: {node.handoff || 'Confirmed Transition'}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-8">
                      {/* Node Number */}
                      <div className={`relative z-10 w-18 h-18 rounded-[2rem] border-4 border-surface shadow-2xl flex items-center justify-center shrink-0 transition-all ${node.confidence > 80 ? 'bg-blue-600' : 'bg-surface border-border'}`}>
                        <span className="text-2xl font-black text-white italic">{i + 1}</span>
                      </div>
                      
                      {/* Node Details Card */}
                      <div className="flex-1 bg-surface border border-border rounded-[2.5rem] p-8 hover:border-blue-500 transition-all group/card shadow-lg hover:shadow-blue-500/5">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                               <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                  <Icons.Camera className="w-4 h-4" />
                               </div>
                               <h5 className="text-lg font-black text-primary uppercase tracking-tight italic">{camera?.name || 'Unknown Node'}</h5>
                            </div>
                            <p className="text-xs text-secondary font-black tracking-widest uppercase bg-background px-3 py-1 rounded-full border border-border inline-block">
                              Loc: {camera?.location || 'Undisclosed Area'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-primary font-mono">{new Date(node.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</div>
                            <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${node.confidence > 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              Vector Quality: {node.confidence}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-background/80 p-6 rounded-2xl border border-white/5 space-y-4">
                           <p className="text-sm text-primary/90 leading-relaxed font-bold italic">
                             "{node.action}"
                           </p>
                           <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${node.confidence > 70 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${node.confidence}%` }}></div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-10 border-2 border-dashed border-border rounded-[3rem] text-center">
               <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4">End of established sequence</p>
               <button className="px-8 py-3 bg-surface hover:bg-border text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-border">Log Findings to Archive</button>
            </div>
          </div>
        )}

        {!isLoading && trace.length === 0 && !query && (
          <div className="py-20 text-center space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { title: "Visual Correlation", desc: "Matches clothing, gait, and vehicle plates across all active nodes." },
                { title: "Temporal Logic", desc: "Ensures path of travel is physically possible based on distance between cameras." },
                { title: "Hand-off Intelligence", desc: "Predicts entry/exit points between blind spots in your surveillance grid." }
              ].map((feature, i) => (
                <div key={i} className="p-8 bg-surface border border-border rounded-3xl text-left space-y-4">
                   <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 font-black">
                     0{i+1}
                   </div>
                   <h6 className="font-black text-xs uppercase tracking-widest text-primary">{feature.title}</h6>
                   <p className="text-xs text-secondary leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm font-black text-secondary uppercase tracking-[0.2em] animate-pulse italic">Awaiting Operator Description...</p>
          </div>
        )}

        {!isLoading && trace.length === 0 && query && (
          <div className="py-24 text-center space-y-6 bg-surface rounded-[3rem] border border-border shadow-inner">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto border border-border shadow-2xl text-rose-500">
               <Icons.Shield className="w-10 h-10 opacity-40" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-primary uppercase italic tracking-tighter">Zero Correlation Found</p>
              <p className="text-sm text-secondary font-medium max-w-sm mx-auto">The AI was unable to reconcile logs for "{query}". Try a broader description or verify camera health.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalTracking;
