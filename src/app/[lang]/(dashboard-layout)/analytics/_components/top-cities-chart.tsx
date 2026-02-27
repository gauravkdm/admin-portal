"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopCitiesChartProps {
  data: { city: string; count: number }[]
}

export function TopCitiesChart({ data }: TopCitiesChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Top Cities by Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              type="number"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="city"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip />
            <Bar
              dataKey="count"
              name="Events"
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
