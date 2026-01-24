
import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react';
import { Camera, SurveillanceEvent, EventType } from '../types';

declare var Hls: any;

interface VideoPlayerProps {
  camera: Camera;
  events: SurveillanceEvent[];
  onUseDemo?: () => void;
}

export interface VideoPlayerHandle {
  captureFrame: () => string | null;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(({ camera, events, onUseDemo }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    setError(null);
    const video = videoRef.current;
    if (!video || camera.isExternal) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = camera.streamUrl.toLowerCase().includes('.m3u8');
    
    // Crucial for capturing cross-origin frames
    video.crossOrigin = "anonymous";

    if (isHls) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(camera.streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(e => console.warn("Auto-play blocked", e));
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = camera.streamUrl;
      } else {
        setError("Browser does not support HLS.");
      }
    } else {
      video.src = camera.streamUrl;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [camera.streamUrl, camera.isExternal]);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      if (!camera.isExternal && videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        try {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          }
        } catch (e) {
          console.error("Frame capture failed due to security/CORS restrictions", e);
          return null;
        }
      }
      return null;
    }
  }));

  const getMarkerColor = (type: EventType) => {
    switch (type) {
      case EventType.PERSON: return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case EventType.VEHICLE: return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]';
      case EventType.ALERT: return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
      default: return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    }
  };

  const mappedMarkers = useMemo(() => {
    return events.filter(e => e.cameraId === camera.id).map(event => ({ ...event, position: Math.random() * 100 }));
  }, [events, camera.id]);

  return (
    <div className="relative group bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-border transition-colors">
      <div className="aspect-video relative bg-black flex items-center justify-center">
        {camera.isExternal ? (
          <iframe
            src={camera.streamUrl}
            className="w-full h-full border-none"
            allow="autoplay; fullscreen"
            allowFullScreen
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
            onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
            crossOrigin="anonymous"
            playsInline
            loop
            muted
            autoPlay
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl flex items-center space-x-3 border border-white/10 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          <span className="text-xs font-black tracking-widest uppercase text-white">Live CCTV Node</span>
        </div>
      </div>
      
      <div className="p-6 bg-surface transition-colors border-t border-border">
        <div className="flex items-center space-x-4">
           <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Telemetry Active: Encrypted Link</span>
           {error && <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-4">{error}</span>}
           <div className="ml-auto flex space-x-2">
             {mappedMarkers.slice(-5).map(m => (
               <div key={m.id} className={`w-1.5 h-1.5 rounded-full ${getMarkerColor(m.type)}`}></div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
