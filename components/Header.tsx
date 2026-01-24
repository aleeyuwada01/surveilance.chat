
import React from 'react';
import { Icons, BRAND } from '../constants';
import { Camera } from '../types';

interface HeaderProps {
  cameras: Camera[];
  activeCamera: Camera;
  onCameraChange: (camera: Camera) => void;
  onSearchClick: () => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cameras, 
  activeCamera, 
  onCameraChange, 
  onSearchClick,
  onProfileClick
}) => {
  return (
    <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-background z-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="p-1 overflow-hidden">
          <img src={BRAND.logo} alt="Logo" className="w-8 h-8 logo-tactical" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight hidden sm:block uppercase italic">{BRAND.name}</h1>
          <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Gemini Link: Online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-6">
        <div className="relative group">
          <button className="flex items-center space-x-2 bg-surface px-4 py-2 rounded-xl border border-border hover:border-blue-500 transition-all text-primary">
            <Icons.Camera className="text-secondary w-4 h-4" />
            <span className="font-semibold text-sm truncate max-w-[100px] sm:max-w-none">{activeCamera.name}</span>
            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] overflow-hidden">
            {cameras.length === 0 ? (
              <div className="px-4 py-3 text-xs text-secondary text-center">No nodes registered</div>
            ) : (
              cameras.map(cam => (
                <button
                  key={cam.id}
                  onClick={() => onCameraChange(cam)}
                  className={`w-full text-left px-4 py-3 hover:bg-secondary/10 flex items-center justify-between transition-colors ${activeCamera.id === cam.id ? 'text-blue-500' : 'text-primary'}`}
                >
                  <span className="text-sm font-medium">{cam.name}</span>
                  {activeCamera.id === cam.id && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            onClick={onSearchClick}
            className="p-2.5 text-secondary hover:text-blue-500 bg-surface/50 rounded-xl transition-all border border-transparent hover:border-border"
            title="Search Archive"
          >
            <Icons.Search className="w-5 h-5" />
          </button>

          <button 
            onClick={onProfileClick}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-border p-0.5 hover:scale-105 transition-all shadow-lg active:scale-95"
            title="Account Settings"
          >
            <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center overflow-hidden">
              <span className="text-xs font-black text-blue-500 uppercase">JD</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
