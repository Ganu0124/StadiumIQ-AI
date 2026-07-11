/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AreaChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
}

export function AreaChart({ data, dataKey, xAxisKey, color = '#3B82F6', height = 240 }: AreaChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height }} className="w-full skeleton" />;
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              background: '#0D1425',
              borderColor: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#E8ECF4',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${dataKey})`}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
