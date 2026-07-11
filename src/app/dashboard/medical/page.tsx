'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { medicalCases, ambulances } from '@/data/mock-data';
import { Heart, Activity, AlertTriangle, Sparkles, Brain, Ambulance, Stethoscope, CheckSquare } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { MedicalCase } from '@/types';

export default function MedicalResponsePage() {
  const [cases, setCases] = useState<MedicalCase[]>(medicalCases);
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(medicalCases[0]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiChecklist, setAiChecklist] = useState<string | null>(null);

  const handleResolveCase = (id: string) => {
    setCases(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'released' } : c))
    );
    if (selectedCase?.id === id) {
      setSelectedCase(prev => prev ? { ...prev, status: 'released' } : null);
    }
  };

  const handleGenerateChecklist = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setAiChecklist(
        `Gemini Triage Protocol Checklist:\n1. Check airway clearance & breathing metrics.\n2. Apply ice packs to groin, armpits, and neck to counteract Heat Stroke (temp 39.5°C).\n3. Administer oral hydration solution slowly if conscious.\n4. Call emergency vehicle dispatch (Medic-1 cart) for concourse extraction.\n5. Pre-alert nearby local hospital trauma ward.`
      );
      setLoadingAI(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Medical Response</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Active medical incidents, mobile paramedic dispatch tracking, and triage checklists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Medical Cases list */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Active Emergency Cases
                </h3>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Triage queue from stadium medical rooms and volunteer reports.
                </p>
              </div>
              <Badge variant="danger" size="sm">
                {cases.filter(c => c.status !== 'released').length} Active Cases
              </Badge>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => {
                    setSelectedCase(caseItem);
                    setAiChecklist(null);
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                    selectedCase?.id === caseItem.id
                      ? 'bg-primary-muted/15 border-primary'
                      : 'bg-glass border-border hover:border-border-hover'
                  }`}
                >
                  <div className="flex gap-2.5 min-w-0">
                    <div className="mt-0.5 text-danger">
                      <Heart size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-text-primary truncate">{caseItem.description}</span>
                        <Badge variant={caseItem.severity === 'critical' ? 'danger' : caseItem.severity === 'severe' ? 'warning' : 'info'} size="sm">
                          {caseItem.severity}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-text-secondary mt-1">{caseItem.location}</p>
                      <p className="text-[10px] text-text-tertiary mt-1">Logged: {getRelativeTime(caseItem.reportedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">{caseItem.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Ambulance Dispatch Tracking */}
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Ambulance Dispatch Tracker
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Real-time transit states of vehicle assets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ambulances.map((amb) => (
                <div key={amb.id} className="p-3 bg-glass border border-border rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-primary-muted text-primary">
                      <Ambulance size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{amb.callSign}</p>
                      <p className="text-[9px] text-text-secondary">{amb.location}</p>
                    </div>
                  </div>
                  <Badge variant={amb.status === 'available' ? 'success' : 'warning'} size="sm">
                    {amb.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Case Triage Inspector */}
        <div className="space-y-6">
          <Card variant="glass" className="h-full flex flex-col justify-between">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope size={14} className="text-primary" />
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Triage Inspector
                    </h3>
                  </div>
                  <Badge variant="accent" size="sm">{selectedCase.id}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-text-primary">{selectedCase.description}</h4>
                  <p className="text-[10px] text-text-secondary mt-1">Location: {selectedCase.location}</p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">Assigned medic: {selectedCase.assignedMedic || 'Unassigned'}</p>
                </div>

                {/* AI generated SOP checklist */}
                {aiChecklist && (
                  <div className="p-3 bg-primary-muted/10 border border-primary/20 rounded-md space-y-2">
                    <div className="flex items-center gap-1">
                      <Brain size={14} className="text-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Gemini First Aid SOP</span>
                    </div>
                    <pre className="text-[10px] text-text-secondary leading-relaxed font-sans whitespace-pre-wrap">
                      {aiChecklist}
                    </pre>
                  </div>
                )}

                <div className="pt-4 border-t border-white/[0.04] space-y-2">
                  {!aiChecklist && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={handleGenerateChecklist}
                      loading={loadingAI}
                    >
                      Generate AI Checklist
                    </Button>
                  )}
                  {selectedCase.status !== 'released' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleResolveCase(selectedCase.id)}
                    >
                      Discharge Case
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <Brain size={32} className="mx-auto text-text-tertiary mb-3" />
                <p className="text-xs font-semibold text-text-secondary">Select an emergency case</p>
                <p className="text-[10px] text-text-tertiary mt-1">
                  Inspect diagnostic status or trigger AI SOP check sheets.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
