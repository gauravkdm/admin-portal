"use client"

import { format } from "date-fns"
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

interface RevenueTimelineChartProps {
  data: { month: string; total: number }[]
}

export function RevenueTimelineChart({ data }: RevenueTimelineChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.month), "MMM yyyy"),
    formattedTotal: `₹${d.total.toLocaleString()}`,
  }))

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Revenue Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [
                `₹${value.toLocaleString()}`,
                "Revenue",
              ]}
            />
            <Bar
              dataKey="total"
              name="Revenue"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
