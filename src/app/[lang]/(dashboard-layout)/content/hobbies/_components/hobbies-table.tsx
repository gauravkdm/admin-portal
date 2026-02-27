"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createHobby, deleteHobby, updateHobby } from "@/actions/content"
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

const hobbySchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Unicode: z.string().optional(),
})

type HobbyFormValues = z.infer<typeof hobbySchema>

interface Hobby {
  Id: number
  Name: string | null
  Unicode: string | null
}

interface HobbiesTableProps {
  hobbies: Hobby[]
}

export function HobbiesTable({ hobbies }: HobbiesTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHobby, setEditingHobby] = useState<Hobby | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<HobbyFormValues>({
    resolver: zodResolver(hobbySchema),
    defaultValues: { Name: "", Unicode: "" },
  })

  function openAdd() {
    setEditingHobby(null)
    form.reset({ Name: "", Unicode: "" })
    setDialogOpen(true)
  }

  function openEdit(hobby: Hobby) {
    setEditingHobby(hobby)
    form.reset({
      Name: hobby.Name ?? "",
      Unicode: hobby.Unicode ?? "",
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: HobbyFormValues) {
    setIsSubmitting(true)
    try {
      if (editingHobby) {
        await updateHobby(editingHobby.Id, {
          Name: values.Name,
          Unicode: values.Unicode || undefined,
        })
        toast({ title: "Hobby updated" })
      } else {
        await createHobby({
          Name: values.Name,
          Unicode: values.Unicode || undefined,
        })
        toast({ title: "Hobby created" })
      }
      setDialogOpen(false)
      router.refresh()
    } catch {
      toast({
        title: editingHobby
          ? "Failed to update hobby"
          : "Failed to create hobby",
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
      await deleteHobby(deleteId)
      toast({ title: "Hobby deleted" })
      setDeleteId(null)
      router.refresh()
    } catch {
      toast({ title: "Failed to delete hobby", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hobby
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
            {hobbies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No hobbies found. Click &quot;Add Hobby&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              hobbies.map((hobby) => (
                <TableRow key={hobby.Id}>
                  <TableCell className="font-medium">
                    {hobby.Name || "—"}
                  </TableCell>
                  <TableCell>{hobby.Unicode || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(hobby)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(hobby.Id)}
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
              {editingHobby ? "Edit Hobby" : "Add Hobby"}
            </DialogTitle>
            <DialogDescription>
              {editingHobby
                ? "Update the hobby details below."
                : "Fill in the details to create a new hobby."}
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
                      <Input placeholder="Hobby name" {...field} />
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
                      <Input placeholder="e.g. 🎨" {...field} />
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
                    : editingHobby
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
            <AlertDialogTitle>Delete hobby?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {hobbies.find((h) => h.Id === deleteId)?.Name ?? "this"}
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
