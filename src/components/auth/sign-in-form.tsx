"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"

import type { OtpFormType, PhoneFormType } from "@/schemas/sign-in-schema"

import { OtpSchema, PhoneSchema } from "@/schemas/sign-in-schema"

import { toast } from "@/hooks/use-toast"
import { ButtonLoading } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function SignInForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneData, setPhoneData] = useState({ phone: "", countryCode: "+91" })
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const redirectPathname =
    searchParams.get("redirectTo") ||
    process.env.NEXT_PUBLIC_HOME_PATHNAME ||
    "/"

  const phoneForm = useForm<PhoneFormType>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: "", countryCode: "+91" },
  })

  const otpForm = useForm<OtpFormType>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
  })

  async function onSendOtp(data: PhoneFormType) {
    setIsSendingOtp(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNo: data.phone,
          countryCode: data.countryCode,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.message || "Failed to send OTP")
      }

      setPhoneData(data)
      setStep("otp")
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${data.countryCode}${data.phone}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function onVerifyOtp(data: OtpFormType) {
    try {
      const result = await signIn("otp-verify", {
        redirect: false,
        phone: phoneData.phone,
        otp: data.otp,
        countryCode: phoneData.countryCode,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push(redirectPathname)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  if (step === "otp") {
    return (
      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(onVerifyOtp)}
          className="grid gap-6"
        >
          <p className="text-sm text-muted-foreground">
            Enter the 4-digit code sent to{" "}
            <span className="font-medium text-foreground">
              {phoneData.countryCode}
              {phoneData.phone}
            </span>
          </p>
          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={4} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ButtonLoading
            isLoading={otpForm.formState.isSubmitting}
            disabled={otpForm.formState.isSubmitting}
          >
            Verify & Sign In
          </ButtonLoading>
          <button
            type="button"
            onClick={() => {
              setStep("phone")
              otpForm.reset()
            }}
            className="text-sm text-muted-foreground underline text-center"
          >
            Use a different number
          </button>
        </form>
      </Form>
    )
  }

  return (
    <Form {...phoneForm}>
      <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="grid gap-6">
        <div className="grid gap-4">
          <FormField
            control={phoneForm.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input placeholder="+91" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={phoneForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <ButtonLoading isLoading={isSendingOtp} disabled={isSendingOtp}>
          Send OTP
        </ButtonLoading>
      </form>
    </Form>
  )
}
