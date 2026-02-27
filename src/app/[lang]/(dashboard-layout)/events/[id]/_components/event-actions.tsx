"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  deleteEvent,
  toggleEventPublish,
  updateEventStatus,
} from "@/actions/events"
import { Eye, EyeOff, Trash2 } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Upcoming", label: "Upcoming" },
  { value: "On-Going", label: "On-Going" },
  { value: "Completed", label: "Completed" },
]

interface EventActionsProps {
  eventId: string
  isPublished: boolean
  status: string | null
}

export function EventActions({
  eventId,
  isPublished,
  status,
}: EventActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(
    action: string,
    fn: () => Promise<void>,
    successMessage: string
  ) {
    setLoading(action)
    try {
      await fn()
      toast({ title: "Success", description: successMessage })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : "Action failed",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <div className="p-6">
        <CardTitle>Actions</CardTitle>
        <CardDescription>
          Publish, update status, or delete event
        </CardDescription>
      </div>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status</p>
          <Select
            value={status || "Draft"}
            onValueChange={(value) => {
              void handleAction(
                "status",
                () => updateEventStatus(eventId, value),
                `Status updated to ${value}`
              )
            }}
            disabled={loading === "status"}
          >
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

        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={loading === "publish"}
          onClick={() =>
            handleAction(
              "publish",
              () => toggleEventPublish(eventId, !isPublished),
              isPublished ? "Event unpublished" : "Event published"
            )
          }
        >
          {isPublished ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish Event
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Publish Event
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full justify-start"
              disabled={loading === "delete"}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this event and all associated data
                (RSVPs, tickets, media). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
                  handleAction(
                    "delete",
                    async () => {
                      await deleteEvent(eventId)
                      router.push("/events")
                    },
                    "Event has been deleted"
                  )
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
