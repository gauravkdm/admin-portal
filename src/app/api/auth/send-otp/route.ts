import { NextResponse } from "next/server"

import { sendOtp } from "@/lib/twilio"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phoneNo, countryCode } = body

    if (!phoneNo) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 }
      )
    }

    await sendOtp(countryCode || "91", phoneNo)

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (e) {
    console.error("Error sending OTP:", e)
    return NextResponse.json(
      {
        message: e instanceof Error ? e.message : "Failed to send OTP",
      },
      { status: 500 }
    )
  }
}
