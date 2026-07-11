'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { announcements as initialAnnouncements } from '@/data/mock-data';
import { Megaphone, Sparkles, Brain, Clock, Globe, PlusCircle, Check } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [scenarioInput, setScenarioInput] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['en', 'es']);
  const [loadingAI, setLoadingAI] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<Record<string, string> | null>(null);

  const langOptions = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'pt', label: 'Portuguese' },
  ];

  const handleToggleLang = (code: string) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleGenerateAIAnnouncement = () => {
    if (!scenarioInput.trim()) return;
    setLoadingAI(true);
    setTimeout(() => {
      const drafts: Record<string, string> = {};
      
      if (selectedLangs.includes('en')) {
        drafts.en = `Operations Advisory: ${scenarioInput}. Access teams are routing traffic. Please cooperate with guides on site.`;
      }
      if (selectedLangs.includes('es')) {
        drafts.es = `Aviso de Operaciones: ${scenarioInput}. Los equipos de acceso están desviando el tráfico. Por favor colabore con el personal.`;
      }
      if (selectedLangs.includes('fr')) {
        drafts.fr = `Avis d'opérations: ${scenarioInput}. Les équipes d'accès guident le trafic. Veuillez coopérer avec les guides sur place.`;
      }
      if (selectedLangs.includes('pt')) {
        drafts.pt = `Aviso de Operações: ${scenarioInput}. Equipes de acesso estão direcionando o tráfego. Colabore com os orientadores.`;
      }

      setGeneratedDraft(drafts);
      setLoadingAI(false);
    }, 1200);
  };

  const handlePublishAnnouncement = () => {
    if (!generatedDraft) return;
    const firstLang = Object.keys(generatedDraft)[0];
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: 'Operations Bulletin',
      message: generatedDraft[firstLang],
      type: 'info',
      language: firstLang,
      translations: generatedDraft,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      status: 'published',
      generatedByAI: true,
    };

    setAnnouncements(prev => [newAnn, ...prev]);
    setGeneratedDraft(null);
    setScenarioInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Announcement Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            PA broadcast editor, scoreboard text scheduler, and multilingual AI translation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Creation Box */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Generate Scoreboard Announcement
              </h3>
            </div>

            {/* Scenario Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold">
                Incident Scenario / Update context
              </label>
              <textarea
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder="e.g. Heavy congestion near Gate 4. Parking P2 is full."
                rows={3}
                className="w-full bg-glass text-xs p-3 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none placeholder:text-text-tertiary"
              />
            </div>

            {/* Languages Check list */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-text-secondary font-bold block">
                Target Broadcast Languages
              </span>
              <div className="flex flex-wrap gap-2">
                {langOptions.map((l) => {
                  const active = selectedLangs.includes(l.code);
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleToggleLang(l.code)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                        active
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-glass border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {active && <Check size={12} />}
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateAIAnnouncement}
              loading={loadingAI}
              icon={<Sparkles size={14} />}
              className="w-full shadow-glow"
            >
              Draft Multilingual Announcement
            </Button>
          </Card>

          {/* AI generated translations preview output */}
          {generatedDraft && (
            <Card variant="glass" className="border border-primary/20 shadow-glow space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-primary animate-pulse" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Gemini Multilingual Draft
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(generatedDraft).map(([lang, text]) => (
                  <div key={lang} className="p-3 bg-glass border border-border rounded space-y-1">
                    <span className="text-[9px] font-bold text-accent uppercase">{lang} translation:</span>
                    <p className="text-xs text-text-secondary leading-relaxed font-semibold">{text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handlePublishAnnouncement} className="w-full text-xs">
                  Publish to Dashboard Broadcasts
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Side: Announcement History Log */}
        <Card variant="glass" className="h-full flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-border mb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Broadcast Log Queue
              </h3>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-2.5 bg-glass border border-border rounded-lg space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{ann.title}</span>
                    <Badge variant={ann.type === 'warning' ? 'warning' : 'info'} size="sm">
                      {ann.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed font-medium">{ann.message}</p>
                  <p className="text-[9px] text-text-tertiary">Sent: {getRelativeTime(ann.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
