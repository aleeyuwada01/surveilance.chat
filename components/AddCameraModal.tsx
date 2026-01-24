
import React, { useState, useEffect } from 'react';
import { Camera } from '../types';
import { db } from '../utils/storage';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (camera: Camera) => void;
}

const AddCameraModal: React.FC<AddCameraModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Front Entrance');
  const [customLocation, setCustomLocation] = useState('');
  const [url, setUrl] = useState('');
  const [nodePassword, setNodePassword] = useState('');
  const [clearanceRequired, setClearanceRequired] = useState(1);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (url.toLowerCase().startsWith('rtsp://')) {
      setUrlError("RTSP detected. Browsers cannot play this directly. Use a transcoding proxy or an HLS/MP4 URL.");
    } else {
      setUrlError(null);
    }
  }, [url]);

  const locationOptions = [
    'Front Entrance',
    'Main Lobby',
    'Parking Garage',
    'Loading Dock',
    'Staff Room',
    'Server Room',
    'Perimeter East',
    'Roof Access',
    'Other'
  ];

  if (!isOpen) return null;

  const isExternalPlatform = (link: string) => {
    return link.includes('youtube.com') || link.includes('youtu.be') || link.includes('vimeo.com');
  };

  const getEmbedUrl = (link: string) => {
    if (link.includes('youtube.com/watch?v=')) {
      return link.replace('watch?v=', 'embed/');
    }
    if (link.includes('youtu.be/')) {
      return 'https://www.youtube.com/embed/' + link.split('youtu.be/')[1];
    }
    if (link.includes('vimeo.com/')) {
      const id = link.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${id}`;
    }
    return link;
  };

  const loadDemo = () => {
    setName('Public Observation Feed');
    setSelectedLocation('Main Lobby');
    setUrl('https://aleeyuwada01.github.io/files/cctv.mp4');
    setNodePassword('admin');
    setClearanceRequired(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    const external = isExternalPlatform(url);
    const finalUrl = external ? getEmbedUrl(url) : url;
    const finalLocation = selectedLocation === 'Other' ? customLocation : selectedLocation;
    const now = new Date().toISOString();

    const newCamera: Camera = {
      id: `cam-${Date.now()}`,
      userId: db.getUserId() || '',
      name,
      location: finalLocation || 'General',
      status: 'online',
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
      version: 1,
      syncStatus: 'local_only',
      isDeleted: false,
      thumbnail: `https://picsum.photos/seed/${name}/400/225`,
      streamUrl: finalUrl,
      isExternal: external,
      nodePassword: nodePassword || undefined,
      clearanceRequired: clearanceRequired
    };

    onAdd(newCamera);
    setName('');
    setSelectedLocation('Front Entrance');
    setCustomLocation('');
    setUrl('');
    setNodePassword('');
    setClearanceRequired(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase italic">Register Node</h2>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-gray-500 group">
            <svg className="w-6 h-6 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Node Configuration</label>
            <button 
              type="button" 
              onClick={loadDemo}
              className="text-[10px] font-black uppercase tracking-tighter text-blue-500 hover:text-blue-400 underline underline-offset-4"
            >
              Seed Demo Feed
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Device Alias</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. South Perimeter"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Deployment Area</label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer text-primary text-sm font-bold"
                >
                  {locationOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-surface">
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Network Stream URL</label>
            <input 
              type="url" 
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://...m3u8"
              className={`w-full bg-background border rounded-xl px-4 py-3 outline-none transition-all text-sm font-mono ${urlError ? 'border-rose-500/50 focus:border-rose-500' : 'border-border focus:border-blue-500'}`}
            />
            {urlError && (
              <p className="mt-2 text-[10px] text-rose-500 font-bold uppercase tracking-tight leading-tight">{urlError}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Node Access Cipher (Password)</label>
              <input 
                type="password" 
                value={nodePassword}
                onChange={(e) => setNodePassword(e.target.value)}
                placeholder="Optional cipher"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Clearance Required</label>
              <select 
                value={clearanceRequired}
                onChange={(e) => setClearanceRequired(parseInt(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-bold"
              >
                {[1,2,3,4,5].map(lvl => <option key={lvl} value={lvl}>Level {lvl}</option>)}
              </select>
            </div>
          </div>
          
          <div className="pt-4 space-y-4">
            <button type="submit" disabled={!!urlError} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]">
              Deploy Intelligence Node
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;
