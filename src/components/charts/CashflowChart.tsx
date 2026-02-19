"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import type { ChartDataPoint } from "@/types/dashboard";

interface CashflowChartProps {
  revenue: ChartDataPoint[];
  expenses: ChartDataPoint[];
}

export function CashflowChart({ revenue, expenses }: CashflowChartProps) {
  const data = revenue.map((r, i) => ({
    month: r.month,
    revenus: r.amount,
    depenses: expenses[i]?.amount ?? 0,
  }));

  return (
    <ChartWrapper>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
        <Legend />
        <Bar dataKey="revenus" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="depenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartWrapper>
  );
}
