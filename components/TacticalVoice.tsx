
import React, { useState, useEffect, useRef } from 'react';
import { connectTacticalLive } from '../services/geminiService';
import { Icons } from '../constants';
import { ChatMessage, Camera } from '../types';

interface TacticalVoiceProps {
  cameras: Camera[];
  activeCamera: Camera | null;
}

const TacticalVoice: React.FC<TacticalVoiceProps> = ({ cameras, activeCamera: initialCamera }) => {
  const [targetNode, setTargetNode] = useState<Camera | null>(initialCamera || cameras[0] || null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  
  // Real-time transcription states
  const [liveInput, setLiveInput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Accumulators for turn completion
  const fullInputAccumulator = useRef('');
  const fullOutputAccumulator = useRef('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveInput, liveOutput]);

  useEffect(() => {
    return () => {
      if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
      sessionRef.current?.close();
    };
  }, []);

  const decode = (base64: string) => {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      return bytes;
    } catch (e) {
      return new Uint8Array(0);
    }
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    if (!content.trim()) return;
    setMessages(prev => {
      const lastMsg = prev[prev.length - 1];
      if (lastMsg && lastMsg.role === role && lastMsg.content === content) return prev;
      
      return [...prev, {
        id: Date.now().toString() + Math.random(),
        role,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } as ChatMessage];
    });
  };

  const handleCommand = (cmd: string) => {
    if (!isActive) {
      toggleVoice().then(() => {
        setTimeout(() => {
           sessionRef.current?.sendRealtimeInput({ message: cmd });
           addMessage('user', cmd);
        }, 1000);
      });
    } else {
      sessionRef.current?.sendRealtimeInput({ message: cmd });
      addMessage('user', cmd);
    }
  };

  const toggleVoice = async () => {
    if (isActive) {
      if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
      sessionRef.current?.close();
      setIsActive(false);
      setLiveInput('');
      setLiveOutput('');
      return;
    }

    if (!targetNode) {
      setError("Please select a target node.");
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = connectTacticalLive({
        onopen: () => {
          setIsActive(true);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => {
               try {
                 s.sendRealtimeInput({ 
                   media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                 });
               } catch (err) {}
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);

          frameIntervalRef.current = window.setInterval(() => {
            if (videoPreviewRef.current && canvasRef.current && !targetNode.isExternal) {
              const canvas = canvasRef.current;
              const video = videoPreviewRef.current;
              try {
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 360;
                const ctx = canvas.getContext('2d');
                if (ctx && video.readyState >= 2) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                  sessionPromise.then(s => s.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'image/jpeg' }
                  }));
                }
              } catch (e) {
                console.warn("Frame acquisition paused: Security/CORS limit.");
              }
            }
          }, 1000);
        },
        onmessage: async (message: any) => {
          // Real-time Operator Transcription
          if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            fullInputAccumulator.current = text; // Usually sent as full segments
            setLiveInput(text);
          }
          
          // Real-time AI Transcription (Streaming)
          if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            fullOutputAccumulator.current += text;
            setLiveOutput(prev => prev + text);
          }
          
          if (message.serverContent?.turnComplete) {
            if (fullInputAccumulator.current) addMessage('user', fullInputAccumulator.current);
            if (fullOutputAccumulator.current) addMessage('assistant', fullOutputAccumulator.current);
            
            // Clear accumulators and live states
            fullInputAccumulator.current = '';
            fullOutputAccumulator.current = '';
            setLiveInput('');
            setLiveOutput('');
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            setIsProcessing(true);
            const ctx = outAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsProcessing(false);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsProcessing(false);
            setLiveOutput(''); // Wipe partial text on interrupt
            fullOutputAccumulator.current = '';
          }
        },
        onerror: (e: any) => {
          console.error("Session Error:", e);
          setError("Radio link unstable. Check network/API key.");
          setIsActive(false);
        },
        onclose: () => setIsActive(false),
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Hardware access denied.");
    }
  };

  const suggestedCommands = [
    "Summarize video",
    "Identify subjects",
    "Check for anomalies",
    "Report vehicle movement"
  ];

  return (
    <div className="flex flex-col space-y-8 max-w-6xl mx-auto w-full animate-in fade-in duration-700 pb-20 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
           <div className="p-3 bg-surface border border-border rounded-2xl">
              <Icons.Activity className="text-blue-500" />
           </div>
           <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Tactical Radio</h2>
              <p className="text-[10px] text-secondary font-black uppercase tracking-[0.3em]">AI Voice Active</p>
           </div>
        </div>

        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setIsNodeSelectorOpen(!isNodeSelectorOpen)}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-3 bg-surface px-6 py-3 rounded-2xl border border-border hover:border-blue-500 transition-all shadow-xl group"
          >
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-secondary'}`}></div>
            <span className="text-xs font-black uppercase tracking-widest">{targetNode?.name || 'Select Node'}</span>
            <Icons.Settings className="w-4 h-4 text-secondary group-hover:text-blue-500 ml-2" />
          </button>

          {isNodeSelectorOpen && (
            <div className="absolute top-full right-0 mt-3 w-64 bg-surface border border-border rounded-2xl shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-border bg-background/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60 px-2">Select Radio Node</span>
              </div>
              {cameras.map(cam => (
                <button
                  key={cam.id}
                  onClick={() => { setTargetNode(cam); setIsNodeSelectorOpen(false); }}
                  className={`w-full text-left px-5 py-4 hover:bg-white/5 flex items-center justify-between transition-colors ${targetNode?.id === cam.id ? 'bg-blue-600/5 text-blue-500' : 'text-primary'}`}
                >
                  <span className="text-xs font-black uppercase">{cam.name}</span>
                  {targetNode?.id === cam.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="flex flex-col items-center justify-center space-y-10 p-6 sm:p-12 bg-surface rounded-[3.5rem] border border-border shadow-2xl relative overflow-hidden min-h-[400px] sm:min-h-[500px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden grayscale">
             {targetNode && !targetNode.isExternal ? (
               <video 
                 ref={videoPreviewRef} 
                 src={targetNode.streamUrl} 
                 muted 
                 autoPlay 
                 loop 
                 crossOrigin="anonymous"
                 className="w-full h-full object-cover scale-110 blur-sm" 
               />
             ) : (
               <div className="w-full h-full bg-grid-white/[0.02]" />
             )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="relative">
            <div className={`absolute -inset-16 bg-blue-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
            <button 
              onClick={toggleVoice}
              className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isActive ? 'bg-rose-600 scale-110 shadow-rose-600/40 ring-4 ring-rose-600/20' : 'bg-blue-600 hover:scale-105 shadow-blue-600/40 ring-4 ring-blue-600/10'}`}
            >
              {isActive ? (
                <div className="flex space-x-2">
                  <div className="w-2 h-10 bg-white rounded-full animate-grow-y"></div>
                  <div className="w-2 h-14 bg-white rounded-full animate-grow-y [animation-delay:0.2s]"></div>
                  <div className="w-2 h-8 bg-white rounded-full animate-grow-y [animation-delay:0.4s]"></div>
                </div>
              ) : (
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v10a3 3 0 006 0V5a3 3 0 00-3-3z"/></svg>
              )}
            </button>
          </div>

          <div className="text-center space-y-6 z-10">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tighter italic">
                {isActive ? 'CHANNEL ACTIVE' : 'RADIO IDLE'}
              </h3>
              <p className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mt-2">
                Node: {targetNode?.name || 'Unassigned'}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {suggestedCommands.map((cmd, i) => (
                <button 
                  key={i}
                  onClick={() => handleCommand(cmd)}
                  className="px-3 py-1.5 bg-background/50 border border-white/5 hover:border-blue-500/50 rounded-lg text-[9px] font-black uppercase tracking-widest text-secondary hover:text-blue-500 transition-all"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 z-20 text-center">{error}</p>}
        </div>

        <div className="flex flex-col bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-background/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                 <Icons.MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest italic">Comms Archive</h4>
            </div>
            <button onClick={() => setMessages([])} className="text-[10px] font-black text-secondary hover:text-rose-500 uppercase tracking-widest transition-colors">Wipe Logs</button>
          </div>
          
          <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto h-[350px] sm:h-[400px] lg:max-h-[500px] custom-scrollbar bg-background/30">
            {messages.length === 0 && !liveInput && !liveOutput ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-24">
                 <Icons.Activity className="w-16 h-16 mb-6" />
                 <p className="text-xs font-black uppercase tracking-[0.4em]">Listening for telemetry...</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[90%] rounded-2xl p-4 sm:p-5 border ${msg.role === 'user' ? 'bg-background/40 border-white/5 text-primary' : 'bg-blue-600/10 border-blue-600/20 text-blue-400'}`}>
                      <div className="flex items-center justify-between mb-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                        <span>{msg.role === 'user' ? 'OPERATOR' : 'TACTICAL-AI'}</span>
                        <span className="ml-8 font-mono">{msg.timestamp}</span>
                      </div>
                      <p className={`text-sm leading-relaxed ${msg.role === 'assistant' ? 'font-mono' : 'font-medium italic'}`}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Live Real-time Transcriptions */}
                {liveInput && (
                  <div className="flex justify-end animate-pulse">
                    <div className="max-w-[90%] rounded-2xl p-4 sm:p-5 border bg-background/40 border-blue-500/30 text-primary">
                       <div className="flex items-center justify-between mb-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                        <span>OPERATOR [LIVE]</span>
                      </div>
                      <p className="text-sm leading-relaxed font-medium italic opacity-70">
                        {liveInput}
                      </p>
                    </div>
                  </div>
                )}
                
                {liveOutput && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl p-4 sm:p-5 border bg-blue-600/10 border-blue-600/40 text-blue-400">
                       <div className="flex items-center justify-between mb-2 text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                        <span>TACTICAL-AI [STREAMING]</span>
                      </div>
                      <p className="text-sm leading-relaxed font-mono">
                        {liveOutput}
                        <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>
          
          {isActive && (
            <div className="p-4 bg-background/50 border-t border-white/5 flex items-center justify-center space-x-1">
               <span className="text-[8px] font-black uppercase tracking-widest text-secondary mr-2">Signal:</span>
               {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 bg-blue-500/50 rounded-full transition-all duration-300 h-1`}
                  style={{ 
                    height: isProcessing ? `${Math.random() * 24 + 4}px` : '4px',
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TacticalVoice;
