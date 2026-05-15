"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, RefreshCw, Shield, Users, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

const sidebarItems = [
  { icon: Users, label: 'Students', href: '/admin/students' },
  { icon: Users, label: 'Teachers', href: '/admin/teachers' },
  { icon: Shield, label: 'Dashboard', href: '/admin/dashboard' },
];

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
  is_banned: boolean;
  device_fingerprint: string | null;
  created_at: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'banned'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, filterStatus, students]);

  const fetchStudents = async () => {
    try {
      // In production: fetch from /api/admin/students
      setStudents([]);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus === 'pending') {
      filtered = filtered.filter(s => !s.is_approved && !s.is_banned);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(s => s.is_approved && !s.is_banned);
    } else if (filterStatus === 'banned') {
      filtered = filtered.filter(s => s.is_banned);
    }

    setFilteredStudents(filtered);
  };

  const handleApprove = async (studentId: string) => {
    setActionLoading(studentId);
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId }),
      });

      if (response.ok) {
        toast.success('Student approved successfully');
        fetchStudents();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve student');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async (studentId: string) => {
    setActionLoading(studentId);
    try {
      const response = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId }),
      });

      if (response.ok) {
        toast.success('Student banned successfully');
        fetchStudents();
      } else {
        throw new Error('Failed to ban');
      }
    } catch (error) {
      toast.error('Failed to ban student');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetDevice = async (studentId: string) => {
    setActionLoading(studentId);
    try {
      const response = await fetch('/api/admin/users/reset-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId }),
      });

      if (response.ok) {
        toast.success('Device reset successfully');
        fetchStudents();
      } else {
        throw new Error('Failed to reset device');
      }
    } catch (error) {
      toast.error('Failed to reset device');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    document.cookie = 'hb_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/auth/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading students..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border fixed h-full">
        <div className="p-6">
          <Link href="/admin/dashboard" className="font-syne text-xl font-bold text-gradient">HB CLASSES</Link>
          <p className="text-xs text-muted mt-1">Admin Panel</p>
        </div>
        <nav className="px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-text hover:bg-accent/10 transition-all">
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button variant=default" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
            leftIcon={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="sticky top-0 z-40 glass border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-2xl font-bold text-text">Student Management</h1>
              <p className="text-sm text-muted">Approve, ban, or reset student devices</p>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input placeholder="Search students..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search className="w-4 h-4" />} />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'banned'] as const).map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    filterStatus === status ? 'bg-accent text-white' : 'bg-surface text-muted border border-border hover:border-accent/50'
                  }`}>
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Students Table */}
          <Card>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">No Students Found</h3>
                <p className="text-muted">No students match your current filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted">Student</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted">Device</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted">Joined</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-text">{student.name}</p>
                            <p className="text-sm text-muted">{student.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {student.is_banned ? (
                            <Badge variant="danger">Banned</Badge>
                          ) : student.is_approved ? (
                            <Badge variant="success">Approved</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {student.device_fingerprint ? (
                            <Badge variant="info" size="sm">Bound</Badge>
                          ) : (
                            <Badge variant=default" size="sm">Not Set</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {!student.is_approved && !student.is_banned && (
                              <Button size="sm" variant="outline"
                                isLoading={actionLoading === student.id}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                                onClick={() => handleApprove(student.id)}>
                                Approve
                              </Button>
                            )}
                            {!student.is_banned && (
                              <Button size="sm" variant=default"
                                isLoading={actionLoading === student.id}
                                leftIcon={<XCircle className="w-4 h-4" />}
                                onClick={() => handleBan(student.id)}>
                                Ban
                              </Button>
                            )}
                            {student.device_fingerprint && (
                              <Button size="sm" variant=default"
                                isLoading={actionLoading === student.id}
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                                onClick={() => handleResetDevice(student.id)}>
                                Reset Device
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
