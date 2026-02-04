
import React, { useState } from 'react';
import { Camera, SurveillanceEvent, DailySummary, EventType, User } from '../types';
import { Icons } from '../constants';

interface OverviewProps {
  cameras: Camera[];
  activeCamera: Camera | null;
  events: SurveillanceEvent[];
  summary: DailySummary;
  onSelectCamera: (camera: Camera) => void;
  onAddCameraClick: () => void;
  user?: User | null;
}

const Overview: React.FC<OverviewProps> = ({ cameras, activeCamera, events, summary, onSelectCamera, onAddCameraClick, user }) => {
  const activeAlertsCount = events.filter(e => e.type === EventType.ALERT).length;
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Format today's date for the snapshot: e.g., Jan 8, 2026
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 md:space-y-10 py-4 md:py-4 transition-colors">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="pt-2 md:pt-0">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2 text-primary italic uppercase leading-none">SurveillanceChat</h1>
          <p className="text-secondary font-medium uppercase tracking-widest text-[10px] md:text-xs opacity-60">Security snapshot • {todayFormatted}</p>
        </div>
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="relative flex-1 md:flex-none">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="w-full md:w-auto px-4 md:px-6 py-3 bg-surface border border-border text-primary font-black rounded-xl md:rounded-2xl hover:border-blue-500 transition-all flex items-center justify-between md:justify-start space-x-3 shadow-xl uppercase text-[10px] md:text-xs tracking-widest"
            >
              <Icons.Camera className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="truncate max-w-[120px]">{activeCamera?.name || 'Select Node'}</span>
              <svg className={`w-4 h-4 text-secondary transition-transform shrink-0 ${isSelectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isSelectorOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-surface border border-border rounded-2xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-border bg-background/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-60 px-2">Registered Nodes</span>
                </div>
                {cameras.map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => { onSelectCamera(cam); setIsSelectorOpen(false); }}
                    className={`w-full text-left px-5 py-4 hover:bg-white/5 flex items-center justify-between transition-colors border-l-2 ${activeCamera?.id === cam.id ? 'border-l-blue-600 bg-blue-600/5 text-blue-500' : 'border-l-transparent text-primary'}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase">{cam.name}</span>
                      <span className="text-[9px] text-secondary font-medium tracking-wider">{cam.location}</span>
                    </div>
                    {activeCamera?.id === cam.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={onAddCameraClick}
              className="px-4 md:px-6 py-3 bg-blue-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all flex items-center space-x-3 shadow-2xl shadow-blue-500/30 uppercase text-[10px] md:text-xs tracking-widest shrink-0"
            >
              <span>Add Camera</span>
              <Icons.Camera className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className={`p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border shadow-2xl transition-all ${activeAlertsCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 shadow-rose-500/10' : 'bg-surface border-border text-blue-500 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Active Alerts</span>
            <Icons.Shield className="w-5 h-5" />
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1">{activeAlertsCount.toString().padStart(2, '0')}</div>
          <div className="text-[10px] opacity-70 font-black uppercase tracking-widest">{activeAlertsCount > 0 ? 'Action required' : 'Nominal'}</div>
        </div>

        <div className="bg-surface p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-border transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4 text-secondary">
            <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Log Count</span>
            <Icons.Activity className="w-5 h-5 opacity-40" />
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1 text-primary">{events.length}</div>
          <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Live Active</div>
        </div>

        <div className="bg-surface p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-border transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-4 text-secondary">
            <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">Camera Ratio</span>
            <Icons.Camera className="w-5 h-5 opacity-40" />
          </div>
          <div className="text-4xl md:text-5xl font-black mb-1 text-primary">{cameras.filter(c => c.status === 'online').length}<span className="text-2xl opacity-20 ml-2">/ {cameras.length}</span></div>
          <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Active Cameras</div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-black text-primary uppercase italic tracking-tighter">Active Surveillance Nodes</h2>
        </div>

        {cameras.length === 0 ? (
          <div className="bg-surface rounded-2xl md:rounded-[3rem] border-2 border-dashed border-border p-12 md:p-24 text-center flex flex-col items-center justify-center space-y-6 md:space-y-8 transition-colors shadow-inner">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-background rounded-full flex items-center justify-center border border-border shadow-2xl transition-colors">
              <Icons.Camera className="text-blue-500 w-8 h-8 md:w-12 md:h-12" />
            </div>
            <div className="space-y-3 px-4">
              <h3 className="text-2xl md:text-3xl font-black text-primary italic uppercase tracking-tighter">Empty Grid</h3>
              <p className="text-secondary max-w-sm mx-auto font-medium leading-relaxed text-sm">
                {isAdmin ? 'Connect an IP camera via MP4/HLS to begin AI monitoring.' : 'No surveillance nodes have been shared with your operative ID.'}
              </p>
            </div>
            {isAdmin && (
              <button onClick={onAddCameraClick} className="px-8 md:px-10 py-4 md:py-5 bg-blue-600 rounded-xl md:rounded-[2rem] font-black text-white shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center space-x-3">
                <span>Add Camera</span>
                <Icons.Camera className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {cameras.map(camera => (
              <div
                key={camera.id}
                onClick={() => onSelectCamera(camera)}
                className="group relative bg-surface rounded-2xl md:rounded-[2.5rem] border border-border overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.1)] transition-all animate-in zoom-in-95 duration-500"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={camera.thumbnail} alt={camera.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>

                  <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center space-x-2 md:space-x-3 bg-black/60 backdrop-blur-xl px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-white/10">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white truncate">
                      {camera.isExternal ? 'CLOUD FEED' : 'LOCAL NODE'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-6 md:bottom-6 md:left-8">
                    <div className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase">{camera.name}</div>
                    <div className="text-[9px] md:text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mt-1">{camera.location}</div>
                  </div>
                </div>
                <div className="p-5 md:p-6 flex items-center justify-between bg-gradient-to-r from-background/50 to-transparent">
                  <div className="flex space-x-6 md:space-x-10">
                    <div className="text-left">
                      <div className="text-[8px] md:text-[10px] text-secondary uppercase font-black tracking-widest opacity-40 mb-1">Logs</div>
                      <div className="text-lg md:text-xl font-black text-primary italic">{events.filter(e => e.cameraId === camera.id).length.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[8px] md:text-[10px] text-secondary uppercase font-black tracking-widest opacity-40 mb-1">Status</div>
                      <div className="text-lg md:text-xl font-black text-emerald-500 italic">SECURE</div>
                    </div>
                  </div>
                  <button className="p-3 md:p-4 bg-blue-500/5 hover:bg-blue-600 rounded-xl md:rounded-2xl transition-all group-hover:text-white text-blue-500 border border-blue-500/10">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 pb-12">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-primary uppercase italic tracking-tighter">Event Sequence Log</h2>
          </div>
          <div className="bg-surface rounded-2xl md:rounded-[3rem] border border-border overflow-hidden shadow-2xl transition-colors min-h-[200px]">
            {events.length === 0 ? (
              <div className="p-12 md:p-24 text-center text-secondary font-medium italic opacity-50 text-sm">Awaiting telemetry.</div>
            ) : (
              <div className="divide-y divide-border transition-colors">
                {events.slice(0, 8).map(event => (
                  <div key={event.id} className="p-6 md:p-8 flex items-start space-x-4 md:space-x-6 hover:bg-white/5 transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                    <div className={`p-4 md:p-5 rounded-xl md:rounded-[1.5rem] shadow-xl shrink-0 ${event.type === EventType.PERSON ? 'bg-emerald-500/10 text-emerald-500' :
                      event.type === EventType.VEHICLE ? 'bg-blue-500/10 text-blue-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                      {event.type === EventType.PERSON ? <Icons.Shield width={20} height={20} /> : <Icons.Camera width={20} height={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-1">
                        <div className="font-black text-base md:text-lg text-primary italic tracking-tight uppercase truncate">"{event.description}"</div>
                        <div className="text-[10px] text-secondary font-mono font-black shrink-0">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="text-[9px] md:text-[10px] text-secondary uppercase tracking-[0.2em] font-black opacity-40 truncate">{cameras.find(c => c.id === event.cameraId)?.name || 'Node'}</span>
                        <div className="hidden xs:block w-1.5 h-1.5 bg-border rounded-full"></div>
                        <span className={`text-[9px] md:text-[10px] uppercase font-black tracking-widest ${event.confidence === 'high' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>{event.confidence} MATCH</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <h2 className="text-xl md:text-2xl font-black text-primary uppercase italic tracking-tighter">Node Briefing</h2>
          <div className="bg-gradient-to-b from-surface to-background p-8 md:p-10 rounded-2xl md:rounded-[3rem] border border-border shadow-2xl transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-3xl -mr-24 -mt-24"></div>
            <div className="flex items-center space-x-4 mb-8 md:mb-10 text-blue-500">
              <Icons.MessageSquare width={24} height={24} className="stroke-[2.5]" />
              <span className="text-xs font-black uppercase tracking-[0.3em] italic">Intel Synthesis</span>
            </div>
            {summary.highlights.length === 0 ? (
              <div className="py-12 md:py-20 text-center space-y-6">
                <p className="text-xs md:text-sm text-secondary leading-relaxed font-black uppercase tracking-widest opacity-40 px-6">Standby for telemetry synthesis.</p>
                <div className="flex justify-center space-x-3 opacity-20">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">
                {summary.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-start space-x-4 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
                    <p className="text-sm text-primary leading-relaxed font-bold italic opacity-90">{highlight}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-10 pt-8 md:mt-12 md:pt-10 border-t border-white/5">
              <div className="grid grid-cols-2 gap-6 md:gap-10">
                <div>
                  <div className="text-[8px] md:text-[10px] text-secondary uppercase font-black mb-1 opacity-40 tracking-widest">Peak</div>
                  <div className="text-xl md:text-2xl font-black text-primary italic">{summary.stats.peakHour}</div>
                </div>
                <div>
                  <div className="text-[8px] md:text-[10px] text-secondary uppercase font-black mb-1 opacity-40 tracking-widest">Health</div>
                  <div className="text-xl md:text-2xl font-black text-emerald-500 italic">SECURE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Overview;
