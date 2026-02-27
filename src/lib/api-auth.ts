import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/configs/next-auth"

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
      session: null,
    }
  }

  if (!session.user.isAdmin) {
    return {
      error: NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}
