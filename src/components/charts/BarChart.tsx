/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  colors?: string[];
  height?: number;
}

export function BarChart({ data, dataKey, xAxisKey, colors = ['#3B82F6'], height = 240 }: BarChartProps) {
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
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
