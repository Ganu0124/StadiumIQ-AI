'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { queuePredictions, crowdZones, aiInsights } from '@/data/mock-data';
import { BarChart } from '@/components/charts/BarChart';
import { AreaChart } from '@/components/charts/AreaChart';
import {
  Users, Users2, Clock, AlertTriangle, HelpCircle, Sparkles, Brain, ArrowRight
} from 'lucide-react';

export default function CrowdIntelligencePage() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [customRecommendation, setCustomRecommendation] = useState<string | null>(null);

  // Trigger Gemini/Mock Recommendation
  const handleGenerateAIRecommendation = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setCustomRecommendation(
        'Gemini analysis: Dynamic gate routing recommended. Redirect 15% of inbound flow from Gate B1 (18m wait) to Gate B2 (3m wait) via concourse routing signs. Estimated wait reduction: 6 minutes. Deploy 2 volunteer guide units at Concourse B split.'
      );
      setLoadingAI(false);
    }, 1500);
  };

  // Convert crowdZone list to charting points
  const zoneChartData = crowdZones.slice(0, 5).map(z => ({
    name: z.name,
    value: z.density,
    occupancy: z.currentOccupancy,
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Crowd Intelligence</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Predictive crowd dynamics, gate queue monitoring, and AI dispersal planning.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateAIRecommendation}
          loading={loadingAI}
          icon={<Sparkles size={14} />}
          className="shadow-glow"
        >
          Compute Flow Optimizations
        </Button>
      </div>

      {/* Dynamic Recommendation Panel */}
      {(customRecommendation || aiInsights.length > 0) && (
        <Card variant="glass" className="border border-primary/20 shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary-muted flex items-center justify-center text-primary mt-1 flex-shrink-0">
              <Brain size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Live Flow Advisory
                </h3>
                <Badge variant="accent" size="sm">Gemini AI</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {customRecommendation || aiInsights[0].content}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="text-[10px] !py-1 !px-3 rounded-md">
                  Broadcast Advisory to Screens
                </Button>
                <Button variant="secondary" size="sm" className="text-[10px] !py-1 !px-3 rounded-md">
                  Dispatch Field Guides
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grid: Occupancy Heat list & Queue predictions table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Stand Occupancy Heat / Gate predictions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Queue Predictions Table */}
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Gate Queue Predictions
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Current queue metrics and predicted wait times for the next 15-60 minutes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-tertiary font-bold">
                    <th className="py-2.5 px-2">Access Gate</th>
                    <th className="py-2.5 px-2 text-center">Current</th>
                    <th className="py-2.5 px-2 text-center">15m Exp</th>
                    <th className="py-2.5 px-2 text-center">30m Exp</th>
                    <th className="py-2.5 px-2 text-center">60m Exp</th>
                    <th className="py-2.5 px-2">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {queuePredictions.map((pred) => (
                    <tr key={pred.gateId} className="hover:bg-glass/5 transition-colors">
                      <td className="py-3 px-2 font-semibold text-text-primary">{pred.gateName}</td>
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={pred.currentWait > 15 ? 'text-danger font-bold' : pred.currentWait > 10 ? 'text-warning' : 'text-success'}>
                          {pred.currentWait}m
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-text-secondary font-mono">{pred.predicted15Min}m</td>
                      <td className="py-3 px-2 text-center text-text-secondary font-mono">{pred.predicted30Min}m</td>
                      <td className="py-3 px-2 text-center text-text-secondary font-mono">{pred.predicted60Min}m</td>
                      <td className="py-3 px-2 text-text-secondary text-[11px] max-w-xs truncate" title={pred.recommendation}>
                        {pred.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 2: Gate load bars */}
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Zone Density Load (%)
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Relative occupancy percentages for key sectors.
              </p>
            </div>
            <BarChart
              data={zoneChartData}
              dataKey="value"
              xAxisKey="name"
              colors={['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6']}
              height={200}
            />
          </Card>
        </div>

        {/* Right Side: Zone Density Inspector list */}
        <Card variant="glass" className="h-full flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Sector Density Logs
              </h3>
              <p className="text-[9px] text-text-tertiary mt-0.5">
                Live seat filling updates and threshold warnings.
              </p>
            </div>

            <div className="mt-4 space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {crowdZones.map((zone) => (
                <div key={zone.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{zone.name}</span>
                    <Badge
                      variant={zone.density > 90 ? 'danger' : zone.density > 75 ? 'warning' : 'success'}
                      size="sm"
                    >
                      {zone.density}% Occupied
                    </Badge>
                  </div>
                  <ProgressBar value={zone.density} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
