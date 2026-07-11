'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import {
  Users, Building2, Activity, Clock, DoorOpen, Car, Heart,
  Shield, UtensilsCrossed, Sun, Brain, UserCheck, TrendingUp, TrendingDown
} from 'lucide-react';

const icons: Record<string, React.ElementType> = {
  Users, Building2, Activity, Clock, DoorOpen, Car, Heart,
  Shield, UtensilsCrossed, Sun, Brain, UserCheck
};

interface KPICardProps {
  label: string;
  value: number;
  unit?: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  sparkline?: number[];
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  unit = '',
  change,
  changeType,
  icon,
  color,
  sparkline,
  onClick,
}: KPICardProps) {
  const IconComponent = icons[icon] || Activity;

  // Simple mini SVG generator for sparkline
  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;
    const width = 80;
    const height = 28;
    const maxVal = Math.max(...sparkline);
    const minVal = Math.min(...sparkline);
    const range = maxVal - minVal || 1;

    const points = sparkline
      .map((val, index) => {
        const x = (index / (sparkline.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="flex-shrink-0 opacity-70">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <Card
      variant="glass"
      className={cn(
        'relative overflow-hidden cursor-pointer hover:border-primary/20 transition-all flex flex-col justify-between h-full min-h-[120px]',
        onClick && 'active:scale-98'
      )}
      onClick={onClick}
    >
      {/* Decorative Glow accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] blur-xl pointer-events-none"
        style={{ background: color }}
      />

      {/* Title & Icon Header */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase truncate">
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, color }}
        >
          <IconComponent size={15} />
        </div>
      </div>

      {/* Main Value and unit */}
      <div className="flex items-end justify-between mt-3 gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
            {formatNumber(value)}
          </span>
          {unit && <span className="text-xs font-medium text-text-secondary">{unit}</span>}
        </div>

        {/* Sparkline trend representation */}
        {renderSparkline()}
      </div>

      {/* Footer metadata: trend indicator */}
      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/[0.03] text-[10px] font-semibold">
        {changeType === 'increase' && (
          <span className="text-success flex items-center gap-0.5">
            <TrendingUp size={10} /> +{change}%
          </span>
        )}
        {changeType === 'decrease' && (
          <span className="text-danger flex items-center gap-0.5">
            <TrendingDown size={10} /> {change}%
          </span>
        )}
        {changeType === 'neutral' && (
          <span className="text-text-tertiary">Stable</span>
        )}
        <span className="text-text-tertiary font-normal">vs 30m ago</span>
      </div>
    </Card>
  );
}
