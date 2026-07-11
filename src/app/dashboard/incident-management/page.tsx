'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { incidents as initialIncidents } from '@/data/mock-data';
import { ShieldAlert, Brain, Sparkles, Clock, AlertTriangle, CheckSquare, Search, Filter } from 'lucide-react';
import { getRelativeTime, downloadCSV } from '@/lib/utils';
import { Incident } from '@/types';

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(initialIncidents[0]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleExportExcel = () => {
    downloadCSV(incidents, 'stadium_incidents');
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesPriority = filterPriority === 'all' || inc.priority === filterPriority;
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const handleAIAnalyze = (id: string) => {
    setLoadingAI(true);
    setTimeout(() => {
      setIncidents(prev => prev.map(inc => {
        if (inc.id === id) {
          return {
            ...inc,
            aiSummary: 'AI Analysis: High cluster density warning in Gate corridor area. Crowd entry velocity has exceeded standard queue margins by 18%. Possible risk of localized gate congestion.',
            aiRecommendation: 'Action: Reroute incoming spectator traffic to adjacent gates. Deploy additional security marshal team to secure lines.'
          };
        }
        return inc;
      }));
      setSelectedIncident(prev => {
        if (prev?.id === id) {
          return {
            ...prev,
            aiSummary: 'AI Analysis: High cluster density warning in Gate corridor area. Crowd entry velocity has exceeded standard queue margins by 18%. Possible risk of localized gate congestion.',
            aiRecommendation: 'Action: Reroute incoming spectator traffic to adjacent gates. Deploy additional security marshal team to secure lines.'
          };
        }
        return prev;
      });
      setLoadingAI(false);
    }, 1000);
  };

  const handleResolve = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() };
      }
      return inc;
    }));
    setSelectedIncident(prev => prev?.id === id ? { ...prev, status: 'resolved', resolvedAt: new Date().toISOString() } : prev);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Incident Management</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Active security logs, ticket verification checks, and AI incident dispatch desk.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportExcel} className="text-xs font-bold">
          Export Excel Sheet
        </Button>
      </div>

      {/* Search & Filter tools */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            placeholder="Search active incidents or gates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-glass text-xs pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none placeholder:text-text-tertiary"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-[#0D1425] text-xs p-2.5 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none text-text-primary min-w-[140px]"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Incidents Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list left */}
        <div className="lg:col-span-2 space-y-4">
          <Card variant="glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-tertiary font-bold">
                    <th className="py-3 px-2">Incident ID</th>
                    <th className="py-3 px-2">Detail</th>
                    <th className="py-3 px-2">Location</th>
                    <th className="py-3 px-2 text-center">Priority</th>
                    <th className="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`cursor-pointer transition-colors ${
                        selectedIncident?.id === inc.id ? 'bg-primary-muted/10' : 'hover:bg-glass/5'
                      }`}
                    >
                      <td className="py-3.5 px-2 font-mono font-bold text-text-primary">{inc.id}</td>
                      <td className="py-3.5 px-2">
                        <div>
                          <p className="font-bold text-text-primary">{inc.title}</p>
                          <p className="text-[10px] text-text-tertiary truncate max-w-xs">{inc.description}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-text-secondary">{inc.location}</td>
                      <td className="py-3.5 px-2 text-center">
                        <Badge variant={inc.priority === 'critical' ? 'danger' : inc.priority === 'high' ? 'warning' : 'default'} size="sm">
                          {inc.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <Badge variant={inc.status === 'resolved' ? 'success' : 'info'} size="sm">
                          {inc.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Action Panel right */}
        <Card variant="glass" className="h-full flex flex-col justify-between">
          {selectedIncident ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-primary" />
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Alert Inspector
                  </span>
                </div>
                <Badge variant="accent" size="sm">{selectedIncident.id}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-text-primary">{selectedIncident.title}</h4>
                <p className="text-[10px] text-text-secondary mt-1">{selectedIncident.description}</p>
                <p className="text-[10px] text-text-tertiary mt-2">Location: {selectedIncident.location}</p>
                <p className="text-[10px] text-text-tertiary mt-0.5">Reported: {getRelativeTime(selectedIncident.reportedAt)}</p>
              </div>

              {selectedIncident.aiSummary && (
                <div className="p-3 bg-primary-muted/10 border border-primary/20 rounded-md space-y-2">
                  <div className="flex items-center gap-1">
                    <Brain size={14} className="text-primary animate-pulse" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Gemini Diagnostics</span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-semibold">
                    {selectedIncident.aiSummary}
                  </p>
                  {selectedIncident.aiRecommendation && (
                    <div className="mt-2 pt-2 border-t border-primary/10">
                      <span className="text-[9px] font-bold text-accent block uppercase">AI Advice:</span>
                      <p className="text-[10px] text-text-secondary leading-relaxed font-bold">
                        {selectedIncident.aiRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.04] space-y-2">
                {!selectedIncident.aiSummary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleAIAnalyze(selectedIncident.id)}
                    loading={loadingAI}
                  >
                    Analyze with Gemini
                  </Button>
                )}
                {selectedIncident.status !== 'resolved' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleResolve(selectedIncident.id)}
                  >
                    Resolve Alert Status
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Brain size={32} className="mx-auto text-text-tertiary mb-3 animate-pulse" />
              <p className="text-xs font-semibold text-text-secondary">Select an incident log</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
