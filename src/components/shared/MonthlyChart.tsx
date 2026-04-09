'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface MonthlyStats {
  month: string;
  paid: number;
  pending: number;
  cancelled: number;
}

interface MonthlyChartProps {
  data: MonthlyStats[];
}

interface TooltipPayload {
  value: number;
  payload: MonthlyStats;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card border border-border-default rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-text-primary mb-2">{payload[0].payload.month}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-accent-green"></div>
              <span className="text-xs text-text-secondary">مدفوع:</span>
              <span className="text-xs font-semibold text-accent-green">{formatCurrency(payload[0].value)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-accent-amber"></div>
              <span className="text-xs text-text-secondary">معلق:</span>
              <span className="text-xs font-semibold text-accent-amber">{formatCurrency(payload[1].value)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-accent-red"></div>
              <span className="text-xs text-text-secondary">ملغي:</span>
              <span className="text-xs font-semibold text-accent-red">{formatCurrency(payload[2].value)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="month"
          stroke="#64748b"
          style={{
            fontSize: '12px',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          }}
        />
        <YAxis
          stroke="#64748b"
          style={{
            fontSize: '12px',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
          }}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}م`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
        <Legend
          wrapperStyle={{
            fontSize: '12px',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            paddingTop: '10px',
          }}
          formatter={(value) => {
            if (value === 'paid') return 'مدفوع';
            if (value === 'pending') return 'معلق';
            if (value === 'cancelled') return 'ملغي';
            return value;
          }}
        />
        <Bar dataKey="paid" fill="#22c55e" radius={[8, 8, 0, 0]} />
        <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        <Bar dataKey="cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
