'use client';

import React from 'react';
import { X, Check, Bell, AlertTriangle, Info, Shield, Heart, HelpCircle } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { AppNotification } from '@/types';
import { cn, getRelativeTime } from '@/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const moduleIconMap: Record<string, React.ReactNode> = {
  medical: <Heart size={16} className="text-danger" />,
  security: <Shield size={16} className="text-warning" />,
  crowd: <AlertTriangle size={16} className="text-primary" />,
  parking: <Info size={16} className="text-info" />,
  dashboard: <Bell size={16} className="text-success" />,
};

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md z-50 glass-strong border-l border-border flex flex-col shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            <h2 className="text-base font-bold text-text-primary">Operations Alerts</h2>
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="danger" size="sm">
                {notifications.filter(n => !n.read).length} New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <Check size={14} /> Clear All
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-[var(--radius-sm)] text-text-secondary hover:text-text-primary hover:bg-glass transition-colors cursor-pointer"
              aria-label="Close Alerts Panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-12 h-12 rounded-full bg-glass flex items-center justify-center text-text-tertiary mb-3">
                <Bell size={24} />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No Alerts Found</p>
              <p className="text-xs text-text-tertiary">All systems reporting normal status.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                variant="glass"
                padding="sm"
                className={cn(
                  'relative border-l-4 transition-all',
                  notification.read ? 'border-l-border' : 'border-l-primary bg-primary-muted/10',
                  notification.type === 'error' && !notification.read && 'border-l-danger bg-danger-muted/5',
                  notification.type === 'warning' && !notification.read && 'border-l-warning bg-warning-muted/5',
                  notification.type === 'success' && !notification.read && 'border-l-success bg-success-muted/5'
                )}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {moduleIconMap[notification.module || ''] || <HelpCircle size={16} className="text-text-tertiary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-text-tertiary font-semibold whitespace-nowrap">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-[10px] font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5"
                        >
                          Resolve Action &rarr;
                        </a>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="ml-auto text-[10px] font-medium text-text-tertiary hover:text-text-secondary flex items-center gap-0.5 cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
