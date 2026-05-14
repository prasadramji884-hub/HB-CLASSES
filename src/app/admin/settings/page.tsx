"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Shield, LogOut, Globe, Phone, MessageCircle, Instagram, ToggleLeft, ToggleRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

const sidebarItems = [
  { icon: Shield, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

interface AppSettings {
  institute_name: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_link: string;
  telegram_link: string;
  instagram_link: string;
  maintenance_mode: boolean;
  default_theme: 'dark' | 'light';
  admin_pin: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    institute_name: 'HB CLASSES',
    contact_email: '',
    contact_phone: '',
    whatsapp_link: '',
    telegram_link: '',
    instagram_link: '',
    maintenance_mode: false,
    default_theme: 'dark',
    admin_pin: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (data.settings) {
        const settingsMap: any = {};
        data.settings.forEach((s: any) => {
          settingsMap[s.key] = s.value;
        });

        setSettings(prev => ({
          ...prev,
          ...settingsMap,
          maintenance_mode: settingsMap.maintenance_mode === 'true',
        }));
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsArray }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'hb_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/auth/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading settings..." />
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
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
              <h1 className="font-syne text-2xl font-bold text-text">App Settings</h1>
              <p className="text-sm text-muted">Configure platform-wide settings</p>
            </div>
            <Button isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          <div className="space-y-6">
            {/* Institute Info */}
            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Institute Information
              </h3>
              <div className="space-y-4">
                <Input label="Institute Name" value={settings.institute_name}
                  onChange={(e) => setSettings({ ...settings, institute_name: e.target.value })} />
                <Input label="Contact Email" type="email" value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
                <Input label="Contact Phone" value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} />
              </div>
            </Card>

            {/* Social Links */}
            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-accent" />
                Social Links
              </h3>
              <div className="space-y-4">
                <Input label="WhatsApp Link" value={settings.whatsapp_link}
                  onChange={(e) => setSettings({ ...settings, whatsapp_link: e.target.value })} />
                <Input label="Telegram Link" value={settings.telegram_link}
                  onChange={(e) => setSettings({ ...settings, telegram_link: e.target.value })} />
                <Input label="Instagram Link" value={settings.instagram_link}
                  onChange={(e) => setSettings({ ...settings, instagram_link: e.target.value })} />
              </div>
            </Card>

            {/* App Config */}
            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent" />
                App Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-text">Maintenance Mode</p>
                    <p className="text-sm text-muted">Show maintenance page to all users</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                    className="text-accent hover:text-blue-400 transition-colors"
                  >
                    {settings.maintenance_mode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-text">Default Theme</p>
                    <p className="text-sm text-muted">Choose default theme for new users</p>
                  </div>
                  <select
                    value={settings.default_theme}
                    onChange={(e) => setSettings({ ...settings, default_theme: e.target.value as 'dark' | 'light' })}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-text"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card>
              <h3 className="font-syne text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Security
              </h3>
              <div className="space-y-4">
                <Input label="Admin PIN" type="password" value={settings.admin_pin}
                  onChange={(e) => setSettings({ ...settings, admin_pin: e.target.value })}
                  helperText="Leave empty to keep current PIN" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}