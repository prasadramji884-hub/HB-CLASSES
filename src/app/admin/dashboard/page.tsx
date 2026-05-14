"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, BookOpen, Video, Radio, Settings, 
  Megaphone, Shield, LogOut, TrendingUp, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'Students', href: '/admin/students' },
  { icon: Users, label: 'Teachers', href: '/admin/teachers' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
  { icon: Video, label: 'Videos', href: '/admin/videos' },
  { icon: Radio, label: 'Live Sessions', href: '/admin/live' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalVideos: 0,
    pendingApprovals: 0,
    liveSessions: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch from API in production
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        totalVideos: 0,
        pendingApprovals: 0,
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
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border fixed h-full">
        <div className="p-6">
          <Link href="/admin/dashboard" className="font-syne text-xl font-bold text-gradient">
            HB CLASSES
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="w-3 h-3 text-accent" />
            <p className="text-xs text-muted">Admin Panel</p>
          </div>
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
            <div>
              <h1 className="font-syne text-2xl font-bold text-text">Admin Dashboard</h1>
              <p className="text-sm text-muted">Platform Overview</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="danger" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {stats.pendingApprovals} Pending
              </Badge>
              <Badge variant="success">Superadmin</Badge>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold text-text">{stats.totalStudents}</p>
                <p className="text-xs text-muted">Students</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text">{stats.totalTeachers}</p>
                <p className="text-xs text-muted">Teachers</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text">{stats.totalCourses}</p>
                <p className="text-xs text-muted">Courses</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text">{stats.totalVideos}</p>
                <p className="text-xs text-muted">Videos</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text">{stats.pendingApprovals}</p>
                <p className="text-xs text-muted">Pending</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-text">{stats.liveSessions}</p>
                <p className="text-xs text-muted">Live</p>
              </div>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/admin/students">
                  <Button className="w-full justify-start" leftIcon={<Users className="w-4 h-4" />}>
                    Manage Students
                  </Button>
                </Link>
                <Link href="/admin/courses">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<BookOpen className="w-4 h-4" />}>
                    Create Course
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start" leftIcon={<Settings className="w-4 h-4" />}>
                    App Settings
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Registrations */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-syne text-lg font-bold text-text">Recent Registrations</h3>
                <Link href="/admin/students">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {recentRegistrations.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                  <p>No pending registrations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Registration items would go here */}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}