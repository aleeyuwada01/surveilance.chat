
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { supabaseDb } from '../utils/supabaseDb';
import { UserSettings, User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    try {
      const userSettings = await supabaseDb.settings.get();
      if (userSettings) {
        setSettings(userSettings);
      } else {
        // Create default settings if not found
        setSettings({
          id: 'settings-' + Date.now(),
          userId: user?.id || '',
          theme: 'dark',
          sensitivity: 75,
          faceDetection: false,
          retentionDays: 30,
          enableVoiceAlerts: true,
          observers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          syncStatus: 'synced',
          isDeleted: false
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await supabaseDb.settings.update(settings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-[2rem] md:rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Icons.Settings className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black italic uppercase">Control Panel</h2>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium">Policy & Personnel Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors group">
            <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 p-6 md:p-8 space-y-10 overflow-y-auto custom-scrollbar">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Communications</h3>
            <div className="flex items-center justify-between p-5 md:p-6 bg-background rounded-3xl border border-border">
              <div>
                <div className="font-bold text-sm md:text-base">Tactical Voice Alerts</div>
                <div className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">Audible reporting via Core Engine</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enableVoiceAlerts: !settings.enableVoiceAlerts })}
                className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative ${settings.enableVoiceAlerts ? 'bg-blue-600' : 'bg-gray-400'}`}
              >
                <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableVoiceAlerts ? 'left-5 md:left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Detection Settings</h3>
            <div className="p-5 md:p-6 bg-background rounded-3xl border border-border space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-sm">Detection Sensitivity</div>
                  <span className="text-blue-500 font-black text-sm">{settings.sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sensitivity}
                  onChange={(e) => setSettings({ ...settings, sensitivity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">Face Detection</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-medium">Advanced facial recognition module</div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, faceDetection: !settings.faceDetection })}
                  className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative ${settings.faceDetection ? 'bg-blue-600' : 'bg-gray-400'}`}
                >
                  <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.faceDetection ? 'left-5 md:left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="font-bold text-sm">Log Retention</div>
                  <span className="text-blue-500 font-black text-sm">{settings.retentionDays} Days</span>
                </div>
                <select
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 md:p-8 bg-background/50 border-t border-border flex justify-end space-x-4 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:text-blue-500 transition-colors text-xs md:text-sm">Discard</button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl font-black text-white transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs md:text-sm uppercase tracking-widest"
          >
            {isSaving ? 'Saving...' : 'Commit Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
