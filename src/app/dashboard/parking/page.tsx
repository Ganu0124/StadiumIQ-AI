'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { parkingLots as initialLots } from '@/data/mock-data';
import { Car, BatteryCharging, Clock, AlertTriangle, Sparkles, Brain, Landmark } from 'lucide-react';
import { AreaChart } from '@/components/charts/AreaChart';
import { ParkingLot } from '@/types';

export default function ParkingPage() {
  const [lots, setLots] = useState<ParkingLot[]>(initialLots);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAdvisory, setAiAdvisory] = useState<string | null>(null);

  const handleTriggerAIAdvisory = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setAiAdvisory(
        'Gemini Routing: Lot B is currently at 100% capacity. Heavy traffic backlog of 42 vehicles detected near East Gate. Recommended action: Direct digital signage at highway junctions to redirect inbound traffic to Lot D (West, 400 spaces available) and Overflow Lot F (1,800 spaces available, 18m walking time). Deploy 3 volunteer guides to East entrance circle.'
      );
      setLoadingAI(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Parking Management</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Space availability logs, EV charging diagnostics, and road network congestion rates.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleTriggerAIAdvisory}
          loading={loadingAI}
          icon={<Sparkles size={14} />}
        >
          Compute Traffic Routing
        </Button>
      </div>

      {/* AI Advisory Panel */}
      {aiAdvisory && (
        <Card variant="glass" className="border border-primary/20 shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary-muted flex items-center justify-center text-primary mt-1 flex-shrink-0">
              <Brain size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Live Traffic rerouting recommendation
                </h3>
                <Badge variant="accent" size="sm">Gemini AI</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {aiAdvisory}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="text-[10px] !py-1 !px-3 rounded-md">
                  Push Rerouting to Signs
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Parking space logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots.map((lot) => {
          const occupancy = Math.round((lot.occupiedSpaces / lot.totalSpaces) * 100);
          return (
            <Card key={lot.id} variant="glass" className="space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">{lot.name}</h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Capacity: {lot.totalSpaces} slots</p>
                </div>
                <Badge variant={lot.status === 'full' ? 'danger' : 'success'} size="sm">
                  {lot.status === 'full' ? 'Full' : 'Open'}
                </Badge>
              </div>

              {/* Occupancy Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Space Occupancy</span>
                  <span className="text-text-primary font-bold">{occupancy}%</span>
                </div>
                <ProgressBar value={occupancy} />
                <p className="text-[10px] text-text-tertiary">
                  {lot.occupiedSpaces} slots filled / {lot.totalSpaces - lot.occupiedSpaces} available
                </p>
              </div>

              {/* Details panel */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.03] text-[11px]">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <BatteryCharging size={14} className="text-success" />
                  <span>EV Charge: {lot.evChargersAvailable}/{lot.evChargers}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Clock size={14} className="text-primary" />
                  <span>Walk: {lot.walkingTime} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-secondary col-span-2">
                  <AlertTriangle size={14} className={lot.trafficLevel === 'heavy' || lot.trafficLevel === 'gridlock' ? 'text-danger' : 'text-text-tertiary'} />
                  <span>Traffic backlog: <strong className="text-text-primary">{lot.trafficLevel}</strong></span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
