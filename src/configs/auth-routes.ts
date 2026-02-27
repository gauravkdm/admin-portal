import type { RouteType } from "@/types"

export const routeMap = new Map<string, RouteType>([
  ["/sign-in", { type: "guest" }],
  ["/", { type: "public" }],
])
