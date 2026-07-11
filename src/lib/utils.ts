import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatTime(minutes: number): string {
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // General statuses
    'open': 'text-success',
    'closed': 'text-danger',
    'active': 'text-success',
    'resolved': 'text-text-secondary',
    'in-progress': 'text-warning',
    'investigating': 'text-warning',
    'escalated': 'text-danger',
    // Risk levels
    'low': 'text-success',
    'moderate': 'text-warning',
    'medium': 'text-warning',
    'high': 'text-danger',
    'critical': 'text-danger',
    'elevated': 'text-warning',
    // Health
    'operational': 'text-success',
    'warning': 'text-warning',
    'offline': 'text-text-tertiary',
    // Parking
    'full': 'text-danger',
    'heavy': 'text-warning',
    'gridlock': 'text-danger',
    // Staff
    'available': 'text-success',
    'busy': 'text-warning',
    'break': 'text-info',
    'off-duty': 'text-text-tertiary',
    // Medical
    'waiting': 'text-warning',
    'treating': 'text-info',
    'stabilized': 'text-success',
    'transported': 'text-primary',
    'released': 'text-text-secondary',
  };
  return colors[status] || 'text-text-secondary';
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    'low': 'bg-success-muted',
    'moderate': 'bg-warning-muted',
    'medium': 'bg-warning-muted',
    'high': 'bg-danger-muted',
    'critical': 'bg-danger-muted',
    'open': 'bg-success-muted',
    'closed': 'bg-danger-muted',
    'in-progress': 'bg-warning-muted',
    'resolved': 'bg-glass',
    'operational': 'bg-success-muted',
    'warning': 'bg-warning-muted',
    'offline': 'bg-glass',
  };
  return colors[status] || 'bg-glass';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'low': '#10B981',
    'medium': '#F59E0B',
    'high': '#EF4444',
    'critical': '#DC2626',
  };
  return colors[priority] || '#8B95A8';
}

export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function generateSparkline(length: number = 12, base: number = 50, variance: number = 20): number[] {
  return Array.from({ length }, () => 
    Math.max(0, base + (Math.random() - 0.5) * 2 * variance)
  );
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => {
      const cellVal = val === null || val === undefined ? '' : String(val);
      return `"${cellVal.replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
