
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { db, initializeStorage, saveStorage, auth } from '../utils/storage';
import { UserSettings, Observer, User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [newObs, setNewObs] = useState({ name: '', email: '', pass: '', clearance: 1 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const storage = initializeStorage();
      const uid = storage.currentUserId;
      if (uid) {
        let userSettings = storage.settings[uid];
        if (!userSettings) {
          userSettings = {
            id: 'settings-' + uid,
            userId: uid,
            theme: 'dark',
            sensitivity: 75,
            faceDetection: false,
            retentionDays: 30,
            enableVoiceAlerts: true,
            observers: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            syncStatus: 'local_only',
            isDeleted: false
          };
          storage.settings[uid] = userSettings;
          saveStorage(storage);
        }
        setSettings(userSettings);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!settings) return;
    const storage = initializeStorage();
    const uid = storage.currentUserId;
    if (uid) {
      storage.settings[uid] = {
        ...settings,
        updatedAt: new Date().toISOString(),
        version: settings.version + 1
      };
      saveStorage(storage);
    }
    onClose();
  };

  const addObserver = () => {
    setError(null);
    if (!newObs.name || !newObs.email || !newObs.pass) {
      setError("All fields required for operative registration.");
      return;
    }
    try {
      db.observers.add(newObs.name, newObs.email, newObs.pass, newObs.clearance);
      
      // Refresh local settings view
      const storage = initializeStorage();
      const uid = storage.currentUserId;
      if (uid) setSettings(storage.settings[uid]);
      
      setNewObs({ name: '', email: '', pass: '', clearance: 1 });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeObserver = (email: string) => {
    if (!settings) return;
    const storage = initializeStorage();
    const uid = storage.currentUserId;
    if (!uid) return;

    // Remove user record and from settings list
    Object.keys(storage.users).forEach(id => {
      if (storage.users[id].email === email && storage.users[id].managedBy === uid) {
        delete storage.users[id];
      }
    });

    storage.settings[uid].observers = storage.settings[uid].observers.filter(o => o.email !== email);
    saveStorage(storage);
    setSettings(storage.settings[uid]);
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
            <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
                onClick={() => setSettings({...settings, enableVoiceAlerts: !settings.enableVoiceAlerts})}
                className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative ${settings.enableVoiceAlerts ? 'bg-blue-600' : 'bg-gray-400'}`}
              >
                <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableVoiceAlerts ? 'left-5 md:left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Observer Nodes</h3>
            <div className="space-y-4">
              <div className="p-5 md:p-6 bg-background rounded-3xl border border-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Personnel Name"
                    value={newObs.name}
                    onChange={(e) => setNewObs({...newObs, name: e.target.value})}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                  />
                  <input 
                    type="email" 
                    placeholder="Operative Email"
                    value={newObs.email}
                    onChange={(e) => setNewObs({...newObs, email: e.target.value})}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                  />
                  <input 
                    type="password" 
                    placeholder="Access Cipher (Password)"
                    value={newObs.pass}
                    onChange={(e) => setNewObs({...newObs, pass: e.target.value})}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 font-bold"
                  />
                  <div className="flex gap-2">
                    <select 
                      value={newObs.clearance}
                      onChange={(e) => setNewObs({...newObs, clearance: parseInt(e.target.value)})}
                      className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-xs font-black uppercase tracking-tighter outline-none focus:border-blue-500"
                    >
                      {[1,2,3,4,5].map(l => <option key={l} value={l}>Clearance: Level {l}</option>)}
                    </select>
                    <button 
                      onClick={addObserver}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg"
                    >
                      Enlist
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-[10px] text-rose-500 font-black uppercase text-center bg-rose-500/10 py-2 rounded-lg">{error}</p>
                )}

                <div className="pt-4 space-y-2">
                  {settings.observers.length === 0 ? (
                    <p className="text-[10px] text-gray-500 italic text-center py-4">No observers currently linked to this admin hub.</p>
                  ) : (
                    settings.observers.map(obs => (
                      <div key={obs.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl group transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                             <span className="text-xs font-black">{obs.name.substring(0,1)}</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-primary flex items-center gap-2">
                              {obs.name}
                              <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">LVL {obs.clearanceLevel}</span>
                            </div>
                            <div className="text-[9px] text-gray-500">{obs.email}</div>
                          </div>
                        </div>
                        <button onClick={() => removeObserver(obs.email)} className="text-gray-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 md:p-8 bg-background/50 border-t border-border flex justify-end space-x-4 shrink-0">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:text-blue-500 transition-colors text-xs md:text-sm">Discard</button>
          <button onClick={handleSave} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-white transition-all shadow-xl shadow-blue-500/20 active:scale-95 text-xs md:text-sm uppercase tracking-widest">Commit Hub Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
