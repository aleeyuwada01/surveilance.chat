
import React from 'react';
import { Icons } from '../constants';

interface AuditData {
  summary: string;
  patterns: string[];
  recommendations: string[];
  riskScore: number;
}

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AuditData | null;
  isLoading: boolean;
}

const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose, data, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300 print:p-0 print:bg-white">
      <div className="audit-modal-container bg-surface border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)] flex flex-col animate-in zoom-in-95 duration-300 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-transparent print:bg-none print:border-black/10">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-blue-500 rounded-3xl shadow-xl shadow-blue-500/20 print:bg-black">
              <Icons.Shield className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white uppercase print:text-black">Security Posture Audit</h2>
              <p className="text-xs text-secondary font-black tracking-[0.2em] uppercase mt-1 print:text-gray-500">Intelligence Synthesis • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-all text-secondary group print:hidden">
            <svg className="w-8 h-8 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="audit-modal-content flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar print:overflow-visible print:p-8">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-xl font-bold text-white mb-2">Analyzing Session Logs...</p>
                <p className="text-sm text-secondary">Synthesizing node telemetry for audit generation.</p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 print:text-black">
              {/* Score Section */}
              <div className="flex items-center justify-between p-8 bg-background/50 rounded-[2.5rem] border border-white/5 print:bg-gray-50 print:border-gray-200">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] print:text-gray-400">Risk Exposure Index</h3>
                  <div className="text-5xl font-black text-white print:text-black">{data.riskScore}<span className="text-xl text-secondary opacity-30">/100</span></div>
                </div>
                <div className="w-1/2 h-4 bg-white/5 rounded-full overflow-hidden print:bg-gray-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${data.riskScore > 70 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${data.riskScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Executive Summary */}
              <section className="space-y-4">
                <div className="flex items-center space-x-3 text-blue-500 print:text-black">
                  <Icons.Activity className="w-5 h-5" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Executive Summary</h3>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 leading-relaxed text-lg text-primary/90 font-medium print:bg-white print:text-black print:border-gray-100">
                  {data.summary}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:block print:space-y-8">
                {/* Patterns */}
                <section className="space-y-6">
                  <div className="flex items-center space-x-3 text-emerald-500 print:text-black">
                    <Icons.Shield className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Incident Patterns</h3>
                  </div>
                  <div className="space-y-3">
                    {data.patterns.map((pattern, i) => (
                      <div key={i} className="flex items-start space-x-4 p-5 bg-background/30 rounded-2xl border border-white/5 print:bg-gray-50 print:border-gray-200">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0 print:bg-black"></div>
                        <p className="text-sm text-secondary leading-relaxed print:text-gray-700">{pattern}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recommendations */}
                <section className="space-y-6">
                  <div className="flex items-center space-x-3 text-blue-500 print:text-black">
                    <Icons.Settings className="w-5 h-5" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Strategic Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {data.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start space-x-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 print:bg-gray-50 print:border-gray-200">
                        <span className="text-blue-500 font-black text-xs mt-0.5 print:text-black">{i+1}.</span>
                        <p className="text-sm text-primary leading-relaxed font-bold print:text-black">{rec}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-secondary italic">Failed to retrieve audit data.</div>
          )}
        </div>

        <div className="p-10 bg-background/50 border-t border-white/5 flex justify-between items-center print:border-gray-200">
          <div className="flex items-center space-x-2 text-xs font-black text-secondary uppercase tracking-widest opacity-50 print:text-gray-400">
            <Icons.Calendar className="w-4 h-4" />
            <span>Archive ID: SEC-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
          </div>
          <button 
            onClick={() => window.print()} 
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all flex items-center space-x-3 print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditReportModal;
