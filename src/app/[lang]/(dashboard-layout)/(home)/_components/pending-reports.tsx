import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function PendingReports({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <Alert>
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>
        {count} pending user report{count !== 1 ? "s" : ""}
      </AlertTitle>
      <AlertDescription>
        There are unreviewed user reports that need attention.{" "}
        <Link href="/reports" className="font-medium underline">
          Review reports
        </Link>
      </AlertDescription>
    </Alert>
  )
}
