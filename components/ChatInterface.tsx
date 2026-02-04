
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Camera, SurveillanceEvent, EventType } from '../types';
import { Icons } from '../constants';
import { analyzeVideoFrame } from '../services/geminiService';
import { supabaseDb } from '../utils/supabaseDb';

interface ChatInterfaceProps {
  camera: Camera;
  events: SurveillanceEvent[];
  onCaptureFrame: () => string | null;
  onNewEvent: (event: SurveillanceEvent) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ camera, events, onCaptureFrame, onNewEvent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load persistent history for this camera
  useEffect(() => {
    const loadHistory = async () => {
      const history = await supabaseDb.messages.getByCamera(camera.id);
      setMessages(history);
    };
    loadHistory();
  }, [camera.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsgInput: Omit<ChatMessage, keyof import('../types').BaseEntity> = {
      sessionId: `session-${camera.id}`,
      cameraId: camera.id,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const savedUserMsg = await supabaseDb.messages.add(userMsgInput);
    if (savedUserMsg) setMessages(prev => [...prev, savedUserMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const frame = onCaptureFrame();

      if (!frame) {
        let errorMsg = "SYSTEM ERROR: Node imagery inaccessible. ";
        if (camera.isExternal) {
          errorMsg += "External provider security policy restricts frame buffering.";
        } else {
          errorMsg += "Check CORS headers or buffer stability.";
        }

        const savedError = await supabaseDb.messages.add({
          sessionId: `session-${camera.id}`,
          cameraId: camera.id,
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (savedError) setMessages(prev => [...prev, savedError]);
        setIsTyping(false);
        return;
      }

      const result = await analyzeVideoFrame(text, frame, camera, events);

      const assistantMsgInput: Omit<ChatMessage, keyof import('../types').BaseEntity> = {
        sessionId: `session-${camera.id}`,
        cameraId: camera.id,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedEntities: result.detectedEntities,
        summary: result.summary
      };

      const savedAssistantMsg = await supabaseDb.messages.add(assistantMsgInput);
      if (savedAssistantMsg) setMessages(prev => [...prev, savedAssistantMsg]);

      if (result.detectedEntities?.length > 0) {
        onNewEvent({
          cameraId: camera.id,
          timestamp: new Date().toISOString(),
          type: result.detectedEntities.includes('person') ? EventType.PERSON :
            result.detectedEntities.includes('vehicle') ? EventType.VEHICLE : EventType.MOTION,
          description: result.summary,
          confidence: result.confidence.toLowerCase() as any,
          entities: result.detectedEntities
        } as any); // Type safety handled by db.events.add in App.tsx
      }

    } catch (err: any) {
      const savedError = await supabaseDb.messages.add({
        sessionId: `session-${camera.id}`,
        cameraId: camera.id,
        role: 'assistant',
        content: "CRITICAL FAILURE: Intelligence synthesis interrupted. Re-establish node link.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      if (savedError) setMessages(prev => [...prev, savedError]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm("Confirm deletion of node analysis archive?")) {
      await supabaseDb.messages.clear(camera.id);
      setMessages([]);
    }
  };

  const suggestedQuestions = [
    "Summarize video",
    "Perform full visual sweep",
    "Identify active subjects",
    "Any vehicle movement?",
    "Check for anomalies"
  ];

  return (
    <div className="flex flex-col h-full bg-surface rounded-3xl border border-border overflow-hidden transition-colors shadow-2xl">
      <div className="p-5 border-b border-border flex items-center justify-between bg-background/20">
        <div className="flex items-center space-x-3">
          <Icons.MessageSquare className="text-blue-500" />
          <h2 className="font-black uppercase italic tracking-tighter text-primary">Node Analysis Center</h2>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-2 hover:bg-rose-500/10 text-secondary hover:text-rose-500 rounded-lg transition-colors mr-2"
              title="Wipe Session Archive"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
          <div className={`w-2 h-2 rounded-full ${camera.isExternal ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
          <span className="text-[10px] text-secondary uppercase font-black tracking-widest">
            {camera.isExternal ? 'ReadOnly' : 'Live Intel'}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 opacity-40">
            <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10">
              <Icons.Shield className="text-blue-500 w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary mb-2 uppercase italic">Awaiting Operator</h3>
              <p className="text-[10px] text-secondary max-w-xs mx-auto leading-relaxed font-black uppercase tracking-widest">
                Node analysis standby. Requesting manual initialization for active tracking.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[95%] rounded-[1.5rem] p-5 shadow-2xl border ${msg.role === 'user' ? 'bg-blue-600 text-white border-blue-500/50' : 'bg-background/90 text-primary border-white/5'}`}>
              <div className="text-[10px] opacity-60 mb-3 flex justify-between items-center font-black uppercase tracking-[0.2em]">
                <div className="flex items-center space-x-2">
                  <span className={msg.role === 'user' ? 'text-white' : 'text-blue-400'}>{msg.role === 'user' ? 'Command' : 'AI NODE'}</span>
                  {msg.role === 'assistant' && (
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[8px] font-mono border border-white/5 tracking-normal">SOURCE: {camera.name}</span>
                  )}
                </div>
                <span className="ml-6 font-mono">{msg.timestamp}</span>
              </div>
              <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'assistant' ? 'font-medium font-mono' : 'font-bold'}`}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-background/40 border border-border rounded-2xl px-6 py-4 flex items-center space-x-4">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Synthesizing Visual Telemetry...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-background/20 border-t border-border backdrop-blur-md">
        {!camera.isExternal && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[9px] px-3 py-2 bg-surface/50 hover:bg-blue-600/20 text-secondary hover:text-blue-400 rounded-xl border border-white/5 transition-all font-black uppercase tracking-widest"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={camera.isExternal ? "Interaction restricted for cloud nodes" : "Initiate node query..."}
            disabled={camera.isExternal && messages.length > 0}
            className="w-full bg-background border border-border rounded-2xl px-6 py-5 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all text-primary placeholder:text-secondary/40 pr-16 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || (camera.isExternal && messages.length > 0)}
            className="absolute right-3 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
