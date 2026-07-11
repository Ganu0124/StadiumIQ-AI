'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { incidents as initialIncidents, staffMembers, equipmentList } from '@/data/mock-data';
import {
  Wrench, Users, Activity, HelpCircle, Heart, Shield, Sparkles, Brain, Clock, ShieldAlert, CheckCircle
} from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { Incident } from '@/types';

export default function OperationsCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(initialIncidents[0]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Status mapping colors
  const typeIconMap: Record<string, React.ReactNode> = {
    medical: <Heart size={14} className="text-danger" />,
    security: <Shield size={14} className="text-warning" />,
    crowd: <Users size={14} className="text-primary" />,
    maintenance: <Wrench size={14} className="text-info" />,
    technical: <Activity size={14} className="text-purple" />,
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(inc => (inc.id === id ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() } : inc))
    );
    if (selectedIncident?.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: 'resolved', resolvedAt: new Date().toISOString() } : null);
    }
  };

  // Re-generate AI summary
  const handleAIAnalyzeIncident = () => {
    setLoadingAI(true);
    setTimeout(() => {
      if (selectedIncident) {
        setSelectedIncident(prev => prev ? {
          ...prev,
          aiSummary: `AI Summary Update: High heat index in Section 214 combined with lack of ventilation in row corridors has compounded dehydration risks. Current throughput at nearby snack stands is slow, leading fans to delay getting liquids.`,
          aiRecommendation: `AI Recommendation: Dispatch paramedic mobile cart with active coolers to Section 214 corridor immediately. Open emergency backup cooling station in Concourse A. Broadcast hydration reminder via stadium scoreboard banner.`
        } : null);
      }
      setLoadingAI(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Operations Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time incident dispatch, crew logistics, and equipment diagnostics grid.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Incident List Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Operational Incidents
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Chronological incident queue from stadium sensor points.
                </p>
              </div>
              <Badge variant="warning" size="sm">
                {incidents.filter(i => i.status !== 'resolved').length} Active
              </Badge>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                    selectedIncident?.id === inc.id
                      ? 'bg-primary-muted/15 border-primary'
                      : 'bg-glass border-border hover:border-border-hover'
                  }`}
                >
                  <div className="flex gap-2.5 min-w-0">
                    <div className="mt-0.5">
                      {typeIconMap[inc.type] || <HelpCircle size={14} className="text-text-tertiary" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-text-primary truncate">{inc.title}</span>
                        <Badge variant={inc.priority === 'critical' ? 'danger' : inc.priority === 'high' ? 'warning' : 'default'} size="sm">
                          {inc.priority}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">{inc.location}</p>
                      <p className="text-[10px] text-text-tertiary mt-1">Reported: {getRelativeTime(inc.reportedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inc.status === 'resolved' ? (
                      <Badge variant="success" size="sm">Resolved</Badge>
                    ) : (
                      <Badge variant="info" size="sm">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 2: Equipment Status Diagnostic matrix */}
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Equipment Diagnostics Matrix
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Physical sensor health and battery indexes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {equipmentList.slice(0, 6).map((eq) => (
                <div key={eq.id} className="p-3 bg-glass border border-border rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary truncate" title={eq.name}>{eq.name}</span>
                    <Badge variant={eq.status === 'operational' ? 'success' : 'warning'} size="sm">
                      {eq.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-text-secondary">
                      <span>Health Index</span>
                      <span>{eq.healthScore}%</span>
                    </div>
                    <ProgressBar value={eq.healthScore} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Incident Inspector with AI Copilot Advice */}
        <div className="space-y-6">
          <Card variant="glass" className="h-full flex flex-col justify-between">
            {selectedIncident ? (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-primary" />
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Incident Dispatcher
                    </h3>
                  </div>
                  <Badge variant="accent" size="sm">{selectedIncident.id}</Badge>
                </div>

                {/* Details */}
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{selectedIncident.title}</h4>
                  <p className="text-[11px] text-text-secondary mt-1">{selectedIncident.description}</p>
                </div>

                {/* AI Summary / Action SOP */}
                {selectedIncident.aiSummary && (
                  <div className="p-3 bg-primary-muted/10 border border-primary/20 rounded-md space-y-2">
                    <div className="flex items-center gap-1">
                      <Brain size={14} className="text-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Gemini Decision Support</span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                      {selectedIncident.aiSummary}
                    </p>
                    {selectedIncident.aiRecommendation && (
                      <div className="mt-2 pt-2 border-t border-primary/10">
                        <span className="text-[9px] font-bold text-accent block uppercase">Action Plan:</span>
                        <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">
                          {selectedIncident.aiRecommendation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Panel */}
                <div className="pt-4 border-t border-white/[0.04] space-y-2">
                  {!selectedIncident.aiSummary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleAIAnalyzeIncident}
                      loading={loadingAI}
                    >
                      Analyze with AI Co-Pilot
                    </Button>
                  )}
                  {selectedIncident.status !== 'resolved' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleResolveIncident(selectedIncident.id)}
                    >
                      Resolve Incident
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-2 bg-success-muted rounded-md text-success text-xs font-bold">
                      <CheckCircle size={14} /> Resolved
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Brain size={32} className="mx-auto text-text-tertiary mb-3" />
                <p className="text-xs font-semibold text-text-secondary">Select an active incident</p>
                <p className="text-[10px] text-text-tertiary mt-1">
                  Inspect sensor logs or trigger AI resolution playbooks.
                </p>
              </div>
            )}
          </Card>

          {/* Staff availability panel */}
          <Card variant="glass">
            <div className="pb-3 border-b border-border mb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Staff On Duty Status
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {staffMembers.slice(0, 5).map((staff) => (
                <div key={staff.id} className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-text-primary">{staff.name}</p>
                    <p className="text-[9px] text-text-tertiary">{staff.role}</p>
                  </div>
                  <Badge variant={staff.status === 'available' ? 'success' : 'warning'} size="sm">
                    {staff.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
