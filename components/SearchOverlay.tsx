
import React, { useState } from 'react';
import { Icons } from '../constants';
import { SurveillanceEvent, Camera, User } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: Camera[];
  events: SurveillanceEvent[];
  user?: User | null;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, cameras, events, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCamera, setSelectedCamera] = useState<string>('all');

  const hasAccess = (user?.clearanceLevel || 0) >= 2;

  if (!isOpen) return null;

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = event.timestamp.startsWith(selectedDate);
    const matchesCamera = selectedCamera === 'all' || event.cameraId === selectedCamera;
    return matchesSearch && matchesDate && matchesCamera;
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/60 backdrop-blur-md pt-20 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center">
              <Icons.Search className="mr-2 text-blue-500" />
              Event Archive Search
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {!hasAccess ? (
            <div className="p-8 text-center bg-background/50 rounded-2xl border border-rose-500/20">
              <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tight text-primary">Clearance LVL 2 Required</h3>
              <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-medium">Historical logs are restricted to archive-cleared operatives.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search description, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <Icons.Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              </div>

              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors text-sm text-gray-300"
                  />
                </div>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="all">All Cameras</option>
                  {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {hasAccess && (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {filteredEvents.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto text-gray-600">
                  <Icons.Activity className="w-8 h-8" />
                </div>
                <p className="text-gray-500 text-sm">No historical events found for the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-2 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Results found ({filteredEvents.length})
                </div>
                {filteredEvents.map(event => (
                  <div key={event.id} className="p-4 bg-background/50 hover:bg-background border border-border rounded-2xl flex items-center space-x-4 group cursor-pointer transition-all">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Icons.Activity width={16} height={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{event.description}</div>
                      <div className="text-[10px] text-gray-500 flex items-center space-x-2">
                        <span>{cameras.find(c => c.id === event.cameraId)?.name}</span>
                        <span>•</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                      View Moment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
