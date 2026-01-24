
import React from 'react';
import { Icons } from '../constants';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-surface border border-border rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 rounded-3xl bg-background border-4 border-surface p-1 shadow-2xl">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="absolute bottom-0 left-20 w-6 h-6 bg-emerald-500 border-4 border-surface rounded-full"></div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black">{user.name}</h2>
            <p className="text-sm text-gray-500 font-medium">Security Administrator</p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="p-4 bg-background rounded-2xl border border-border flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all">
              <div className="flex items-center space-x-3">
                <Icons.Shield className="text-blue-500 w-5 h-5" />
                <span className="text-sm font-bold">Security Clearance</span>
              </div>
              <span className="text-xs bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Level {user.clearanceLevel}</span>
            </div>
            
            <div className="p-4 bg-background rounded-2xl border border-border flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all">
              <div className="flex items-center space-x-3">
                <Icons.Activity className="text-gray-500 w-5 h-5" />
                <span className="text-sm font-bold">Node Status</span>
              </div>
              <span className="text-xs text-gray-500 font-bold">Active Connection</span>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col space-y-3">
            <button onClick={onClose} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20">
              Update Profile
            </button>
            <button 
              onClick={onLogout}
              className="w-full py-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-2xl transition-all"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
