'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { activityFeed } from '@/data/mock-data';
import { getRelativeTime } from '@/lib/utils';
import {
  Brain, Heart, Shield, AlertTriangle, Wifi, Camera, CheckCircle, HelpCircle
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Brain, Heart, Shield, AlertTriangle, Wifi, Camera, CheckCircle
};

export function LiveActivityFeed() {
  return (
    <Card variant="glass" className="h-full flex flex-col min-h-[350px]">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Operations Activity Feed
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">
            Live Monitoring
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 max-h-[380px]">
        {activityFeed.map((item) => {
          const IconComponent = iconMap[item.icon] || HelpCircle;
          return (
            <div key={item.id} className="flex gap-3 text-xs leading-relaxed group transition-all duration-200 hover:bg-glass/10 p-1.5 rounded-md">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                <IconComponent size={12} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-[11px] font-semibold">{item.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-text-tertiary">
                    {getRelativeTime(item.timestamp)}
                  </span>
                  <span className="text-[9px] text-text-tertiary font-bold">•</span>
                  <span className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">
                    {item.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
