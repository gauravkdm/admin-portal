const DEV_OTP = "1234"

export async function sendOtp(
  _countryCode: string,
  _phoneNumber: string
): Promise<{ sid: string; status: string }> {
  // Dev mode: skip Twilio, OTP is always "1234"
  console.log(`[DEV] OTP for ${_phoneNumber}: ${DEV_OTP}`)
  return { sid: "dev-sid", status: "pending" }
}

export async function verifyOtp(
  _countryCode: string,
  _phoneNumber: string,
  code: string
): Promise<{ sid: string; status: string }> {
  if (code !== DEV_OTP) {
    throw new Error("Invalid OTP")
  }
  return { sid: "dev-sid", status: "approved" }
}
