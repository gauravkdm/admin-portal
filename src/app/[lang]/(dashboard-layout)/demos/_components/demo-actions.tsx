"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateDemoStatus } from "@/actions/demos"

import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Contacted", label: "Contacted" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
]

interface DemoActionsProps {
  demo: {
    Id: number
    Status: string | null
    AdminNotes: string | null
    ScheduledDemoAt: Date | null
  }
}

export function DemoActions({ demo }: DemoActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(demo.Status || "Pending")
  const [adminNotes, setAdminNotes] = useState(demo.AdminNotes || "")
  const [scheduledDemoAt, setScheduledDemoAt] = useState(
    demo.ScheduledDemoAt
      ? new Date(demo.ScheduledDemoAt).toISOString().slice(0, 16)
      : ""
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await updateDemoStatus(
        demo.Id,
        status,
        adminNotes,
        scheduledDemoAt ? new Date(scheduledDemoAt) : undefined
      )
      toast({ title: "Success", description: "Demo status updated" })
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to update demo",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Demo Status</DialogTitle>
          <DialogDescription>
            Change the status, schedule, and add admin notes for this demo
            request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>Scheduled Demo At</Label>
            <Input
              type="datetime-local"
              value={scheduledDemoAt}
              onChange={(e) => setScheduledDemoAt(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes for this demo request..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>
  const variant =
    status === "Pending"
      ? "destructive"
      : status === "Completed"
        ? "default"
        : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}
