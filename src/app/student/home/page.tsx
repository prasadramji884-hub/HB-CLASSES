"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, TrendingUp, Bell, Search, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardData {
  enrolledCourses: any[];
  liveSessions: any[];
  recentVideos: any[];
  progress: any[];
  notifications: number;
}

export default function StudentHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setData({
        enrolledCourses: [],
        liveSessions: [],
        recentVideos: [],
        progress: [],
        notifications: 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/student/home" className="font-syne text-xl font-bold text-gradient">
              HB CLASSES
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/student/search">
                <Button variant="ghost" size="sm" leftIcon={<Search className="w-4 h-4" />}>
                  Search
                </Button>
              </Link>
              <Link href="/student/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {data?.notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {data.notifications}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/student/profile">
                <Button variant="ghost" size="sm" leftIcon={<User className="w-4 h-4" />}>
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-syne text-3xl font-bold text-text mb-2">
            Welcome back, Student!
          </h1>
          <p className="text-muted">Here's what's happening with your courses</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data?.enrolledCourses.length || 0}</p>
              <p className="text-sm text-muted">Enrolled Courses</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{data?.recentVideos.length || 0}</p>
              <p className="text-sm text-muted">Videos Watched</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">0h</p>
              <p className="text-sm text-muted">Study Time</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">0%</p>
              <p className="text-sm text-muted">Avg Progress</p>
            </div>
          </Card>
        </div>

        {/* Live Sessions */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne text-xl font-bold text-text">Live Sessions</h2>
            <Link href="/student/explore">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {data?.liveSessions.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">No Live Sessions</h3>
              <p className="text-muted text-sm mb-4">There are no live classes scheduled right now</p>
              <Link href="/student/explore">
                <Button variant="outline">Explore Courses</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Live session cards would go here */}
            </div>
          )}
        </section>

        {/* Enrolled Courses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne text-xl font-bold text-text">My Courses</h2>
            <Link href="/student/explore">
              <Button variant="ghost" size="sm">Explore More</Button>
            </Link>
          </div>

          {data?.enrolledCourses.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">No Courses Yet</h3>
              <p className="text-muted text-sm mb-4">Enroll in a course to start learning</p>
              <Link href="/student/explore">
                <Button>Browse Courses</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Course cards would go here */}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}