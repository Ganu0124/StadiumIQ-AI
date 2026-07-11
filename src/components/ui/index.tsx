'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ========================================
// Button
// ========================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children, variant = 'primary', size = 'md', loading, icon, className, disabled, ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-md hover:shadow-lg',
    secondary: 'bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border',
    ghost: 'bg-transparent hover:bg-glass-hover text-text-secondary hover:text-text-primary',
    danger: 'bg-danger hover:bg-red-600 text-white shadow-md',
    accent: 'bg-accent hover:bg-accent-hover text-text-inverse shadow-md',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary-muted',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant], sizes[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
      ) : icon ? <span className="flex-shrink-0">{icon}</span> : null}
      {children}
    </button>
  );
}

// ========================================
// Card
// ========================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  children, variant = 'glass', padding = 'md', hover = false, className, ...props
}: CardProps) {
  const variants = {
    default: 'bg-surface',
    glass: 'glass-card',
    bordered: 'bg-surface border border-border',
    elevated: 'bg-surface-elevated shadow-lg',
  };
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)]',
        variants[variant],
        paddings[padding],
        hover && 'hover:border-border-hover hover:shadow-lg cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ========================================
// Badge
// ========================================

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  children, variant = 'default', size = 'sm', dot, pulse, className, ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-glass text-text-secondary border-border',
    success: 'bg-success-muted text-success border-success/20',
    warning: 'bg-warning-muted text-warning border-warning/20',
    danger: 'bg-danger-muted text-danger border-danger/20',
    info: 'bg-info-muted text-info border-info/20',
    accent: 'bg-accent-muted text-accent border-accent/20',
  };
  const sizes = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}

// ========================================
// Skeleton
// ========================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'rectangular', width, height }: SkeletonProps) {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{ width, height }}
    />
  );
}

// ========================================
// Progress Bar
// ========================================

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({ value, max = 100, color, showLabel, size = 'md', className }: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };
  const barColor = color || (pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981');

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-text-secondary">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-glass rounded-full overflow-hidden', heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// ========================================
// Empty State
// ========================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="text-text-tertiary mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ========================================
// Tabs
// ========================================

interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; badge?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-glass rounded-[var(--radius-lg)] overflow-x-auto', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-all whitespace-nowrap cursor-pointer',
            activeTab === tab.id
              ? 'bg-primary text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ========================================
// Modal
// ========================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={cn(
          'relative w-full glass-strong rounded-[var(--radius-xl)] shadow-xl animate-scale-in',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ========================================
// Tooltip
// ========================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group/tooltip inline-flex">
      {children}
      <div className={cn(
        'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-text-primary bg-surface-elevated rounded-[var(--radius-sm)] shadow-lg border border-border opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap',
        positions[position]
      )}>
        {content}
      </div>
    </div>
  );
}
