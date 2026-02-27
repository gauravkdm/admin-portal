"use client"

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlatformUsageChartProps {
  data: { platform: string; count: number }[]
}

const COLORS = ["#2563eb", "#16a34a", "#ea580c"]

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
}

export function PlatformUsageChart({ data }: PlatformUsageChartProps) {
  const labeled = data.map((d) => ({
    ...d,
    label: PLATFORM_LABELS[d.platform] ?? d.platform,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={labeled}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ label, count }) => `${label}: ${count}`}
            >
              {labeled.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
