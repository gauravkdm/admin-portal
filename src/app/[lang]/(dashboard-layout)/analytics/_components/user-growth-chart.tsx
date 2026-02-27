"use client"

import { format } from "date-fns"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserGrowthChartProps {
  data: { month: string; count: number }[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.month), "MMM yyyy"),
  }))

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              name="New Users"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
