'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { aiInsights as initialInsights } from '@/data/mock-data';
import { Brain, Sparkles, CheckCircle2, AlertTriangle, Shield, Compass, Zap } from 'lucide-react';
import { AIInsight } from '@/types';

export default function AIRecommendationsPage() {
  const [insights, setInsights] = useState<AIInsight[]>(initialInsights);
  const [loading, setLoading] = useState(false);

  const handleComputeNewRecommendation = () => {
    setLoading(true);
    setTimeout(() => {
      const newInsight: AIInsight = {
        id: `ai-${Date.now()}`,
        type: 'recommendation',
        title: 'Optimize VIP North corridor shuttle transit',
        content: 'Voltage readings suggest local grid load around Electric Box V4 is high due to concurrent charging of 8 EV shuttle vans. Recommended action: Direct 4 shuttles to secondary charging lot F. Swap schedules to avoid load spikes.',
        confidence: 94,
        priority: 'medium',
        category: 'Power & Grid Logistics',
        createdAt: new Date().toISOString(),
        actionable: true,
        actions: [
          { id: `act-1-${Date.now()}`, label: 'Redirect EV Shuttles', type: 'primary', action: 'redirect-ev-shuttles' }
        ]
      };
      setInsights(prev => [newInsight, ...prev]);
      setLoading(false);
    }, 1200);
  };

  const handleExecuteAction = (actionLabel: string) => {
    alert(`Executing action: ${actionLabel}. Dispatch signals routed to terminal nodes.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">AI Recommendations</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Gemini Decision Support Console generating operational insights and action plans.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleComputeNewRecommendation}
          loading={loading}
          icon={<Sparkles size={14} />}
          className="shadow-glow"
        >
          Compute Grid Logistics
        </Button>
      </div>

      {/* Grid of advisory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            variant="glass"
            className="border border-primary/20 shadow-glow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              {/* Header category info */}
              <div className="flex justify-between items-center">
                <Badge variant={insight.priority === 'high' ? 'danger' : 'info'} size="sm">
                  {insight.category}
                </Badge>
                <div className="text-[10px] font-bold text-success">
                  Confidence Index: {insight.confidence}%
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-text-primary mt-1">
                {insight.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {insight.content}
              </p>
            </div>

            {/* Actions button */}
            {insight.actionable && insight.actions && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.04] relative z-10">
                {insight.actions.map((act) => (
                  <Button
                    key={act.id}
                    variant={act.type === 'primary' ? 'primary' : 'secondary'}
                    size="sm"
                    className="text-[10px] !py-1 !px-3 rounded"
                    onClick={() => handleExecuteAction(act.label)}
                  >
                    <Zap size={10} />
                    {act.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
