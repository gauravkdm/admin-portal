"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateContactStatus } from "@/actions/contact"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronRight } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "InProgress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
]

interface ContactRowProps {
  message: {
    Id: number
    FullName: string | null
    Email: string | null
    InquiryType: string | null
    Subject: string | null
    Message: string | null
    Status: string | null
    AdminNotes: string | null
    CreatedAt: Date | null
  }
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>
  const variant =
    status === "Pending"
      ? "destructive"
      : status === "Resolved" || status === "Closed"
        ? "default"
        : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}

export function ContactRow({ message }: ContactRowProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(message.Status || "Pending")
  const [adminNotes, setAdminNotes] = useState(message.AdminNotes || "")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await updateContactStatus(message.Id, status, adminNotes)
      toast({ title: "Success", description: "Contact status updated" })
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          e instanceof Error ? e.message : "Failed to update contact",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TableRow>
        <TableCell className="w-8 p-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>{message.FullName || "-"}</TableCell>
        <TableCell className="text-sm">{message.Email || "-"}</TableCell>
        <TableCell className="text-sm">{message.InquiryType || "-"}</TableCell>
        <TableCell className="max-w-[200px] truncate text-sm">
          {message.Subject || "-"}
        </TableCell>
        <TableCell>
          <StatusBadge status={message.Status} />
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {message.CreatedAt
            ? formatDistanceToNow(new Date(message.CreatedAt), {
                addSuffix: true,
              })
            : "-"}
        </TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/50 p-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Full Message
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {message.Message || "No message"}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes..."
                      rows={3}
                    />
                  </div>
                </div>
                <Button type="submit" variant="secondary" disabled={loading}>
                  {loading ? "Saving..." : "Update Status"}
                </Button>
              </form>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
