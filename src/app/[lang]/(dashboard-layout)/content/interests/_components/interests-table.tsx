"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createInterest,
  deleteInterest,
  updateInterest,
} from "@/actions/content"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Pencil, Plus, Trash2 } from "lucide-react"

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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const interestSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Unicode: z.string().optional(),
})

type InterestFormValues = z.infer<typeof interestSchema>

interface Interest {
  Id: number
  Name: string | null
  Unicode: string | null
}

interface InterestsTableProps {
  interests: Interest[]
}

export function InterestsTable({ interests }: InterestsTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<InterestFormValues>({
    resolver: zodResolver(interestSchema),
    defaultValues: { Name: "", Unicode: "" },
  })

  function openAdd() {
    setEditingInterest(null)
    form.reset({ Name: "", Unicode: "" })
    setDialogOpen(true)
  }

  function openEdit(interest: Interest) {
    setEditingInterest(interest)
    form.reset({
      Name: interest.Name ?? "",
      Unicode: interest.Unicode ?? "",
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: InterestFormValues) {
    setIsSubmitting(true)
    try {
      if (editingInterest) {
        await updateInterest(editingInterest.Id, {
          Name: values.Name,
          Unicode: values.Unicode || undefined,
        })
        toast({ title: "Interest updated" })
      } else {
        await createInterest({
          Name: values.Name,
          Unicode: values.Unicode || undefined,
        })
        toast({ title: "Interest created" })
      }
      setDialogOpen(false)
      router.refresh()
    } catch {
      toast({
        title: editingInterest
          ? "Failed to update interest"
          : "Failed to create interest",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (deleteId === null) return
    setIsSubmitting(true)
    try {
      await deleteInterest(deleteId)
      toast({ title: "Interest deleted" })
      setDeleteId(null)
      router.refresh()
    } catch {
      toast({ title: "Failed to delete interest", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Interest
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unicode</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No interests found. Click &quot;Add Interest&quot; to create
                  one.
                </TableCell>
              </TableRow>
            ) : (
              interests.map((interest) => (
                <TableRow key={interest.Id}>
                  <TableCell className="font-medium">
                    {interest.Name || "—"}
                  </TableCell>
                  <TableCell>{interest.Unicode || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(interest)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(interest.Id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInterest ? "Edit Interest" : "Add Interest"}
            </DialogTitle>
            <DialogDescription>
              {editingInterest
                ? "Update the interest details below."
                : "Fill in the details to create a new interest."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Interest name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Unicode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unicode Emoji</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 🎯" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : editingInterest
                      ? "Update"
                      : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete interest?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {interests.find((i) => i.Id === deleteId)?.Name ?? "this"}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault()
                await handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
