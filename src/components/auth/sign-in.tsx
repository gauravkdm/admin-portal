import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "./auth-layout"
import { SignInForm } from "./sign-in-form"

export function SignIn({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth
      imgSrc="/images/illustrations/misc/welcome.svg"
      dictionary={dictionary}
    >
      <AuthHeader>
        <AuthTitle>Admin Portal</AuthTitle>
        <AuthDescription>
          Enter your phone number to sign in with OTP
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <SignInForm />
      </AuthForm>
    </Auth>
  )
}
