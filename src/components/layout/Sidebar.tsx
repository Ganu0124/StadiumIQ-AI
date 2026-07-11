'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import {
  LayoutDashboard, Map, Users, Settings, Shield, Heart, Car,
  UtensilsCrossed, MessageCircle, Megaphone, BarChart3,
  ChevronLeft, ChevronRight, Zap, LogOut, User, ShieldAlert, Brain, FileText, Sliders
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Map: <Map size={20} />,
  Users: <Users size={20} />,
  Settings: <Settings size={20} />,
  ShieldAlert: <ShieldAlert size={20} />,
  Shield: <Shield size={20} />,
  Heart: <Heart size={20} />,
  Car: <Car size={20} />,
  UtensilsCrossed: <UtensilsCrossed size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  Megaphone: <Megaphone size={20} />,
  Brain: <Brain size={20} />,
  BarChart3: <BarChart3 size={20} />,
  FileText: <FileText size={20} />,
  Sliders: <Sliders size={20} />,
  User: <User size={20} />,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Filter navigation items by role (default to fan if not logged in)
  const userRole = role || 'fan';
  const filteredNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out',
        'bg-surface/80 backdrop-blur-xl border-r border-border',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-glow group-hover:shadow-glow-accent transition-shadow">
            <Zap size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold text-text-primary tracking-tight">{APP_NAME}</h1>
              <p className="text-[10px] text-text-tertiary font-medium">FIFA World Cup 2026™</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-widest text-text-tertiary font-semibold px-3 mb-3">
            Navigation
          </p>
        )}
        {filteredNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] transition-all duration-200 group relative',
                active
                  ? 'bg-primary/15 text-primary font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <span className="flex-shrink-0">{iconMap[item.icon]}</span>
              {!collapsed && (
                <span className="text-xs font-semibold truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-border p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{user?.displayName || 'Guest User'}</p>
              <p className="text-[9px] text-text-tertiary capitalize">{userRole}</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="text-text-tertiary hover:text-danger transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-elevated border border-border rounded-full flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-border-hover transition-all shadow-md cursor-pointer z-50"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
