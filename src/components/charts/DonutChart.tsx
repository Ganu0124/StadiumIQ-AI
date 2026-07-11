/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
}

export function DonutChart({ data, height = 240 }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height }} className="w-full skeleton" />;
  }

  const defaultColors = ['#3B82F6', '#D4AF37', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div style={{ height }} className="w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
            contentStyle={{
              background: '#0D1425',
              borderColor: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#E8ECF4',
            }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
                stroke="rgba(6, 11, 24, 0.8)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={10}
            iconType="circle"
            wrapperStyle={{
              fontSize: '10px',
              fontFamily: 'var(--font-sans)',
              color: '#8B95A8',
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
