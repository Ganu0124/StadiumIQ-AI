'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Sparkles, Brain, FileText, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const reportTemplates = [
    { id: 'daily', name: 'AI Daily Operations Summary', desc: 'Overview of gate throughput logs, security alerts, and crowd density indexes.' },
    { id: 'medical', name: 'AI Medical Incident Assessment', desc: 'Case summary counts, ambulance response timers, and patient status metrics.' },
    { id: 'parking', name: 'AI Parking & Traffic Analytics', desc: 'Space occupancy rates, EV charging statuses, and gridlock alerts.' },
  ];

  const handleGenerateReport = (id: string) => {
    setLoading(true);
    setTimeout(() => {
      if (id === 'daily') {
        setActiveReport(
          `# StadiumIQ AI - Operations Handover Summary\nDate: 2026-07-10\nEvent: Brazil vs Germany - Semi Final\n\n## 1. Executive Operations Summary\n- Total Attendance: 67,842 / 82,500 (82.2% Capacity)\n- Avg Wait Time: 8.5 minutes (decreased 2.3% vs previous hour)\n- Open Turnstile Gates: 14/16\n\n## 2. Logged Incidents & Resolutions\n- Crowd surge at Gate B1 resolved in 18 minutes by opening auxiliary corridor routes.\n- Medical heat stroke case in Section 214 currently under treatment at Medical Room A.\n- Unauthorized drone activity flagged near South perimeter airspace; operator located in P3 parking zone.`
        );
      } else if (id === 'medical') {
        setActiveReport(
          `# StadiumIQ AI - Medical Response Incident Log\nDate: 2026-07-10\n\n## 1. Diagnostics Stats\n- Total incidents: 7 cases\n- Critical emergencies: 1 case (VIP Lounge South Cardiac alert)\n- Average response dispatch speed: 3.4 minutes\n\n## 2. Ambulance Status\n- Medic-1: Stabilized heat stroke (MC-001) in Section 214.\n- Medic-2: Dispatched to trauma hospital with MC-003 food allergy patient.`
        );
      } else {
        setActiveReport(
          `# StadiumIQ AI - Parking & Transit Report\nDate: 2026-07-10\n\n## 1. Slot Capacities\n- Lot A (North): 96% capacity\n- Lot B (East): 100% (Full - traffic rerouted)\n- Overflow Lot F: 45% (Available for post-match departure lines)\n\n## 2. EV Charging Log\n- Total EV slots utilized: 120/180 chargers active.`
        );
      }
      setLoading(false);
    }, 1200);
  };

  const handleExportExcel = () => {
    // Generate an Excel sheet of templates or historical logs
    downloadCSV(reportTemplates, 'stadium_report_templates');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Daily Reports</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Generate operational handovers and diagnostic logs compiled by Google Gemini.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportExcel} className="text-xs font-bold">
          Export Excel Sheet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates left side */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Select Report Template
          </h3>
          {reportTemplates.map((tmpl) => (
            <Card
              key={tmpl.id}
              variant="glass"
              className="p-4 cursor-pointer hover:border-primary/20 transition-colors"
              onClick={() => handleGenerateReport(tmpl.id)}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-primary">{tmpl.name}</span>
                  <ChevronRight size={14} className="text-text-tertiary" />
                </div>
                <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">
                  {tmpl.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Preview Panel right side */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="h-full min-h-[400px] flex flex-col justify-between">
            {activeReport ? (
              <div className="space-y-5 flex-grow flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <FileText size={16} className="text-primary" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      Report Document Preview
                    </span>
                  </div>
                  <Badge variant="accent" size="sm">PDF Ready</Badge>
                </div>

                {/* Markdown text area */}
                <div className="flex-grow bg-glass/20 border border-border p-4 rounded-md overflow-y-auto max-h-[300px]">
                  <pre className="text-xs text-text-secondary leading-relaxed font-mono whitespace-pre-wrap">
                    {activeReport}
                  </pre>
                </div>

                <div className="flex gap-3 pt-3 border-t border-white/[0.04]">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs flex items-center justify-center gap-1.5"
                    onClick={() => alert('Downloading report pdf...')}
                  >
                    <Download size={14} /> Download PDF Document
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center">
                <Brain size={32} className="mx-auto text-text-tertiary mb-3 animate-pulse" />
                <p className="text-xs font-semibold text-text-secondary">No report generated</p>
                <p className="text-[10px] text-text-tertiary mt-1">
                  Select a template on the left side to compile with Gemini.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
