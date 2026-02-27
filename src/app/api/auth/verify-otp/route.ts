import { NextResponse } from "next/server"

import { db } from "@/lib/prisma"
import { verifyOtp } from "@/lib/twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNo, otp, countryCode } = body

    if (!phoneNo || !otp) {
      return NextResponse.json(
        { message: "Phone number and OTP are required" },
        { status: 400 }
      )
    }

    await verifyOtp(countryCode || "91", phoneNo, otp)

    const user = await db.users.findFirst({
      where: { PhoneNo: phoneNo },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "OTP verified successfully",
      data: {
        userId: user.Id,
        phone: user.PhoneNo,
        firstName: user.FirstName,
        lastName: user.LastName,
      },
    })
  } catch (e) {
    console.error("Error verifying OTP:", e)
    return NextResponse.json(
      {
        message: e instanceof Error ? e.message : "OTP verification failed",
      },
      { status: 400 }
    )
  }
}
