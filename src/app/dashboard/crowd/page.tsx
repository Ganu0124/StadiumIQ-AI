'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { queuePredictions, crowdZones, aiInsights } from '@/data/mock-data';
import { BarChart } from '@/components/charts/BarChart';
import { AreaChart } from '@/components/charts/AreaChart';
import {
  Users, Clock, AlertTriangle, Sparkles, Brain, ArrowRight, Compass, ShieldAlert, Route
} from 'lucide-react';
import { StadiumRouter, RouteResult } from '@/lib/core/router';

export default function CrowdIntelligencePage() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [customRecommendation, setCustomRecommendation] = useState<string | null>(null);

  // Pathfinding interactive states
  const [routeSource, setRouteSource] = useState('N2');
  const [routeDest, setRouteDest] = useState('gate3');
  const [simulateCongestion, setSimulateCongestion] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [evacMode, setEvacMode] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Trigger Gemini/Mock Recommendation
  const handleGenerateAIRecommendation = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setCustomRecommendation(
        'Gemini analysis: Dynamic gate routing recommended. Redirect 15% of inbound flow from Gate B1 (18m wait) to Gate B2 (3m wait) via concourse routing signs. Estimated wait reduction: 6 minutes. Deploy 2 volunteer guide units at Concourse B split.'
      );
      setSrAnnouncement('AI advisory generated: Dynamic gate routing recommended from Gate B1 to Gate B2.');
      setLoadingAI(false);
    }, 1500);
  };

  // Run Dijkstra routing
  const handleCalculateRoute = (e: React.FormEvent, isEvac = false) => {
    e.preventDefault();
    setEvacMode(isEvac);
    setRouteResult(null);

    // Load default layout nodes and edges
    const router = StadiumRouter.loadDefaultStadiumLayout();

    // If congestion simulation is active, inject high congestion factor (e.g. 0.95 blockage) 
    // on normal corridors to demonstrate Dijkstra routing around congestion.
    if (simulateCongestion) {
      // Simulate extreme bottleneck on Gate A1 Corridor and Gate B1 Corridor
      router.setCongestion('N1', 'gate1', 0.95);
      router.setCongestion('W1', 'gate2', 0.95);
    }

    let result: RouteResult | null = null;
    if (isEvac) {
      result = router.findEvacuationRoute(routeSource);
    } else {
      result = router.findRoute(routeSource, routeDest);
    }

    if (result) {
      setRouteResult(result);
      const stepsText = result.path.map(s => s.nodeName).join(' to ');
      const msg = `Route calculated. Total distance: ${result.totalDistanceMeters}m. Estimated time: ${result.totalEstimatedSeconds}s. Path: ${stepsText}`;
      setSrAnnouncement(msg);
    } else {
      const errorMsg = 'Failed to find a viable routing path between selected coordinates.';
      setSrAnnouncement(errorMsg);
      alert(errorMsg);
    }
  };

  // Convert crowdZone list to charting points
  const zoneChartData = crowdZones.slice(0, 5).map(z => ({
    name: z.name,
    value: z.density,
    occupancy: z.currentOccupancy,
  }));

  return (
    <div className="space-y-6">
      {/* Screen reader live notification box */}
      <div aria-live="polite" className="sr-only" id="sr-crowd-alerts">
        {srAnnouncement}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Crowd Intelligence</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Predictive crowd dynamics, gate queue monitoring, and Dijkstra routing matrix optimizations.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateAIRecommendation}
          loading={loadingAI}
          icon={<Sparkles size={14} />}
          className="shadow-glow text-white"
          aria-label="Compute flow optimizations"
        >
          Compute Flow Optimizations
        </Button>
      </div>

      {/* Dynamic Recommendation Panel */}
      {(customRecommendation || aiInsights.length > 0) && (
        <Card variant="glass" className="border border-primary/20 shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary-muted flex items-center justify-center text-primary mt-1 flex-shrink-0">
              <Brain size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Live Flow Advisory
                </h3>
                <Badge variant="accent" size="sm">Gemini AI</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {customRecommendation || aiInsights[0].content}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="text-[10px] !py-1 !px-3 rounded-md text-white">
                  Broadcast Advisory to Screens
                </Button>
                <Button variant="secondary" size="sm" className="text-[10px] !py-1 !px-3 rounded-md">
                  Dispatch Field Guides
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grid: Occupancy Heat list & Queue predictions table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Stand Occupancy Heat / Gate predictions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Queue Predictions Table */}
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Gate Queue Predictions
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Current queue metrics and predicted wait times for the next 15-60 minutes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-tertiary font-bold">
                    <th className="py-2.5 px-2">Access Gate</th>
                    <th className="py-2.5 px-2 text-center">Current</th>
                    <th className="py-2.5 px-2 text-center">15m Exp</th>
                    <th className="py-2.5 px-2 text-center">30m Exp</th>
                    <th className="py-2.5 px-2 text-center">60m Exp</th>
                    <th className="py-2.5 px-2">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {queuePredictions.map((pred) => (
                    <tr key={pred.gateId} className="hover:bg-glass/5 transition-colors">
                      <td className="py-3 px-2 font-semibold text-text-primary">{pred.gateName}</td>
                      <td className="py-3 px-2 text-center font-mono">
                        <span className={pred.currentWait > 15 ? 'text-danger font-bold' : pred.currentWait > 10 ? 'text-warning' : 'text-success'}>
                          {pred.currentWait}m
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-text-secondary font-mono">{pred.predicted15Min}m</td>
                      <td className="py-3 px-2 text-center text-text-secondary font-mono">{pred.predicted30Min}m</td>
                      <td className="py-3 px-2 text-center text-text-secondary font-mono">{pred.predicted60Min}m</td>
                      <td className="py-3 px-2 text-text-secondary text-[11px] max-w-xs truncate" title={pred.recommendation}>
                        {pred.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 2: Smart routing planner widget (Problem Alignment - Dynamic Routing & Evacuation) */}
          <Card variant="glass" className="focus-within:ring-2 focus-within:ring-primary/20">
            <div className="pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <Compass className="text-primary animate-spin-slow" size={16} />
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Dijkstra Crowd-Routing & Evacuation Command
                </h3>
              </div>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Calculate minimum distance and lowest-congestion pathways. Simulate crowd pressure and emergency drills.
              </p>
            </div>

            <form onSubmit={(e) => handleCalculateRoute(e, false)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="source-node" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Source Zone / Stand
                  </label>
                  <select
                    id="source-node"
                    value={routeSource}
                    onChange={(e) => setRouteSource(e.target.value)}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="N2">North Stand Upper (N2)</option>
                    <option value="N1">North Stand Lower (N1)</option>
                    <option value="S2">South Stand Upper (S2)</option>
                    <option value="S1">South Stand Lower (S1)</option>
                    <option value="E2">East Stand Upper (E2)</option>
                    <option value="E1">East Stand Lower (E1)</option>
                    <option value="W2">West Stand Upper (W2)</option>
                    <option value="W1">West Stand Lower (W1)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dest-node" className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                    Destination Gate / Point
                  </label>
                  <select
                    id="dest-node"
                    value={routeDest}
                    onChange={(e) => setRouteDest(e.target.value)}
                    className="w-full bg-glass text-xs p-2 rounded border border-border text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="gate1">Gate A1 Entrance</option>
                    <option value="gate2">Gate B1 Entrance</option>
                    <option value="gate3">Gate C1 Entrance</option>
                    <option value="gate4">Gate D1 Entrance</option>
                    <option value="med1">Medical Room A</option>
                    <option value="med2">Medical Room B</option>
                    <option value="food1">Burger Co.</option>
                    <option value="food2">Refreshment Hub</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    id="simulate-congestion"
                    type="checkbox"
                    checked={simulateCongestion}
                    onChange={(e) => setSimulateCongestion(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="simulate-congestion" className="text-xs font-bold text-text-secondary cursor-pointer select-none">
                    Simulate Crowd Bottleneck
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="flex-1 min-w-[140px] text-xs font-bold text-white shadow-glow"
                  aria-label="Compute optimal routing path"
                >
                  Calculate Crowd Route
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleCalculateRoute(e, true)}
                  className="flex-1 min-w-[140px] text-xs font-bold border-danger text-danger hover:bg-danger-muted"
                  aria-label="Run automated emergency evacuation drill"
                >
                  <ShieldAlert size={14} className="mr-1.5" />
                  Evacuate Seating Zone
                </Button>
              </div>
            </form>

            {/* Pathfinding Output Results Panel */}
            {routeResult && (
              <div className="mt-4 p-4 bg-slate-900/90 border border-primary/20 rounded-lg text-xs space-y-3 font-medium">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-primary">
                    <Route size={14} />
                    <span>{evacMode ? 'Emergency Evacuation Solution' : 'Computed Dynamic Path'}</span>
                  </div>
                  <Badge variant={evacMode ? 'danger' : 'success'} size="sm">
                    {evacMode ? 'CRITICAL EVAC' : 'Dijkstra Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-text-secondary text-[11px] border-b border-white/[0.04] pb-2">
                  <div>
                    <span>Total Travel Distance:</span>
                    <p className="text-sm font-black text-text-primary mt-0.5">{routeResult.totalDistanceMeters} meters</p>
                  </div>
                  <div>
                    <span>Estimated Transit Duration:</span>
                    <p className="text-sm font-black text-text-primary mt-0.5">
                      {Math.floor(routeResult.totalEstimatedSeconds / 60)}m {routeResult.totalEstimatedSeconds % 60}s
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Waypoint Vector Nodes:</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {routeResult.path.map((step, idx) => (
                      <React.Fragment key={step.nodeId}>
                        {idx > 0 && <ArrowRight size={12} className="text-text-tertiary" />}
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          step.nodeType === 'emergency-exit' ? 'bg-red-500/20 text-danger border border-red-500/30' :
                          step.nodeType === 'seating' ? 'bg-primary-muted/20 text-primary border border-primary/20' :
                          'bg-surface-elevated/80 border border-border text-text-primary'
                        }`}>
                          {step.nodeName}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {simulateCongestion && (
                  <div className="bg-yellow-950/40 border border-warning/20 p-2 rounded text-[10px] text-yellow-300">
                    * Bottleneck routing simulated. Dijkstra diverted crowd flow to bypass congested corridors.
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Section 3: Zone Density Load Graph */}
          <Card variant="glass">
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Zone Density Load (%)
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Relative occupancy percentages for key sectors.
              </p>
            </div>
            <BarChart
              data={zoneChartData}
              dataKey="value"
              xAxisKey="name"
              colors={['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6']}
              height={200}
            />
          </Card>
        </div>

        {/* Right Side: Zone Density Inspector list */}
        <Card variant="glass" className="h-full flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Sector Density Logs
              </h3>
              <p className="text-[9px] text-text-tertiary mt-0.5">
                Live seat filling updates and threshold warnings.
              </p>
            </div>

            <div className="mt-4 space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {crowdZones.map((zone) => (
                <div key={zone.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-primary">{zone.name}</span>
                    <Badge
                      variant={zone.density > 90 ? 'danger' : zone.density > 75 ? 'warning' : 'success'}
                      size="sm"
                    >
                      {zone.density}% Occupied
                    </Badge>
                  </div>
                  <ProgressBar value={zone.density} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
