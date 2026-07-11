'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { securityAlerts, threatLevel } from '@/data/mock-data';
import {
  Shield, Eye, ShieldAlert, AlertTriangle, Sparkles, Brain, Radio, Video, Lock, CheckCircle
} from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { SecurityAlert } from '@/types';

export default function SecurityCenterPage() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>(securityAlerts);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(securityAlerts[0]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleResolveAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'resolved' } : a))
    );
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
  };

  const handleGenerateAISOP = () => {
    setLoadingAI(true);
    setTimeout(() => {
      if (selectedAlert) {
        setSelectedAlert(prev => prev ? {
          ...prev,
          aiAssessment: `Gemini Threat Assessment: CCTV feed shows operator in Parking Lot P3 controlling drone without official clearance. Drone is crossing stadium perimeter line. Required Action Plan: 1. Deploy security vehicle team to P3 Lot immediately. 2. Lock down VIP gate entries. 3. Active RF jamming counters if drone approaches within 50m of pitch height.`
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
          <h2 className="text-xl font-black text-text-primary tracking-tight">Security Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Perimeter threat levels, automated CCTV monitoring logs, and access warning gates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: CCTV Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Live Surveillance Alerts
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  AI-filtered sensor warnings from perimeter fences and ticket checkpoints.
                </p>
              </div>
              <Badge variant="danger" size="sm">
                {alerts.filter(a => a.status === 'active' || a.status === 'investigating').length} Active Warning(s)
              </Badge>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {alerts.map((alertItem) => (
                <div
                  key={alertItem.id}
                  onClick={() => setSelectedAlert(alertItem)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                    selectedAlert?.id === alertItem.id
                      ? 'bg-primary-muted/15 border-primary'
                      : 'bg-glass border-border hover:border-border-hover'
                  }`}
                >
                  <div className="flex gap-2.5 min-w-0">
                    <div className="mt-0.5 text-text-secondary">
                      <Video size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-text-primary truncate">{alertItem.description}</span>
                        <Badge variant={alertItem.severity === 'critical' || alertItem.severity === 'high' ? 'danger' : 'warning'} size="sm">
                          {alertItem.severity}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">{alertItem.location}</p>
                      <p className="text-[10px] text-text-tertiary mt-1">Logged: {getRelativeTime(alertItem.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alertItem.status === 'resolved' ? (
                      <Badge variant="success" size="sm">Cleared</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Investigating</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* CCTV Feed Simulations */}
          <div className="grid grid-cols-2 gap-4">
            <Card variant="glass" className="relative overflow-hidden aspect-video border border-white/[0.04]">
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Radio size={24} className="mx-auto text-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-text-secondary block">FEED A1 - NORTH PERIMETER</span>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" /> LIVE
              </div>
            </Card>

            <Card variant="glass" className="relative overflow-hidden aspect-video border border-white/[0.04]">
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Radio size={24} className="mx-auto text-danger animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-danger block">FEED B1 - DRONE TRACKING</span>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-danger flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-ping" /> EVENT
              </div>
            </Card>
          </div>
        </div>

        {/* Right Side: Risk Assessment Panel */}
        <div className="space-y-6">
          {/* Threat Score Card */}
          <Card variant="glass" className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Perimeter Threat Meter
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-text-primary font-mono">{threatLevel.score}%</span>
                <Badge variant={threatLevel.overall === 'critical' || threatLevel.overall === 'high' ? 'danger' : 'warning'} size="sm">
                  {threatLevel.overall} Risk
                </Badge>
              </div>

              <ProgressBar value={threatLevel.score} color="#F59E0B" />

              <div className="pt-3 space-y-1.5">
                <span className="text-[9px] font-bold text-text-tertiary uppercase block">Contributing Factors:</span>
                {threatLevel.factors.map((f, idx) => (
                  <div key={idx} className="text-[10px] text-text-secondary flex items-start gap-1">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Guard Action Panel */}
          <Card variant="glass" className="h-full flex flex-col justify-between">
            {selectedAlert ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-primary" />
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Threat Inspector
                    </h3>
                  </div>
                  <Badge variant="accent" size="sm">{selectedAlert.id}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text-primary">{selectedAlert.description}</h4>
                  <p className="text-[10px] text-text-secondary mt-1">Location: {selectedAlert.location}</p>
                </div>

                {selectedAlert.aiAssessment && (
                  <div className="p-3 bg-primary-muted/10 border border-primary/20 rounded-md space-y-2">
                    <div className="flex items-center gap-1">
                      <Brain size={14} className="text-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Gemini Threat Solver</span>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                      {selectedAlert.aiAssessment}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/[0.04] space-y-2">
                  {!selectedAlert.aiAssessment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleGenerateAISOP}
                      loading={loadingAI}
                    >
                      Assess with Gemini Co-Pilot
                    </Button>
                  )}
                  {selectedAlert.status !== 'resolved' ? (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleResolveAlert(selectedAlert.id)}
                    >
                      Clear Threat Alert
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-2 bg-success-muted rounded-md text-success text-xs font-bold">
                      <CheckCircle size={14} /> Threat Cleared
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Brain size={32} className="mx-auto text-text-tertiary mb-3" />
                <p className="text-xs font-semibold text-text-secondary">Select a surveillance alert</p>
                <p className="text-[10px] text-text-tertiary mt-1">
                  Inspect sensor streams or call AI SOP scripts.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
