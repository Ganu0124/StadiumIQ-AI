'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { NotificationPanel } from '@/components/layout/NotificationPanel';
import { AppNotification } from '@/types';
import { notifications as initialNotifications } from '@/data/mock-data';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground gradient-mesh font-sans antialiased overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content wrapper */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[260px]'
        )}
      >
        {/* Topbar Operations Head */}
        <Topbar
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenNotifications={() => setIsAlertsOpen(true)}
          unreadNotifications={unreadCount}
        />

        {/* Content body space */}
        <main className="flex-grow p-6 md:p-8 animate-fade-in relative z-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Slide-out notifications desk */}
      <NotificationPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
