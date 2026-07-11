'use client';

import React, { useState } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { LiveActivityFeed } from '@/components/dashboard/LiveActivityFeed';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { Card, Button, Badge } from '@/components/ui';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import {
  dashboardKPIs,
  attendanceTrend,
  gateUtilization,
  revenueByVendor,
  incidents,
} from '@/data/mock-data';
import {
  Users, ShieldAlert, Sparkles, Send, Shield, Zap, AlertTriangle, AlertCircle
} from 'lucide-react';
import { STADIUM_NAME, getCurrentMatch } from '@/lib/constants';
import { downloadCSV } from '@/lib/utils';

export default function ExecutiveDashboard() {
  const [activeKpi, setActiveKpi] = useState<string>('attendance');

  const executeAIRecommendation = (actionId: string) => {
    alert(`AI Recommendation Executed: ${actionId}. Dispatching commands to sector agents.`);
  };

  const handleExportAllData = () => {
    const aggregated = [
      ...incidents.map(i => ({ category: 'Incident', name: i.title, detail: i.description, metric: i.status, info: i.priority })),
      ...gateUtilization.map(g => ({ category: 'Gate', name: g.name, detail: 'Queue Load', metric: `${g.value}%`, info: `Throughput: ${g.throughput}` })),
      ...revenueByVendor.map(r => ({ category: 'Concession', name: r.name, detail: 'Revenue', metric: `$${r.value}`, info: 'Dining Outlets' }))
    ];
    downloadCSV(aggregated, 'stadium_master_operations_data');
  };

  // Quick Stats
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalCount = activeIncidents.filter(i => i.priority === 'critical').length;
  const highCount = activeIncidents.filter(i => i.priority === 'high').length;

  const currentMatch = getCurrentMatch();

  return (
    <div className="space-y-6">
      {/* Top Banner: Welcome / Match Overview */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-6 rounded-[var(--radius-xl)] bg-gradient-to-r from-surface-elevated to-surface/40 border border-border relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm" dot pulse={currentMatch.status === 'live'}>
              {currentMatch.status === 'live' ? 'Live Match Mode' : `${currentMatch.status} Match Mode`}
            </Badge>
            <span className="text-xs text-text-secondary">•</span>
            <span className="text-xs text-text-secondary font-semibold">{STADIUM_NAME}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">
            StadiumIQ AI Command Center
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Today's Match: <strong className="text-text-primary">{currentMatch.name}</strong> ({currentMatch.time} kickoff). Operational logistics console.
          </p>
        </div>

        {/* Live System Stats badge */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportAllData}
            className="text-xs font-bold bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary shadow-sm"
          >
            Export All Stadium Data
          </Button>

          <div className="flex items-center gap-2 bg-glass border border-border px-3.5 py-2 rounded-[var(--radius-md)] text-xs">
            <ShieldAlert size={16} className={criticalCount > 0 ? "text-danger animate-pulse" : "text-text-secondary"} />
            <div>
              <div className="font-bold text-text-primary">{criticalCount} Critical</div>
              <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">Active Emergencies</div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-glass border border-border px-3.5 py-2 rounded-[var(--radius-md)] text-xs">
            <AlertCircle size={16} className={highCount > 0 ? "text-warning animate-pulse" : "text-text-secondary"} />
            <div>
              <div className="font-bold text-text-primary">{highCount} High Priority</div>
              <div className="text-[9px] text-text-tertiary uppercase tracking-wider font-semibold">Security & Crowd</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {dashboardKPIs.slice(0, 8).map((kpi) => (
          <KPICard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            color={kpi.color}
            sparkline={kpi.sparkline}
            onClick={() => setActiveKpi(kpi.id)}
          />
        ))}
      </div>

      {/* Main Grid: Data Visualization & Live Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Visualizations) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Attendance Trends / Gate Throughput */}
          <Card variant="glass" className="flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Stadium Access Flow Analysis
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Real-time entry speed and throughput across major gate coordinates.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="text-xs">
                  Export PDF
                </Button>
                <Button variant="primary" size="sm" className="text-xs">
                  Optimize Access Flow
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <AreaChart
                data={attendanceTrend}
                dataKey="value"
                xAxisKey="timestamp"
                color="#3B82F6"
                height={260}
              />
            </div>
          </Card>

          {/* Chart 2: Gate Throughput Load & Concourse Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass">
              <div className="pb-4 border-b border-border mb-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Gate Load Capacity (%)
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Percentage of gate queue capacity currently utilized.
                </p>
              </div>
              <BarChart
                data={gateUtilization.slice(0, 6)}
                dataKey="value"
                xAxisKey="name"
                colors={['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6']}
                height={200}
              />
            </Card>

            <Card variant="glass">
              <div className="pb-4 border-b border-border mb-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Concourse Vendor Revenue Share
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Real-time sales distribution across dining outlets.
                </p>
              </div>
              <DonutChart data={revenueByVendor} height={200} />
            </Card>
          </div>
        </div>

        {/* Right Column: AI Co-Pilot & Activity Feed */}
        <div className="space-y-6">
          {/* AI Advisor Panel */}
          <AIInsightCard onActionExecute={executeAIRecommendation} />

          {/* Live System activity feed */}
          <LiveActivityFeed />
        </div>
      </div>
    </div>
  );
}
