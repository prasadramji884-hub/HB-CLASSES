"use client";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Shield, BookOpen, Users, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="font-syne text-xl font-bold text-gradient">HB CLASSES</h1>
          <Link href="/auth/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="font-syne text-5xl md:text-6xl font-bold text-gradient mb-6">
            Master English
            <br />
            <span className="text-accent">Online Coaching</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            Premium online English coaching with live classes, recorded videos, and personalized progress tracking.
          </p>
          <Link href="/auth/login">
            <Button size="lg" leftIcon={<Play className="w-5 h-5" />}>
              Start Learning
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-syne text-xl font-bold text-text mb-2">Expert Courses</h3>
            <p className="text-muted">Structured curriculum designed by experienced English teachers</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-syne text-xl font-bold text-text mb-2">Live Classes</h3>
            <p className="text-muted">Interactive live sessions with real-time doubt solving</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="font-syne text-xl font-bold text-text mb-2">Protected Content</h3>
            <p className="text-muted">Your learning materials are secure with our DRM protection</p>
          </div>
        </div>
      </main>
    </div>
  );
}