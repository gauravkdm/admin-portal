import { z } from "zod"

export const PhoneSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  countryCode: z.string().default("+91"),
})

export const OtpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
})

export type PhoneFormType = z.infer<typeof PhoneSchema>
export type OtpFormType = z.infer<typeof OtpSchema>

export const SignInSchema = PhoneSchema
