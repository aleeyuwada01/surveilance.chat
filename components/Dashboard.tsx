
import React from 'react';
import { Icons } from '../constants';
import { SurveillanceEvent, DailySummary, EventType } from '../types';

interface DashboardProps {
  events: SurveillanceEvent[];
  summary: DailySummary;
}

const Dashboard: React.FC<DashboardProps> = ({ events, summary }) => {
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case EventType.PERSON: return <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Icons.Shield width={16} height={16} /></div>;
      case EventType.VEHICLE: return <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Icons.Camera width={16} height={16} /></div>;
      case EventType.ALERT: return <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><Icons.Activity width={16} height={16} /></div>;
      default: return <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Icons.Activity width={16} height={16} /></div>;
    }
  };

  const stats = {
    people: events.filter(e => e.type === EventType.PERSON).length,
    vehicles: events.filter(e => e.type === EventType.VEHICLE).length,
    alerts: events.filter(e => e.type === EventType.ALERT).length,
    total: events.length
  };

  return (
    <div className="space-y-6 transition-colors">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-border shadow-lg">
          <span className="text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Session Logs</span>
          <div className="text-2xl md:text-4xl font-black mt-1 text-primary">{stats.total}</div>
          <div className="text-[8px] md:text-[9px] text-emerald-500 mt-2 font-black uppercase tracking-widest flex items-center">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            Active
          </div>
        </div>
        <div className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-border shadow-lg">
          <span className="text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">People</span>
          <div className="text-2xl md:text-4xl font-black mt-1 text-primary">{stats.people}</div>
          <div className="text-[8px] md:text-[9px] text-blue-500 mt-2 font-black uppercase tracking-widest">AI Sync</div>
        </div>
        <div className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-border shadow-lg">
          <span className="text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Vehicles</span>
          <div className="text-2xl md:text-4xl font-black mt-1 text-primary">{stats.vehicles}</div>
          <div className="text-[8px] md:text-[9px] text-secondary mt-2 font-black uppercase tracking-widest">Trace OK</div>
        </div>
        <div className="bg-surface p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-border shadow-lg">
          <span className="text-secondary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Status</span>
          <div className="text-xl md:text-3xl font-black mt-1 text-blue-500 italic">READY</div>
          <div className="text-[8px] md:text-[9px] text-amber-500 mt-2 font-black uppercase tracking-widest">Isolated</div>
        </div>
      </div>

      <div className="bg-surface rounded-[2rem] md:rounded-[2.5rem] border border-border overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-background/20 gap-4">
          <div>
             <h3 className="font-black text-lg md:text-xl text-primary uppercase italic tracking-tighter">Event Sequence Log</h3>
             <p className="text-[10px] text-secondary font-black uppercase tracking-widest mt-1">Normalized Archive</p>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6 w-full sm:w-auto">
             <button className="flex-1 sm:flex-none text-[9px] md:text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-all">Export</button>
             <button className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-blue-600 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg">Deep Audit</button>
          </div>
        </div>
        
        <div className="divide-y divide-white/5 bg-background/10 min-h-[200px] md:min-h-[300px]">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 opacity-20 text-center px-4">
               <Icons.Activity className="w-12 h-12 md:w-16 md:h-16 mb-4" />
               <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em]">Awaiting Analysis Signal</p>
               <p className="text-[8px] md:text-[9px] uppercase mt-2">Detections will propagate here during session</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="p-6 md:p-8 flex items-start md:items-center space-x-4 md:space-x-8 hover:bg-white/[0.02] transition-colors group animate-in slide-in-from-left-4">
                <div className="relative shrink-0">
                   {getEventIcon(event.type)}
                   <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-surface rounded-full ${event.syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
                    <span className="text-sm md:text-base font-bold italic text-primary leading-tight truncate">"{event.description}"</span>
                    <span className="text-[10px] text-secondary font-mono font-black opacity-60">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className={`text-[8px] md:text-[9px] uppercase font-black tracking-widest px-2 md:px-3 py-1 rounded-lg ${
                      event.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-500' :
                      event.confidence === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-rose-500/10 text-rose-500'
                    } border border-white/5`}>
                      {event.confidence}
                    </span>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {event.entities.map((ent, i) => (
                        <span key={i} className="text-[8px] md:text-[9px] text-secondary font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[80px]">#{ent}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
