"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { 
  Radio, MessageCircle, Send, Pin, Trash2, Users, Clock, 
  AlertCircle, Play, Pause, Volume2, VolumeX, Maximize,
  ChevronDown, ChevronUp, User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended';
  youtube_live_url_encrypted: string;
  scheduled_at: string;
  teacher_name: string;
  teacher_avatar?: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
}

export default function StudentLiveSession() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [watermarkPos, setWatermarkPos] = useState(0);
  const [studentName, setStudentName] = useState('Student');
  const [studentEmail, setStudentEmail] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Rotating watermark
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos((prev) => (prev + 1) % 4);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch session details
  useEffect(() => {
    fetchSessionDetails();
    fetchUserInfo();
  }, [sessionId]);

  // Realtime chat subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`live_chat_${sessionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_messages', filter: `live_session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => 
              prev.map((m) => m.id === payload.new.id ? payload.new as ChatMessage : m)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessionDetails = async () => {
    try {
      // In production, fetch from API
      // For now, showing structure
      setSession({
        id: sessionId,
        title: 'Live English Class - Grammar Basics',
        description: 'Today we will cover advanced grammar concepts',
        status: 'live',
        youtube_live_url_encrypted: '',
        scheduled_at: new Date().toISOString(),
        teacher_name: 'Teacher Name',
      });
    } catch (error) {
      toast.error('Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    // Fetch student name/email for watermark
    try {
      // API call to get user info
      setStudentName('John Doe');
      setStudentEmail('john@example.com');
    } catch (error) {
      console.error('Failed to fetch user info');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // API call to send message
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getVideoUrl = () => {
    // In production: decrypt from session.youtube_live_url_encrypted
    // Return embed URL with security parameters
    const videoId = 'VIDEO_ID'; // Extract from encrypted URL
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&mute=1`;
  };

  const getWatermarkPosition = () => {
    const positions = ['top-4 left-4', 'top-4 right-4', 'bottom-20 right-4', 'bottom-20 left-4'];
    return positions[watermarkPos];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading live session..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-syne text-xl font-bold text-text mb-2">Session Not Found</h2>
          <p className="text-muted">This live session does not exist or has ended</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <h1 className="font-syne text-lg font-bold text-text">{session.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {session.teacher_name}
                </span>
                <Badge variant="danger" size="sm">LIVE</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm text-muted">
              <Users className="w-4 h-4" />
              {onlineCount} online
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsChatOpen(!isChatOpen)}
              leftIcon={isChatOpen ? <ChevronRight className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
            >
              {isChatOpen ? 'Hide Chat' : 'Show Chat'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 flex gap-4" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Video Player */}
        <div className={`flex-1 ${isChatOpen ? '' : 'w-full'}`}>
          <div 
            ref={videoContainerRef}
            className="relative aspect-video bg-black rounded-2xl overflow-hidden select-none"
          >
            {/* YouTube Live Embed */}
            {session.status === 'live' && (
              <iframe
                src={getVideoUrl()}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Scheduled State */}
            {session.status === 'scheduled' && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface">
                <div className="text-center">
                  <Clock className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="font-syne text-xl font-bold text-text mb-2">Class Starts Soon</h3>
                  <p className="text-muted">
                    Scheduled for {new Date(session.scheduled_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Ended State */}
            {session.status === 'ended' && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface">
                <div className="text-center">
                  <Pause className="w-16 h-16 text-muted mx-auto mb-4" />
                  <h3 className="font-syne text-xl font-bold text-text mb-2">Class Ended</h3>
                  <p className="text-muted">This live session has ended</p>
                </div>
              </div>
            )}

            {/* Watermark Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`absolute ${getWatermarkPosition()} text-white/40 text-sm font-medium`}
              >
                <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <p className="text-xs">{studentName}</p>
                  <p className="text-[10px] opacity-70">{studentEmail}</p>
                </div>
              </motion.div>
            </div>

            {/* Security Overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />
          </div>

          {/* Session Info */}
          <Card className="mt-4">
            <h3 className="font-syne text-lg font-bold text-text mb-2">{session.title}</h3>
            <p className="text-muted text-sm">{session.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Started {new Date(session.scheduled_at).toLocaleTimeString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {onlineCount} watching
              </span>
            </div>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex flex-col"
            >
              <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-syne font-bold text-text flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-accent" />
                    Live Chat
                  </h3>
                  <Badge variant="success" size="sm">{messages.length} msgs</Badge>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted text-sm py-8">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.is_pinned ? 'bg-accent/10 rounded-lg p-2' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text">{msg.user_name}</span>
                            {msg.is_pinned && <Pin className="w-3 h-3 text-accent" />}
                          </div>
                          <p className="text-sm text-muted">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-accent"
                    />
                    <Button type="submit" size="sm" leftIcon={<Send className="w-4 h-4" />}>
                      Send
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}