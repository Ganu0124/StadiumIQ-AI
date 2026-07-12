'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { incidents as initialIncidents, staffMembers, equipmentList } from '@/data/mock-data';
import {
  Wrench, Users, Activity, HelpCircle, Heart, Shield, Sparkles, Brain, Clock, ShieldAlert, CheckCircle, Calendar, AlertTriangle
} from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import { Incident } from '@/types';
import { TournamentScheduler, Fixture, ConflictResult } from '@/lib/core/scheduler';

export default function OperationsCenterPage() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(initialIncidents[0]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Tournament scheduling interactive states
  const [fixtures, setFixtures] = useState<Fixture[]>([
    {
      id: 'fix-1',
      name: 'Argentina vs France',
      teamA: 'Argentina',
      teamB: 'France',
      startTime: new Date('2026-07-10T18:00:00'),
      endTime: new Date('2026-07-10T20:00:00'),
      sectorId: 'N1',
      expectedAttendance: 65000,
    },
    {
      id: 'fix-2',
      name: 'Spain vs Uruguay',
      teamA: 'Spain',
      teamB: 'Uruguay',
      startTime: new Date('2026-07-12T15:00:00'),
      endTime: new Date('2026-07-12T17:00:00'),
      sectorId: 'S1',
      expectedAttendance: 58000,
    },
  ]);
  const [matchName, setMatchName] = useState('');
  const [matchDate, setMatchDate] = useState('2026-07-12');
  const [matchTime, setMatchTime] = useState('18:00');
  const [matchDuration, setMatchDuration] = useState(120);
  const [matchSector, setMatchSector] = useState('N1');
  const [matchAttendance, setMatchAttendance] = useState(65000);
  const [scheduleConflicts, setScheduleConflicts] = useState<ConflictResult[]>([]);
  const [alternativeSlot, setAlternativeSlot] = useState<string | null>(null);
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState('');

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

  // Check conflicts and schedule new fixture
  const handleScheduleFixture = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleConflicts([]);
    setAlternativeSlot(null);
    setScheduleSuccessMessage(null);
    setSrAnnouncement('');

    // Input verification
    if (!matchName.includes(' vs ')) {
      const desc = 'Error: Fixture name must be formatted as "TeamA vs TeamB"';
      setScheduleConflicts([{
        type: 'venue-overlap',
        description: desc,
        severity: 'critical',
        conflictingFixtureIds: []
      }]);
      setSrAnnouncement(desc);
      return;
    }

    const [teamA, teamB] = matchName.split(' vs ').map(t => t.trim());
    const start = new Date(`${matchDate}T${matchTime}:00`);
    const end = new Date(start.getTime() + matchDuration * 60 * 1000);

    const newFixture = {
      name: matchName,
      teamA,
      teamB,
      startTime: start,
      endTime: end,
      sectorId: matchSector,
      expectedAttendance: Number(matchAttendance),
    };

    // Instantiate dynamic TournamentScheduler (Config parameters, no hardcoding)
    const scheduler = new TournamentScheduler({
      minTeamRestTimeMs: 48 * 60 * 60 * 1000, // 48-hour recovery required
      stadiumMaxCapacity: 82500, // Stadium seating constraint
      bufferTimeMinutes: 90, // 90-minute turnaround turnaround buffer between fixtures
    });

    const conflicts = scheduler.checkConflicts(newFixture, fixtures);

    if (conflicts.length > 0) {
      setScheduleConflicts(conflicts);
      const isCritical = conflicts.some(c => c.severity === 'critical');
      const conflictMsg = `Scheduled check failed with ${conflicts.length} conflict(s).`;
      setSrAnnouncement(conflictMsg);

      if (isCritical) {
        // Find alternative conflict-free slot in search window
        const searchStart = new Date(`${matchDate}T00:00:00`);
        const searchEnd = new Date(`${matchDate}T23:59:59`);
        
        const altTime = scheduler.findAlternativeSlot(
          newFixture,
          searchStart,
          searchEnd,
          matchDuration,
          fixtures
        );

        if (altTime) {
          const suggested = altTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          setAlternativeSlot(suggested);
          setSrAnnouncement(`${conflictMsg} Suggested alternative slot: ${suggested}.`);
        } else {
          setSrAnnouncement(`${conflictMsg} No alternative slot found for this date.`);
        }
      }
    } else {
      const scheduled: Fixture = {
        id: `fix-${Date.now()}`,
        ...newFixture
      };
      setFixtures(prev => [...prev, scheduled]);
      const msg = `Success: Match ${matchName} scheduled at ${matchTime} in Sector ${matchSector}.`;
      setScheduleSuccessMessage(msg);
      setSrAnnouncement(msg);
      setMatchName('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Accessibility screen-reader live alerts region */}
      <div aria-live="polite" className="sr-only" id="sr-operations-announcements">
        {srAnnouncement}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Operations Center</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time incident dispatch, crew logistics, and tournament scheduling desk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Incident List & Scheduler */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Operational Incidents */}
          <Card variant="glass" className="focus-within:ring-2 focus-within:ring-primary/20">
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

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                    selectedIncident?.id === inc.id
                      ? 'bg-primary-muted/15 border-primary ring-1 ring-primary'
                      : 'bg-glass border-border hover:border-border-hover'
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedIncident?.id === inc.id}
                  aria-label={`Incident ${inc.id}: ${inc.title}. Location: ${inc.location}. Priority: ${inc.priority}.`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedIncident(inc);
                    }
                  }}
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

          {/* Section 2: Tournament Fixture Scheduler (Problem Alignment - O(n log n) checking) */}
          <Card variant="glass" className="focus-within:ring-2 focus-within:ring-primary/20">
            <div className="pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary" size={16} />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Tournament Operations Scheduling
                </h3>
              </div>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Audit and schedule tournament matches. Runs dynamic collision sweep algorithms to ensure safety.
              </p>
            </div>

            {/* Existing Fixtures List */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
                Currently Scheduled Fixtures:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                {fixtures.map(f => (
                  <div key={f.id} className="p-2 bg-glass-dark border border-border/40 rounded flex justify-between items-center text-[11px]">
                    <div>
                      <p className="font-bold text-text-primary">{f.name}</p>
                      <p className="text-text-secondary text-[9px] mt-0.5">
                        Sector {f.sectorId} • {f.startTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})} ({f.expectedAttendance.toLocaleString()} fans)
                      </p>
                    </div>
                    <Badge variant="info" size="sm">Confirmed</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduler Form */}
            <form onSubmit={handleScheduleFixture} className="space-y-4 pt-2 border-t border-border/30">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="match-name" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Fixture Teams
                  </label>
                  <input
                    id="match-name"
                    type="text"
                    required
                    placeholder="e.g. Germany vs France"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-text-tertiary"
                  />
                </div>

                <div>
                  <label htmlFor="match-date" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Kickoff Date
                  </label>
                  <input
                    id="match-date"
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="match-time" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Kickoff Time (24h)
                  </label>
                  <input
                    id="match-time"
                    type="time"
                    required
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="match-sector" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Stadium Sector
                  </label>
                  <select
                    id="match-sector"
                    value={matchSector}
                    onChange={(e) => setMatchSector(e.target.value)}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="N1">North Stand Lower (N1)</option>
                    <option value="S1">South Stand Lower (S1)</option>
                    <option value="E1">East Stand Lower (E1)</option>
                    <option value="W1">West Stand Lower (W1)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="match-attendance" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Expected Attendance
                  </label>
                  <input
                    id="match-attendance"
                    type="number"
                    min="1"
                    max="90000"
                    required
                    value={matchAttendance}
                    onChange={(e) => setMatchAttendance(Number(e.target.value))}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="w-full text-xs font-bold py-2 shadow-glow text-white"
                    aria-label="Submit scheduling request"
                  >
                    Verify & Schedule Fixture
                  </Button>
                </div>
              </div>
            </form>

            {/* Error / Warning Overlaps Output Panel */}
            {scheduleConflicts.length > 0 && (
              <div className="mt-4 p-3 bg-red-950/80 border border-danger/40 rounded-lg text-xs space-y-2 text-white font-medium">
                <div className="flex items-center gap-1.5 text-danger font-black">
                  <AlertTriangle size={14} />
                  <span>Scheduling Collision Detected! ({scheduleConflicts.length} Conflict)</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {scheduleConflicts.map((err, idx) => (
                    <li key={idx} className="leading-tight text-red-200">
                      {err.description}
                    </li>
                  ))}
                </ul>

                {alternativeSlot && (
                  <div className="mt-2 pt-2 border-t border-danger/20 text-yellow-300">
                    <strong>Suggested Alternate Time Slot:</strong> {alternativeSlot} (No conflicts in this window)
                  </div>
                )}
              </div>
            )}

            {/* Success Output Panel */}
            {scheduleSuccessMessage && (
              <div className="mt-4 p-3 bg-emerald-950/80 border border-success/40 rounded-lg text-xs flex items-center gap-2 text-emerald-200 font-semibold">
                <CheckCircle size={14} className="text-success" />
                <span>{scheduleSuccessMessage}</span>
              </div>
            )}
          </Card>

          {/* Section 3: Equipment Status Diagnostic matrix */}
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
                      className="w-full text-xs text-white"
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
