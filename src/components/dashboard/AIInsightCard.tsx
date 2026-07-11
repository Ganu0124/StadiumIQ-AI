'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { aiInsights } from '@/data/mock-data';
import { Brain, Zap } from 'lucide-react';

interface AIInsightCardProps {
  onActionExecute?: (actionId: string) => void;
}

export function AIInsightCard({ onActionExecute }: AIInsightCardProps) {
  return (
    <Card variant="glass" className="h-full flex flex-col border border-primary/20 shadow-glow min-h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-muted flex items-center justify-center text-primary">
            <Brain size={14} className="animate-pulse" />
          </div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Gemini Operations Co-Pilot
          </h3>
        </div>
        <Badge variant="accent" size="sm" dot pulse>
          Engine Active
        </Badge>
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 max-h-[380px]">
        {aiInsights.map((insight) => (
          <div
            key={insight.id}
            className="p-3.5 rounded-[var(--radius-md)] bg-glass border border-border/40 hover:border-primary/25 transition-colors relative"
          >
            {/* Top row: Category & confidence */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-accent">
                {insight.category}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-text-tertiary">Confidence:</span>
                <span className="text-[10px] font-bold text-success">{insight.confidence}%</span>
              </div>
            </div>

            {/* Title & description */}
            <h4 className="text-xs font-bold text-text-primary mb-1">
              {insight.title}
            </h4>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
              {insight.content}
            </p>

            {/* Recommendations / Actions */}
            {insight.actionable && insight.actions && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.03]">
                {insight.actions.map((act) => (
                  <Button
                    key={act.id}
                    variant={act.type === 'primary' ? 'primary' : 'secondary'}
                    size="sm"
                    className="!py-1 !px-2.5 text-[10px] rounded-md flex items-center gap-1"
                    onClick={() => onActionExecute?.(act.action)}
                  >
                    <Zap size={8} />
                    {act.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
