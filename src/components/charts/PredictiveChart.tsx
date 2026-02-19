"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import { formatCurrency, formatDateShort } from "@/lib/utils/formatters";

interface PredictiveChartProps {
    data: any[];
}

export function PredictiveChart({ data }: PredictiveChartProps) {
    return (
        <ChartWrapper>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="predictiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                    dataKey="date"
                    tick={{ fill: "#888", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                />
                <YAxis
                    tick={{ fill: "#888", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                />
                <Tooltip
                    contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: "12px"
                    }}
                    labelStyle={{ color: "#ddd" }}
                    formatter={(value: any) => [formatCurrency(value), "Solde"]}
                    labelFormatter={(label) => `Date: ${formatDateShort(label)}`}
                />
                <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="3 3" />
                <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#8b5cf6"
                    fill="url(#predictiveGradient)"
                    strokeWidth={3}
                    dot={{ r: 2, fill: "#8b5cf6", strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ChartWrapper>
    );
}
