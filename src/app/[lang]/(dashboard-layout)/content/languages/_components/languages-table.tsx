"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createLanguage,
  deleteLanguage,
  updateLanguage,
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

const languageSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Code: z.string().optional(),
})

type LanguageFormValues = z.infer<typeof languageSchema>

interface Language {
  Id: number
  Name: string | null
  Code: string | null
}

interface LanguagesTableProps {
  languages: Language[]
}

export function LanguagesTable({ languages }: LanguagesTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: { Name: "", Code: "" },
  })

  function openAdd() {
    setEditingLanguage(null)
    form.reset({ Name: "", Code: "" })
    setDialogOpen(true)
  }

  function openEdit(language: Language) {
    setEditingLanguage(language)
    form.reset({
      Name: language.Name ?? "",
      Code: language.Code ?? "",
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: LanguageFormValues) {
    setIsSubmitting(true)
    try {
      if (editingLanguage) {
        await updateLanguage(editingLanguage.Id, {
          Name: values.Name,
          Code: values.Code || undefined,
        })
        toast({ title: "Language updated" })
      } else {
        await createLanguage({
          Name: values.Name,
          Code: values.Code || undefined,
        })
        toast({ title: "Language created" })
      }
      setDialogOpen(false)
      router.refresh()
    } catch {
      toast({
        title: editingLanguage
          ? "Failed to update language"
          : "Failed to create language",
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
      await deleteLanguage(deleteId)
      toast({ title: "Language deleted" })
      setDeleteId(null)
      router.refresh()
    } catch {
      toast({ title: "Failed to delete language", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-8 text-center text-muted-foreground"
                >
                  No languages found. Click &quot;Add Language&quot; to create
                  one.
                </TableCell>
              </TableRow>
            ) : (
              languages.map((language) => (
                <TableRow key={language.Id}>
                  <TableCell className="font-medium">
                    {language.Name || "—"}
                  </TableCell>
                  <TableCell>
                    {language.Code ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                        {language.Code}
                      </code>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(language)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(language.Id)}
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
              {editingLanguage ? "Edit Language" : "Add Language"}
            </DialogTitle>
            <DialogDescription>
              {editingLanguage
                ? "Update the language details below."
                : "Fill in the details to create a new language."}
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
                      <Input placeholder="Language name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. en, es, fr" {...field} />
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
                    : editingLanguage
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
            <AlertDialogTitle>Delete language?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {languages.find((l) => l.Id === deleteId)?.Name ?? "this"}
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
