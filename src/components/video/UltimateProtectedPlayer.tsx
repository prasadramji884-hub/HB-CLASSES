"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, AlertTriangle,
  Shield, Lock, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface UltimateProtectedPlayerProps {
  videoId: string; // Database video ID (not YouTube ID)
  studentName: string;
  studentEmail: string;
  onProgress?: (seconds: number, completed: boolean) => void;
  initialProgress?: number;
}

export default function UltimateProtectedPlayer({
  videoId,
  studentName,
  studentEmail,
  onProgress,
  initialProgress = 0,
}: UltimateProtectedPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted (browser policy)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const [token, setToken] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [securityLevel, setSecurityLevel] = useState('maximum');
  const progressInterval = useRef<NodeJS.Timeout>();
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const watermarkInterval = useRef<NodeJS.Timeout>();
  const devToolsCheck = useRef<NodeJS.Timeout>();
  const [watchTime, setWatchTime] = useState(0);

  // Fetch video token on mount
  useEffect(() => {
    fetchVideoToken();
    return () => {
      // Cleanup: invalidate token when component unmounts
      if (token) {
        invalidateToken(token);
      }
    };
  }, [videoId]);

  const fetchVideoToken = async () => {
    try {
      setIsLoading(true);

      // Step 1: Check visibility first
      const visibilityRes = await fetch(`/api/video/visibility-check?videoId=${videoId}`);
      const visibilityData = await visibilityRes.json();

      if (!visibilityData.hasAccess) {
        toast.error('You do not have access to this video');
        setIsLoading(false);
        return;
      }

      // Step 2: Get video token
      const response = await fetch(`/api/video/token?videoId=${videoId}`);
      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setYoutubeVideoId(data.videoId); // Only YouTube ID, never full URL
        setVideoTitle(data.title);
        setIsTokenValid(true);

        // Auto-start playing when token received
        setTimeout(() => setIsPlaying(true), 500);
      } else {
        toast.error(data.error || 'Failed to load video');
      }
    } catch (error) {
      toast.error('Error loading video');
    } finally {
      setIsLoading(false);
    }
  };

  const invalidateToken = async (tokenToInvalidate: string) => {
    try {
      await fetch('/api/video/invalidate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToInvalidate }),
      });
    } catch (error) {
      console.error('Token invalidation error:', error);
    }
  };

  // Rotating watermark - changes position every 8 seconds
  useEffect(() => {
    if (isPlaying) {
      watermarkInterval.current = setInterval(() => {
        setWatermarkPosition((prev) => (prev + 1) % 4);
      }, 8000);
    }
    return () => {
      if (watermarkInterval.current) clearInterval(watermarkInterval.current);
    };
  }, [isPlaying]);

  // Dev tools detection - advanced
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      // Additional checks
      const debuggerCheck = /./;
      debuggerCheck.toString = function() {
        setDevToolsDetected(true);
        setIsPlaying(false);
        return 'debugger';
      };
      console.log('%c', debuggerCheck);

      if (widthThreshold || heightThreshold) {
        setDevToolsDetected(true);
        setIsPlaying(false);
        // Invalidate token immediately
        if (token) invalidateToken(token);
      }
    };

    window.addEventListener('resize', detectDevTools);
    devToolsCheck.current = setInterval(detectDevTools, 1000);

    return () => {
      window.removeEventListener('resize', detectDevTools);
      if (devToolsCheck.current) clearInterval(devToolsCheck.current);
    };
  }, [token]);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toast.error('Right-click is disabled for security', { duration: 2000 });
      return false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu, true);
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu, true);
      }
    };
  }, []);

  // Disable keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedKeys = [
        'F12',
        'F5', // Prevent refresh
        'PrintScreen',
      ];

      const blockedCombos = [
        { ctrl: true, shift: true, key: 'I' },
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'C' },
        { ctrl: true, key: 'U' }, // View source
        { ctrl: true, key: 'S' }, // Save
        { ctrl: true, key: 'P' }, // Print
      ];

      const isBlocked = blockedKeys.includes(e.key) ||
        blockedCombos.some(combo => 
          e.ctrlKey === combo.ctrl && 
          e.shiftKey === combo.shift && 
          e.key === combo.key
        );

      if (isBlocked) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Keyboard shortcuts are disabled', { duration: 2000 });
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Prevent text selection
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.userSelect = 'none';
      container.style.webkitUserSelect = 'none';
    }
  }, []);

  // Track watch time
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          if (newTime % 5 === 0) { // Report every 5 seconds
            onProgress?.(newTime, false);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, onProgress]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Watermark positions (4 corners)
  const watermarkPositions = [
    'top-4 left-4',
    'top-4 right-4', 
    'bottom-24 right-4',
    'bottom-24 left-4',
  ];

  if (isLoading) {
    return (
      <div className="aspect-video bg-surface rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-accent mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-muted">Securing video...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="aspect-video bg-surface rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-muted">Access denied or expired</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={fetchVideoToken}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-2xl overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Dev Tools Warning */}
      <AnimatePresence>
        {devToolsDetected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <div className="text-center p-8 max-w-md">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Security Alert</h3>
              <p className="text-muted mb-4">
                Developer tools detected. Video access has been revoked for security.
                Please close developer tools and refresh.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Page
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* YouTube Iframe - ONLY video ID used, NEVER full URL */}
      {youtubeVideoId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&playsinline=1&enablejsapi=0&origin=${window.location.origin}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          style={{ 
            pointerEvents: 'none', // Prevent direct interaction
            border: 'none',
          }}
          title={videoTitle}
          loading="eager"
        />
      )}

      {/* Multi-layer Watermark System */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main rotating watermark */}
        <motion.div
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`absolute ${watermarkPositions[watermarkPosition]} z-20`}
        >
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            <p className="text-white/70 text-sm font-semibold">{studentName}</p>
            <p className="text-white/50 text-[10px]">{studentEmail}</p>
            <p className="text-white/30 text-[8px] mt-1">HB CLASSES | {new Date().toLocaleDateString()}</p>
          </div>
        </motion.div>

        {/* Secondary watermark (center, very subtle) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <p className="text-white/[0.03] text-4xl font-bold rotate-[-15deg] select-none">
            {studentName}
          </p>
        </div>

        {/* Corner watermarks (permanent) */}
        <div className="absolute top-2 left-2 text-white/20 text-[10px] z-10">
          HB CLASSES | CONFIDENTIAL
        </div>
        <div className="absolute top-2 right-2 text-white/20 text-[10px] z-10">
          {studentEmail}
        </div>
      </div>

      {/* Custom Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 z-30"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-white/80 text-sm font-medium">Protected Content</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-green-400" />
                <span className="text-green-400 text-xs">DRM Protected</span>
              </div>
            </div>

            {/* Center Play Button (when paused) */}
            {!isPlaying && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-accent/90 rounded-full flex items-center justify-center hover:bg-accent transition-all hover:scale-110"
              >
                <Play className="w-10 h-10 text-white ml-1" />
              </button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-accent transition-colors p-2"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:text-accent transition-colors p-2"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Progress Bar */}
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((watchTime / 3600) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <span className="text-white/60 text-xs">
                {Math.floor(watchTime / 60)}:{(watchTime % 60).toString().padStart(2, '0')}
              </span>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-accent transition-colors p-2"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Shield Overlay (always present, subtle) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <Shield className="w-3 h-3 text-accent/60" />
          <span className="text-white/40 text-[10px]">Secured by HB CLASSES</span>
        </div>
      </div>

      {/* Anti-screenshot overlay (very subtle color shift) */}
      <div 
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          background: 'linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.01) 50%, transparent 51%)',
          backgroundSize: '3px 3px',
        }}
      />
    </div>
  );
}