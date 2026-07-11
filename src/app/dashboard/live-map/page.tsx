'use client';

import React, { useState } from 'react';
import { StadiumMap } from '@/components/maps/StadiumMap';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { crowdZones, incidents } from '@/data/mock-data';
import {
  MapPin, Eye, Compass, LayoutGrid, Heart, Flame, ShieldAlert,
  Settings, Users, DoorOpen
} from 'lucide-react';

export default function LiveMapPage() {
  const [mapFilter, setMapFilter] = useState<'density' | 'facilities' | 'emergency'>('density');
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Live Stadium Map</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Interactive control grid showing structural occupancy and live asset tracking.
          </p>
        </div>

        {/* Display Toggles */}
        <div className="flex bg-glass p-1 rounded-lg border border-border self-start">
          <Button
            variant={mapFilter === 'density' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMapFilter('density')}
            className="text-xs"
          >
            Crowd Density
          </Button>
          <Button
            variant={mapFilter === 'facilities' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMapFilter('facilities')}
            className="text-xs"
          >
            Amenities & Shops
          </Button>
          <Button
            variant={mapFilter === 'emergency' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMapFilter('emergency')}
            className="text-xs"
          >
            Emergency Exits
          </Button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Selected Zone Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: SVG Map representation */}
        <div className="lg:col-span-2">
          <StadiumMap filter={mapFilter} onZoneSelect={(zone) => setSelectedZone(zone)} />
        </div>

        {/* Right Side: Details Inspector Side Deck */}
        <div className="space-y-6">
          {/* Section 1: Inspector Card */}
          <Card variant="glass" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Zone Inspector
                </h3>
                {selectedZone ? (
                  <Badge variant="accent" size="sm">
                    {selectedZone.id || 'FAC'}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-text-tertiary">No selection</span>
                )}
              </div>

              {selectedZone ? (
                <div className="mt-4 space-y-4">
                  {/* Title & Coordinates */}
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{selectedZone.name}</h4>
                    <p className="text-[10px] text-text-tertiary capitalize mt-0.5">
                      Type: {selectedZone.type}
                    </p>
                  </div>

                  {/* Operational capacity (if stand) */}
                  {selectedZone.density !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-secondary">Occupancy Density</span>
                        <span className="text-text-primary">{selectedZone.density}%</span>
                      </div>
                      <ProgressBar value={selectedZone.density} />
                    </div>
                  )}

                  {/* Actions / Dispatch */}
                  <div className="pt-4 border-t border-white/[0.04] space-y-2">
                    <Button variant="primary" size="sm" className="w-full text-xs">
                      Dispatch Volunteers
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full text-xs">
                      CCTV Live Stream
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Compass size={32} className="mx-auto text-text-tertiary mb-3 animate-spin-slow" />
                  <p className="text-xs font-semibold text-text-secondary">Select any coordinate on the map</p>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    Click stand sections or amenity indicators to view metrics.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Section 2: Active Incident Hotlinks list */}
          <Card variant="glass">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Live Alert Hotlinks
              </h3>
              <Badge variant="danger" size="sm">
                {activeIncidents.length} Active
              </Badge>
            </div>

            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-2.5 rounded-md bg-glass border border-border hover:border-danger/30 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-text-primary truncate">{inc.title}</p>
                    <p className="text-[9px] text-text-tertiary mt-0.5">{inc.location}</p>
                  </div>
                  <Badge variant={inc.priority === 'critical' ? 'danger' : 'warning'} size="sm">
                    {inc.priority}
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
