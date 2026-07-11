'use client';

import React, { useState } from 'react';
import { Bell, Search, Menu, Brain, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { getCurrentMatch } from '@/lib/constants';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  unreadNotifications: number;
}

export function Topbar({ onToggleSidebar, onOpenNotifications, unreadNotifications }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState('');

  React.useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentMatch = getCurrentMatch();

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass border-b border-border flex items-center justify-between px-6 backdrop-blur-xl">
      {/* Left side: Search & Sidebar Toggle for mobile */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Live Match Info Header */}
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <span className={`inline-block w-2 h-2 rounded-full ${currentMatch.status === 'live' ? 'bg-accent animate-pulse-glow' : 'bg-text-tertiary'}`} />
            <span className="uppercase tracking-wider">
              {currentMatch.status === 'live' ? 'LIVE OPERATION CENTER' : `${currentMatch.status} MATCH DESK`}
            </span>
          </div>
          <div className="text-sm font-bold text-text-primary">
            {currentMatch.name}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Search operations, staff, gates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-glass text-sm pl-10 pr-4 py-2 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none transition-all placeholder:text-text-tertiary"
          />
        </div>
      </div>

      {/* Right side: Operations Time, AI Status, Notifications */}
      <div className="flex items-center gap-3">
        {/* Operations Clock */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-[var(--radius-md)] bg-glass border border-border">
          <Clock size={16} className="text-primary" />
          <div className="text-right">
            <div className="text-xs font-bold font-mono text-text-primary">{time}</div>
            <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">Local Time</div>
          </div>
        </div>

        {/* AI Engine Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-primary-muted border border-primary/20">
          <Brain size={16} className="text-primary animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-bold text-primary">Gemini 1.5 Pro</div>
            <div className="text-[9px] text-text-secondary uppercase tracking-wider font-semibold">Engine Connected</div>
          </div>
        </div>

        {/* Notification Icon */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNotifications}
            className="relative h-10 w-10 !p-0 rounded-full flex items-center justify-center cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-text-secondary hover:text-text-primary" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-md animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
