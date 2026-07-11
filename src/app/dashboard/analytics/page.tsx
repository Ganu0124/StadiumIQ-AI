'use client';

import React, { useState } from 'react';
import { Card, Tabs, Button, Badge } from '@/components/ui';
import { AreaChart } from '@/components/charts/AreaChart';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import {
  hourlyAttendance,
  incidentsByType,
  revenueByVendor,
} from '@/data/mock-data';
import { BarChart3, TrendingUp, DollarSign, ShieldAlert, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('attendance');

  const tabs = [
    { id: 'attendance', label: 'Attendance Flow', icon: <Users size={14} /> },
    { id: 'incidents', label: 'Incidents & Safety', icon: <ShieldAlert size={14} /> },
    { id: 'revenue', label: 'Vendor Revenue', icon: <DollarSign size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Analytics Dashboard</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Post-event summaries, logistics charts, and financial analytics.
          </p>
        </div>

        {/* Tab triggers */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Analytics Workspace */}
      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Entry Speed Area chart */}
            <Card variant="glass" className="lg:col-span-2">
              <div className="pb-4 border-b border-border mb-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Gate Entry Speed Timeline (Hour by Hour)
                </h3>
              </div>
              <AreaChart
                data={hourlyAttendance}
                dataKey="value"
                xAxisKey="name"
                color="#3B82F6"
                height={280}
              />
            </Card>

            {/* Quick Metrics details */}
            <Card variant="glass" className="space-y-4 h-full justify-between flex flex-col">
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
                  Attendance Indicators
                </h3>
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Peak Entry Rate</span>
                    <span className="font-mono font-bold text-text-primary">16,700 fans/hr</span>
                  </div>
                  <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Average Scan Speed</span>
                    <span className="font-mono font-bold text-text-primary">3.2 seconds</span>
                  </div>
                  <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Turnstile Malfunctions</span>
                    <span className="font-mono font-bold text-success">0 reported</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Incidents bar chart */}
            <Card variant="glass" className="lg:col-span-2">
              <div className="pb-4 border-b border-border mb-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Log counts grouped by Incident Category
                </h3>
              </div>
              <BarChart
                data={incidentsByType}
                dataKey="value"
                xAxisKey="name"
                colors={['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6']}
                height={280}
              />
            </Card>

            {/* Incident summaries */}
            <Card variant="glass" className="space-y-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
                Incident Response KPIs
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Avg Response Time</span>
                  <span className="font-mono font-bold text-text-primary">3.4 minutes</span>
                </div>
                <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Resolution Efficiency</span>
                  <span className="font-mono font-bold text-success">98.2%</span>
                </div>
                <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                  <span className="text-text-secondary">AI Dispatch Accuracy</span>
                  <span className="font-mono font-bold text-text-primary">94%</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue donut chart */}
            <Card variant="glass" className="lg:col-span-2">
              <div className="pb-4 border-b border-border mb-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Revenue Share Breakdown by Dining Vendor
                </h3>
              </div>
              <DonutChart data={revenueByVendor} height={280} />
            </Card>

            {/* Financial indicators */}
            <Card variant="glass" className="space-y-4">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-3">
                Concession Sales Indicators
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Total Match Revenue</span>
                  <span className="font-mono font-bold text-text-primary">$152,700</span>
                </div>
                <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Average Purchase Size</span>
                  <span className="font-mono font-bold text-text-primary">$22.40</span>
                </div>
                <div className="p-3 bg-glass border border-border rounded flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Transactions / Sec</span>
                  <span className="font-mono font-bold text-text-primary">18 tps</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
