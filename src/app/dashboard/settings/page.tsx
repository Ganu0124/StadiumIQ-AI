'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Sliders, Sparkles, Brain, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export default function SettingsPage() {
  const [modelName, setModelName] = useState('Gemini 1.5 Pro');
  const [activeAlerts, setActiveAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('System configurations stored on control node.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">System Settings</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage operational triggers, model routing networks, and API keys.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core settings form left */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Orchestration Configs
              </h3>
            </div>

            {/* AI Model name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">
                Assisted Intelligence Engine
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-[#0D1425] text-xs p-3 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none text-text-primary"
              >
                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Recommended)</option>
                <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Latency Optimized)</option>
                <option value="Gemini 1.0 Pro">Gemini 1.0 Pro (Legacy)</option>
              </select>
            </div>

            {/* Threshold sliders */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold block">
                Crowd Density Warning Threshold (%)
              </label>
              <input
                type="range"
                min="50"
                max="100"
                defaultValue="85"
                className="w-full h-1 bg-glass rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary">
                <span>50%</span>
                <span>85% Warning</span>
                <span>100%</span>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex justify-between items-center p-3 bg-glass border border-border rounded-md">
              <div>
                <span className="text-xs font-bold text-text-primary block">Active Risk Alarms</span>
                <span className="text-[10px] text-text-secondary">Push live advisories to terminal nodes when risk indexes shift.</span>
              </div>
              <button onClick={() => setActiveAlerts(!activeAlerts)} className="cursor-pointer">
                {activeAlerts ? (
                  <ToggleRight className="text-primary" size={28} />
                ) : (
                  <ToggleLeft className="text-text-tertiary" size={28} />
                )}
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full mt-4"
              onClick={handleSaveSettings}
              loading={saving}
              icon={<Save size={14} />}
            >
              Commit Settings
            </Button>
          </Card>
        </div>

        {/* Engine status indicators right */}
        <Card variant="glass" className="h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Connection Health
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Gemini API status</span>
                <Badge variant="success" size="sm">Online</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Sensor Grid API</span>
                <Badge variant="success" size="sm">Active (99.8%)</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Scoreboard terminal</span>
                <Badge variant="success" size="sm">Connected</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Firebase Authentication</span>
                <Badge variant="info" size="sm">Secured</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
