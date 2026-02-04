
import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer, { VideoPlayerHandle } from './components/VideoPlayer';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import AddCameraModal from './components/AddCameraModal';
import Overview from './components/Overview';
import SearchOverlay from './components/SearchOverlay';
import ProfileModal from './components/ProfileModal';
import AuditReportModal from './components/AuditReportModal';
import GlobalTracking from './components/GlobalTracking';
import TacticalVoice from './components/TacticalVoice';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';
import { Camera, SurveillanceEvent, DailySummary, User } from './types';
import { generateSecurityAudit } from './services/geminiService';
import { Icons, BRAND } from './constants';
import { db, auth } from './utils/storage';

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [activeCamera, setActiveCamera] = useState<Camera | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'monitor' | 'tracking' | 'voice'>('dashboard');
  const [events, setEvents] = useState<SurveillanceEvent[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [isAuditLoading, setIsAuditLoading] = useState(false);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);

  // Clearance Level Definitions
  const CLEARANCE = {
    BASIC: 1,      // Dashboard + Basic Monitor
    ARCHIVE: 2,    // Search Overlay
    TACTICAL: 3,   // Global Tracking
    COMMAND: 4,    // Tactical Voice
    ADMIN: 5       // Full Hub + Audit + Node Registration
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');

    // Immediate auth check, no artificial delay
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData();
      setShowLanding(false); // Skip landing if already logged in
    }
    setIsBooting(false);
  }, []);

  const loadUserData = () => {
    const cameraList = db.cameras.getAll();
    const eventList = db.events.getAll();
    setCameras(cameraList);
    setEvents(eventList);
    if (cameraList.length > 0) {
      setActiveCamera(cameraList[0]);
    } else {
      setActiveCamera(null);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    loadUserData();
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setCameras([]);
    setEvents([]);
    setActiveCamera(null);
    setActiveTab('dashboard');
    setIsProfileOpen(false);
  };

  const handleNewEvent = (eventInput: any) => {
    const savedEvent = db.events.add(eventInput);
    setEvents(prev => [savedEvent, ...prev]);
  };

  const handleAddCamera = (camInput: any) => {
    const savedCam = db.cameras.add(camInput);
    setCameras(prev => [...prev, savedCam]);
    if (!activeCamera) setActiveCamera(savedCam);
  };

  const handleCaptureFrame = () => {
    return videoPlayerRef.current?.captureFrame() || null;
  };

  const selectCamera = (camera: Camera) => {
    setActiveCamera(camera);
    setActiveTab('monitor');
  };

  const runSecurityAudit = async () => {
    if (!user || user.clearanceLevel < CLEARANCE.ADMIN) return;
    if (events.length === 0) {
      alert("No logs available for audit. Analyze some camera feeds first!");
      return;
    }
    setIsAuditOpen(true);
    setIsAuditLoading(true);
    try {
      const data = await generateSecurityAudit(events, cameras);
      setAuditData(data);
    } catch (error) {
      console.error("Audit failed", error);
    } finally {
      setIsAuditLoading(false);
    }
  };

  if (isBooting) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-primary">
        <div className="relative mb-8">
          <img
            src={BRAND.logo}
            alt="Logo"
            className="w-32 h-32 logo-tactical animate-pulse object-contain"
          />
          <div className="absolute -inset-6 border-2 border-blue-500/20 rounded-full animate-ping pointer-events-none"></div>
        </div>
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-black uppercase italic tracking-[0.4em] animate-pulse">Initializing</h2>
          <div className="w-56 h-1.5 bg-surface rounded-full overflow-hidden mx-auto border border-white/5">
            <div className="h-full bg-blue-600 animate-[infinite-scroll_2s_linear_infinite] w-1/3 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onEnter={() => setShowLanding(false)} />;
    }
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const isAdmin = user.role === 'admin';
  const userClearance = user.clearanceLevel;

  const currentSummary: DailySummary = {
    date: new Date().toISOString().split('T')[0],
    highlights: events.slice(0, 3).map(e => e.description),
    stats: {
      totalEvents: events.length,
      people: events.filter(e => e.entities.includes('person')).length,
      vehicles: events.filter(e => e.entities.includes('vehicle')).length,
      peakHour: 'N/A'
    }
  };

  const NavItem = ({ id, icon, label, minClearance, onClick }: any) => {
    const isLocked = userClearance < minClearance;
    const isActive = activeTab === id;

    return (
      <button
        onClick={() => !isLocked && (onClick ? onClick() : setActiveTab(id))}
        className={`relative p-3 rounded-xl md:rounded-2xl transition-all group ${isLocked ? 'opacity-30 cursor-not-allowed' :
            isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-secondary hover:text-blue-500 hover:bg-surface'
          }`}
        title={isLocked ? `Clearance Required: LVL ${minClearance}` : label}
      >
        {icon}
        {isLocked && (
          <div className="absolute -top-1 -right-1 bg-surface border border-border p-1 rounded-full scale-75">
            <svg className="w-2.5 h-2.5 text-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background text-primary transition-colors overflow-hidden">
      <aside className="fixed bottom-0 left-0 right-0 h-16 md:relative md:h-screen md:w-20 border-t md:border-t-0 md:border-r border-border flex flex-row md:flex-col items-center justify-around md:justify-start md:py-6 md:space-y-6 bg-surface md:bg-background transition-colors z-[100] pb-safe">

        <div className="hidden md:flex flex-col items-center space-y-2 mb-4">
          <div className="p-1 rounded-2xl overflow-hidden">
            <img src={BRAND.logo} alt="Logo" className="w-10 h-10 logo-tactical" />
          </div>
        </div>

        <nav className="flex flex-row md:flex-col items-center w-full md:w-auto justify-around md:space-y-4 px-2 md:px-0">
          <NavItem
            id="dashboard"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
            label="Dashboard"
            minClearance={CLEARANCE.BASIC}
          />

          <NavItem
            id="monitor"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            label="Monitor"
            minClearance={CLEARANCE.BASIC}
            disabled={cameras.length === 0}
          />

          <NavItem
            id="search"
            icon={<Icons.Search className="w-6 h-6" />}
            label="Archive Search"
            minClearance={CLEARANCE.ARCHIVE}
            onClick={() => setIsSearchOpen(true)}
          />

          <NavItem
            id="tracking"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0l-6-2" /></svg>}
            label="Correlation Trace"
            minClearance={CLEARANCE.TACTICAL}
          />

          <NavItem
            id="voice"
            icon={<Icons.Mic className="w-6 h-6" />}
            label="Tactical Radio"
            minClearance={CLEARANCE.COMMAND}
          />

          {userClearance >= CLEARANCE.ADMIN && (
            <NavItem
              id="audit"
              icon={<Icons.FileText className="w-6 h-6" />}
              label="Audit Report"
              minClearance={CLEARANCE.ADMIN}
              onClick={runSecurityAudit}
            />
          )}

          <button onClick={handleLogout} className="md:hidden p-3 text-rose-500 rounded-xl" title="Logout">
            <Icons.LogOut className="w-6 h-6" />
          </button>
        </nav>

        <div className="hidden md:flex mt-auto flex-col items-center space-y-4 pt-4 border-t border-border">
          {isAdmin && (
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 text-secondary hover:text-blue-500 hover:bg-surface rounded-2xl transition-all"><Icons.Settings className="w-6 h-6" /></button>
          )}
          <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-border p-0.5 hover:scale-105 transition-all shadow-lg">
            <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center overflow-hidden">
              <span className="text-xs font-black text-blue-500 uppercase">{user.name.substring(0, 2)}</span>
            </div>
          </button>
          <button onClick={handleLogout} className="p-3 text-secondary hover:text-rose-500 rounded-2xl transition-all" title="Logout">
            <Icons.LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* FIXED: Added pt-12 and pb-20 on mobile to clear status bar and bottom nav */}
      <main className="flex-1 overflow-y-auto pt-12 pb-20 md:pt-8 md:pb-8 p-4 md:p-8 scroll-smooth bg-background transition-colors">
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
          {activeTab === 'dashboard' && (
            <Overview cameras={cameras} activeCamera={activeCamera} events={events} summary={currentSummary} onSelectCamera={selectCamera} onAddCameraClick={() => setIsAddCameraOpen(true)} />
          )}

          {activeTab === 'monitor' && activeCamera && (
            <div className="flex flex-col xl:flex-row gap-6 md:gap-8 h-full min-h-0">
              {/* FIXED: Removed overflow-y-auto here on mobile to avoid double-scrolling issues */}
              <div className="flex-1 space-y-6 md:space-y-8 xl:overflow-y-auto custom-scrollbar">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <h2 className="text-2xl md:text-3xl font-black flex items-center text-primary uppercase italic tracking-tighter">{activeCamera.name}</h2>
                      <div className="flex items-center bg-surface border border-border rounded-xl px-2 py-1 space-x-1 overflow-x-auto no-scrollbar">
                        {cameras.map(cam => (
                          <button key={cam.id} onClick={() => setActiveCamera(cam)} className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCamera.id === cam.id ? 'bg-blue-600 text-white shadow-md' : 'text-secondary hover:text-primary'}`}>{cam.name.split(' ')[0]}</button>
                        ))}
                      </div>
                    </div>
                    <p className="text-secondary text-xs md:text-sm font-medium mt-1 uppercase tracking-widest opacity-60">{activeCamera.location} • Security Clearance: LVL {activeCamera.clearanceRequired}</p>
                  </div>
                </div>
                <VideoPlayer ref={videoPlayerRef} camera={activeCamera} events={events} />
                <Dashboard events={events} summary={currentSummary} />
              </div>
              <div className="w-full xl:w-[400px] 2xl:w-[450px] shrink-0 xl:h-[calc(100vh-64px-32px)] xl:sticky xl:top-0 pb-6">
                <ChatInterface camera={activeCamera} events={events} onCaptureFrame={handleCaptureFrame} onNewEvent={handleNewEvent} />
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            userClearance >= CLEARANCE.TACTICAL ?
              <GlobalTracking cameras={cameras} events={events} /> :
              <RestrictionUI level={CLEARANCE.TACTICAL} feature="Correlation Engine" />
          )}

          {activeTab === 'voice' && (
            userClearance >= CLEARANCE.COMMAND ?
              <TacticalVoice cameras={cameras} activeCamera={activeCamera} /> :
              <RestrictionUI level={CLEARANCE.COMMAND} feature="Tactical Radio" />
          )}
        </div>
      </main>

      {isAdmin && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      {isAdmin && <AddCameraModal isOpen={isAddCameraOpen} onClose={() => setIsAddCameraOpen(false)} onAdd={handleAddCamera} />}

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} cameras={cameras} events={events} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={handleLogout} />
      <AuditReportModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} data={auditData} isLoading={isAuditLoading} />
    </div>
  );
};

const RestrictionUI = ({ level, feature }: { level: number, feature: string }) => (
  <div className="h-[60vh] flex flex-col items-center justify-center space-y-8 p-12 text-center animate-in zoom-in-95 duration-500">
    <div className="w-24 h-24 bg-surface border-2 border-dashed border-border rounded-full flex items-center justify-center text-secondary relative">
      <svg className="w-10 h-10 opacity-30" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">LVL {level}</div>
    </div>
    <div className="space-y-3">
      <h3 className="text-3xl font-black italic uppercase tracking-tighter text-primary">Clearance Restricted</h3>
      <p className="text-secondary max-w-sm mx-auto font-medium text-sm leading-relaxed">
        Access to the <span className="text-blue-500 font-bold">{feature}</span> requires Level {level} authorization or higher. Contact your Hub Administrator for an operative upgrade.
      </p>
    </div>
  </div>
);

export default App;
