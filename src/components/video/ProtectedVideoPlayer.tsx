"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast'; import { Badge } from '@/components/ui/Badge';

interface ProtectedVideoPlayerProps {
  videoId: string;
  studentName: string;
  studentEmail: string;
  onProgress?: (seconds: number, completed: boolean) => void;
  initialProgress?: number;
}

export default function ProtectedVideoPlayer({
  videoId,
  studentName,
  studentEmail,
  onProgress,
  initialProgress = 0,
}: ProtectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [devToolsDetected, setDevToolsDetected] = useState(false);
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const progressInterval = useRef<NodeJS.Timeout>();
  const controlsTimeout = useRef<NodeJS.Timeout>();

  // Fetch video token on mount
  useEffect(() => {
    fetchVideoToken();
  }, [videoId]);

  const fetchVideoToken = async () => {
    try {
      const response = await fetch(`/api/video/token?videoId=${videoId}`);
      const data = await response.json();

      if (data.success) {
        setToken(data.token);
      } else {
        toast.error('Failed to load video');
      }
    } catch (error) {
      toast.error('Error loading video');
    } finally {
      setIsLoading(false);
    }
  };

  // Rotating watermark
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPosition((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dev tools detection
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        setDevToolsDetected(true);
        setIsPlaying(false);
      }
    };

    window.addEventListener('resize', detectDevTools);
    return () => window.removeEventListener('resize', detectDevTools);
  }, []);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled for security');
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  // Disable keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        toast.error('Keyboard shortcuts are disabled');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track progress
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        // In real implementation, get current time from YouTube player
        // and call onProgress
      }, 5000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, onProgress]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
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

  const watermarkPositions = [
    'top-4 left-4',
    'top-4 right-4',
    'bottom-4 right-4',
    'bottom-4 left-4',
  ];

  if (isLoading) {
    return (
      <div className="aspect-video bg-surface rounded-2xl flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-2xl overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Dev Tools Warning */}
      <AnimatePresence>
        {devToolsDetected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <div className="text-center p-8">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Developer Tools Detected</h3>
              <p className="text-muted">Please close developer tools to continue watching</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* YouTube Iframe */}
      {token && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
          style={{ pointerEvents: 'none' }} // Prevent direct interaction
        />
      )}

      {/* Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute ${watermarkPositions[watermarkPosition]} text-white/30 text-sm font-medium`}
        >
          <div className="bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <p className="text-xs">{studentName}</p>
            <p className="text-[10px] opacity-70">{studentEmail}</p>
          </div>
        </motion.div>
      </div>

      {/* Custom Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <h3 className="text-white font-medium text-sm">Protected Content</h3>
              <Badge variant="warning" size="sm">DRM Protected</Badge>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-accent/90 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-accent transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:text-accent transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Progress Bar */}
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${initialProgress}%` }}
                />
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-accent transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Overlay - prevents iframe inspection */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />
    </div>
  );
}