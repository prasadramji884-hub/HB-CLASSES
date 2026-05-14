"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Users, Video, Radio, Megaphone, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher/dashboard' },
  { icon: BookOpen, label: 'My Courses', href: '/teacher/courses' },
  { icon: Users, label: 'Students', href: '/teacher/students' },
  { icon: Radio, label: 'Live Classes', href: '/teacher/live' },
  { icon: Megaphone, label: 'Announcements', href: '/teacher/announcements' },
];

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalVideos: 0,
    liveSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch from API in production
      setStats({
        totalStudents: 0,
        totalCourses: 0,
        totalVideos: 0,
        liveSessions: 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'hb_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/auth/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border fixed h-full">
        <div className="p-6">
          <Link href="/teacher/dashboard" className="font-syne text-xl font-bold text-gradient">
            HB CLASSES
          </Link>
          <p className="text-xs text-muted mt-1">Teacher Panel</p>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-text hover:bg-accent/10 transition-all"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-40 glass border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-syne text-2xl font-bold text-text">Teacher Dashboard</h1>
            <Badge variant="success">Online</Badge>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.totalStudents}</p>
                <p className="text-sm text-muted">Total Students</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.totalCourses}</p>
                <p className="text-sm text-muted">My Courses</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.totalVideos}</p>
                <p className="text-sm text-muted">Total Videos</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Radio className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{stats.liveSessions}</p>
                <p className="text-sm text-muted">Live Sessions</p>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/teacher/live">
                  <Button className="w-full justify-start" leftIcon={<Radio className="w-4 h-4" />}>
                    Start Live Class
                  </Button>
                </Link>
                <Link href="/teacher/courses">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<BookOpen className="w-4 h-4" />}>
                    Manage Courses
                  </Button>
                </Link>
                <Link href="/teacher/announcements">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Megaphone className="w-4 h-4" />}>
                    Post Announcement
                  </Button>
                </Link>
              </div>
            </Card>

            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-muted">
                <p>No recent activity</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}