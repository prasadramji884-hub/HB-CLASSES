"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, Plus, Copy, ExternalLink, Clock, Users, 
  AlertCircle, CheckCircle, XCircle, Play, Square,
  Shield, Link as LinkIcon, Trash2, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface LiveSession {
  id: string;
  title: string;
  description: string;
  youtube_live_url_encrypted: string;
  youtube_video_id: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  viewer_count: number;
  is_unlisted: boolean;
}

export default function TeacherLiveManagement() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // In production: fetch from API
      setSessions([]);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      toast.error('Title and YouTube URL are required');
      return;
    }

    // Validate YouTube URL
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      toast.error('Invalid YouTube URL. Please check the link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          youtubeUrl,
          scheduledAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Live session started! Students can now join.');
        setShowAddModal(false);
        resetForm();
        fetchSessions();
      } else {
        throw new Error(data.error || 'Failed to start live session');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl || !scheduledDate || !scheduledTime) {
      toast.error('All fields are required');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          youtubeUrl,
          scheduledAt,
          isScheduled: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Live session scheduled successfully!');
        setShowAddModal(false);
        resetForm();
        fetchSessions();
      } else {
        throw new Error(data.error || 'Failed to schedule');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndLive = async (sessionId: string) => {
    try {
      const response = await fetch('/api/live/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        toast.success('Live session ended. Recording is now available.');
        setShowEndModal(false);
        fetchSessions();
      } else {
        throw new Error('Failed to end session');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setScheduledDate('');
    setScheduledTime('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading live sessions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-syne text-2xl font-bold text-text">Live Classes</h1>
            <p className="text-sm text-muted">Manage your live sessions</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Start/Schedule Live
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Instructions Card */}
        <Card className="mb-8 border-accent/30 bg-accent/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-syne font-bold text-text mb-2">How to Start a Live Class</h3>
              <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                <li>Go to YouTube Studio → Create → Go Live</li>
                <li>Set visibility to <strong className="text-accent">Unlisted</strong> (IMPORTANT!)</li>
                <li>Copy the live stream URL</li>
                <li>Paste the URL below and click "Start Live Session"</li>
                <li>Students will get notified automatically</li>
              </ol>
              <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span>Make sure your YouTube stream is set to "Unlisted" for security</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Live Sessions */}
        <section className="mb-8">
          <h2 className="font-syne text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            Active Live Sessions
          </h2>

          {sessions.filter(s => s.status === 'live').length === 0 ? (
            <Card className="text-center py-12">
              <Radio className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No Active Live Sessions</h3>
              <p className="text-muted text-sm">Start a new live class to begin teaching</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.filter(s => s.status === 'live').map((session) => (
                <Card key={session.id} className="border-red-500/30">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="danger" className="mb-2">LIVE</Badge>
                      <h3 className="font-syne font-bold text-text">{session.title}</h3>
                      <p className="text-sm text-muted">{session.description}</p>
                    </div>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowEndModal(true);
                      }}
                      leftIcon={<Square className="w-4 h-4" />}
                    >
                      End
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.viewer_count} watching
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Started {new Date(session.started_at || '').toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">YouTube Link:</span>
                      <code className="text-xs text-accent bg-accent/10 px-2 py-1 rounded flex-1 truncate">
                        {session.youtube_video_id}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(session.youtube_video_id)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Scheduled Sessions */}
        <section className="mb-8">
          <h2 className="font-syne text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Scheduled Sessions
          </h2>

          {sessions.filter(s => s.status === 'scheduled').length === 0 ? (
            <Card className="text-center py-8">
              <Clock className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted">No scheduled sessions</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.status === 'scheduled').map((session) => (
                <Card key={session.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="warning">Scheduled</Badge>
                    <div>
                      <h4 className="font-medium text-text">{session.title}</h4>
                      <p className="text-sm text-muted">
                        {new Date(session.scheduled_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Edit3 className="w-4 h-4" />}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Past Sessions */}
        <section>
          <h2 className="font-syne text-xl font-bold text-text mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Past Sessions
          </h2>

          {sessions.filter(s => s.status === 'ended').length === 0 ? (
            <Card className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted">No past sessions</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.status === 'ended').map((session) => (
                <Card key={session.id} className="flex items-center justify-between opacity-70">
                  <div className="flex items-center gap-4">
                    <Badge variant="success">Ended</Badge>
                    <div>
                      <h4 className="font-medium text-text">{session.title}</h4>
                      <p className="text-sm text-muted">
                        Ended {new Date(session.ended_at || '').toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Recording
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add/Start Live Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne text-xl font-bold text-text">Start/Schedule Live Class</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-text">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <Input
                label="Class Title"
                placeholder="e.g., Advanced Grammar Class"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you teach in this class?"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-accent min-h-[100px] resize-none"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400 mb-1">YouTube Live URL</p>
                    <p className="text-xs text-muted mb-2">
                      Paste your YouTube live stream link here. Make sure it's set to "Unlisted".
                    </p>
                    <Input
                      placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      leftIcon={<LinkIcon className="w-4 h-4" />}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Schedule Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Schedule Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleScheduleLive}
                  isLoading={isSubmitting}
                >
                  Schedule for Later
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleStartLive}
                  isLoading={isSubmitting}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Start Live Now
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* End Live Confirmation Modal */}
      {showEndModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Square className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="font-syne text-xl font-bold text-text mb-2">End Live Session?</h3>
              <p className="text-muted mb-6">
                Are you sure you want to end "{selectedSession.title}"? 
                Students will be disconnected and the recording will be saved.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEndModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1"
                  onClick={() => handleEndLive(selectedSession.id)}
                >
                  End Session
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}