"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  price: number;
  teacher_name: string;
  video_count: number;
  enrollment_count: number;
  is_featured: boolean;
}

export default function StudentExplore() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'Grammar', 'Vocabulary', 'Speaking', 'Writing', 'IELTS', 'TOEFL'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, courses]);

  const fetchCourses = async () => {
    try {
      setCourses([]);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await fetch('/api/enrollments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (response.ok) {
        toast.success('Enrollment request sent!');
      } else {
        throw new Error('Failed to enroll');
      }
    } catch (error) {
      toast.error('Failed to send enrollment request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/student/home" className="font-syne text-xl font-bold text-gradient">HB CLASSES</Link>
            <Link href="/student/home">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-syne text-3xl font-bold text-text mb-2">Explore Courses</h1>
          <p className="text-muted">Discover new courses and start learning today</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-accent text-white' : 'bg-surface text-muted border border-border hover:border-accent/50'}`}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <Card className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No Courses Found</h3>
            <p className="text-muted">Try adjusting your search or filters</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card hover className="h-full flex flex-col">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-surface">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted" />
                      </div>
                    )}
                    {course.is_featured && <Badge variant="warning" className="absolute top-2 right-2">Featured</Badge>}
                  </div>
                  <div className="flex-1">
                    <Badge variant="info" size="sm" className="mb-2">{course.category}</Badge>
                    <h3 className="font-syne text-lg font-bold text-text mb-2">{course.title}</h3>
                    <p className="text-sm text-muted mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted mb-4">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.enrollment_count}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.video_count} videos</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-lg font-bold text-accent">₹{course.price}</span>
                    <Button size="sm" onClick={() => handleEnroll(course.id)}>Enroll Now</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}