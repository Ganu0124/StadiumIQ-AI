/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle } from 'lucide-react';

interface StadiumMapProps {
  filter: 'density' | 'facilities' | 'emergency';
  onZoneSelect?: (zone: any) => void;
}

export function StadiumMap({ filter, onZoneSelect }: StadiumMapProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<any | null>(null);

  // Hardcoded sectors with coordinates for rendering
  const sectors = [
    { id: 'N1', name: 'North Stand Lower', type: 'seating', cx: 200, cy: 70, rx: 120, ry: 40, density: 91, status: 'normal', color: 'rgba(239, 68, 68, 0.7)' },
    { id: 'S1', name: 'South Stand Lower', type: 'seating', cx: 200, cy: 290, rx: 120, ry: 40, density: 89, status: 'busy', color: 'rgba(245, 158, 11, 0.7)' },
    { id: 'E1', name: 'East Stand Lower', type: 'seating', cx: 70, cy: 180, rx: 40, ry: 100, density: 92, status: 'full', color: 'rgba(239, 68, 68, 0.8)' },
    { id: 'W1', name: 'West Stand Lower', type: 'seating', cx: 330, cy: 180, rx: 40, ry: 100, density: 85, status: 'normal', color: 'rgba(16, 185, 129, 0.6)' },
    
    { id: 'N2', name: 'North Stand Upper', type: 'seating', cx: 200, cy: 30, rx: 160, ry: 20, density: 72, status: 'normal', color: 'rgba(16, 185, 129, 0.5)' },
    { id: 'S2', name: 'South Stand Upper', type: 'seating', cx: 200, cy: 330, rx: 160, ry: 20, density: 68, status: 'normal', color: 'rgba(16, 185, 129, 0.5)' },
    { id: 'E2', name: 'East Stand Upper', type: 'seating', cx: 30, cy: 180, rx: 20, ry: 140, density: 95, status: 'full', color: 'rgba(239, 68, 68, 0.85)' },
    { id: 'W2', name: 'West Stand Upper', type: 'seating', cx: 370, cy: 180, rx: 20, ry: 140, density: 54, status: 'normal', color: 'rgba(16, 185, 129, 0.4)' },
  ];

  const facilities = [
    { id: 'med1', name: 'Medical Room A', type: 'medical', x: 80, y: 70, label: 'H' },
    { id: 'med2', name: 'Medical Room B', type: 'medical', x: 320, y: 290, label: 'H' },
    { id: 'rest1', name: 'Restroom North', type: 'restroom', x: 120, y: 60, label: 'WC' },
    { id: 'rest2', name: 'Restroom South', type: 'restroom', x: 280, y: 300, label: 'WC' },
    { id: 'food1', name: 'Burger Co.', type: 'restaurant', x: 100, y: 280, label: '🍔' },
    { id: 'food2', name: 'Refreshment Hub', type: 'restaurant', x: 300, y: 80, label: '🥤' },
    { id: 'gate1', name: 'Gate A1 Entrance', type: 'entrance', x: 200, y: 15, label: 'Gate A' },
    { id: 'gate2', name: 'Gate B1 Entrance', type: 'entrance', x: 385, y: 180, label: 'Gate B' },
    { id: 'gate3', name: 'Gate C1 Entrance', type: 'entrance', x: 200, y: 345, label: 'Gate C' },
    { id: 'gate4', name: 'Gate D1 Entrance', type: 'entrance', x: 15, y: 180, label: 'Gate D' },
  ];

  const getDensityColor = (density: number) => {
    if (density >= 90) return 'fill-danger/60 stroke-danger hover:fill-danger/80';
    if (density >= 75) return 'fill-warning/60 stroke-warning hover:fill-warning/80';
    return 'fill-success/40 stroke-success hover:fill-success/60';
  };

  return (
    <Card variant="glass" className="relative flex flex-col items-center justify-center p-6 h-full min-h-[480px]">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Interactive Stadium View
        </h3>
        <p className="text-[10px] text-text-secondary">
          Click zones to inspect details or assign emergency units.
        </p>
      </div>

      {/* SVG Container */}
      <div className="w-full max-w-lg aspect-square relative flex items-center justify-center mt-6">
        <svg
          viewBox="0 0 400 360"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.05)]"
        >
          {/* Pitch Area */}
          <rect
            x="130"
            y="110"
            width="140"
            height="140"
            rx="12"
            fill="#0D1425"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
          <rect
            x="145"
            y="125"
            width="110"
            height="110"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="180"
            r="30"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1.5"
          />
          {/* Center text representing the field */}
          <text
            x="200"
            y="184"
            textAnchor="middle"
            fill="#8B95A8"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="2"
            className="opacity-40"
          >
            PITCH AREA
          </text>

          {/* Render Stand Sectors */}
          {sectors.map((sector) => {
            const isSelected = selectedZone === sector.id;
            const densityClass = getDensityColor(sector.density);
            const showDensity = filter === 'density' || filter === 'emergency';

            return (
              <g key={sector.id} className="cursor-pointer">
                <ellipse
                  cx={sector.cx}
                  cy={sector.cy}
                  rx={sector.rx}
                  ry={sector.ry}
                  className={cn(
                    'transition-all duration-300 stroke-2',
                    showDensity ? densityClass : 'fill-surface-elevated/40 stroke-border hover:fill-surface-hover/60',
                    isSelected && 'stroke-primary stroke-[3px] fill-primary-muted/20'
                  )}
                  onClick={() => {
                    setSelectedZone(sector.id);
                    onZoneSelect?.(sector);
                  }}
                  onMouseEnter={() => setHoveredZone(sector)}
                  onMouseLeave={() => setHoveredZone(null)}
                />
                {/* Sector labels */}
                <text
                  x={sector.cx}
                  y={sector.cy + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="black"
                  className="pointer-events-none select-none opacity-80"
                >
                  {sector.id}
                </text>
              </g>
            );
          })}

          {/* Facilities Icons/Badges */}
          {filter === 'facilities' &&
            facilities.map((fac) => (
              <g
                key={fac.id}
                className="cursor-pointer transition-transform duration-200 hover:scale-115"
                onClick={() => {
                  setSelectedZone(fac.id);
                  onZoneSelect?.(fac);
                }}
                onMouseEnter={() => setHoveredZone(fac)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <circle
                  cx={fac.x}
                  cy={fac.y}
                  r="12"
                  fill="#0D1425"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                />
                <text
                  x={fac.x}
                  y={fac.y + 3}
                  textAnchor="middle"
                  fill="#E8ECF4"
                  fontSize="8"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {fac.label}
                </text>
              </g>
            ))}

          {/* Emergency Exits and Evacuation Lines */}
          {filter === 'emergency' && (
            <>
              {/* Escape route vectors */}
              <line x1="200" y1="180" x2="200" y2="30" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
              <line x1="200" y1="180" x2="200" y2="330" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
              <line x1="200" y1="180" x2="30" y2="180" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
              <line x1="200" y1="180" x2="370" y2="180" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" className="animate-pulse" />
              
              {/* Emergency indicator markers */}
              <circle cx="200" cy="30" r="4" fill="#EF4444" className="animate-ping" />
              <circle cx="200" cy="330" r="4" fill="#EF4444" className="animate-ping" />
              <circle cx="30" cy="180" r="4" fill="#EF4444" className="animate-ping" />
              <circle cx="370" cy="180" r="4" fill="#EF4444" className="animate-ping" />
            </>
          )}
        </svg>

        {/* Hover info tooltip */}
        {hoveredZone && (
          <div className="absolute bottom-4 bg-surface-elevated border border-border px-3 py-2 rounded-md shadow-lg flex items-center gap-2 text-xs">
            <Info size={14} className="text-primary" />
            <div>
              <span className="font-bold text-text-primary">{hoveredZone.name}</span>
              {hoveredZone.density !== undefined && (
                <span className="text-text-secondary ml-1.5">
                  ({hoveredZone.density}% Density)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend panel */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold border-t border-border pt-4 w-full justify-center">
        {filter === 'density' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-success/40 border border-success" />
              <span className="text-text-secondary">Low Density (&lt;75%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-warning/40 border border-warning" />
              <span className="text-text-secondary">Moderate (75%-90%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-danger/40 border border-danger" />
              <span className="text-text-secondary">Critical Congestion (&gt;90%)</span>
            </div>
          </>
        )}
        {filter === 'facilities' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0D1425] border border-primary text-[8px] flex items-center justify-center">H</span>
              <span className="text-text-secondary">Medical Stations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0D1425] border border-primary text-[8px] flex items-center justify-center">WC</span>
              <span className="text-text-secondary">Restrooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0D1425] border border-primary text-[8px] flex items-center justify-center">🍔</span>
              <span className="text-text-secondary">Restaurants</span>
            </div>
          </>
        )}
        {filter === 'emergency' && (
          <div className="flex items-center gap-2 text-danger animate-pulse">
            <AlertTriangle size={14} />
            <span>Evacuation Routes Display Active</span>
          </div>
        )}
      </div>
    </Card>
  );
}
