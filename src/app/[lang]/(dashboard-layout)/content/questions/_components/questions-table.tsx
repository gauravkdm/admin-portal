"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
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
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const questionSchema = z.object({
  QuestionText: z.string().min(1, "Question text is required"),
  Category: z.string().optional(),
  IsActive: z.boolean(),
  DisplayOrder: z.coerce.number().int().min(0, "Must be 0 or greater"),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface Question {
  Id: number
  QuestionText: string | null
  Category: string | null
  IsActive: boolean | null
  DisplayOrder: number | null
  CreatedAt: Date
  UpdatedAt: Date
}

interface QuestionsTableProps {
  questions: Question[]
}

export function QuestionsTable({ questions }: QuestionsTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      QuestionText: "",
      Category: "",
      IsActive: true,
      DisplayOrder: 0,
    },
  })

  function openAdd() {
    setEditingQuestion(null)
    form.reset({
      QuestionText: "",
      Category: "",
      IsActive: true,
      DisplayOrder: 0,
    })
    setDialogOpen(true)
  }

  function openEdit(question: Question) {
    setEditingQuestion(question)
    form.reset({
      QuestionText: question.QuestionText ?? "",
      Category: question.Category ?? "",
      IsActive: question.IsActive ?? true,
      DisplayOrder: question.DisplayOrder ?? 0,
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: QuestionFormValues) {
    setIsSubmitting(true)
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.Id, {
          QuestionText: values.QuestionText,
          Category: values.Category || undefined,
          IsActive: values.IsActive,
          DisplayOrder: values.DisplayOrder,
        })
        toast({ title: "Question updated" })
      } else {
        await createQuestion({
          QuestionText: values.QuestionText,
          Category: values.Category || undefined,
          IsActive: values.IsActive,
          DisplayOrder: values.DisplayOrder,
        })
        toast({ title: "Question created" })
      }
      setDialogOpen(false)
      router.refresh()
    } catch {
      toast({
        title: editingQuestion
          ? "Failed to update question"
          : "Failed to create question",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleActive(question: Question) {
    try {
      await updateQuestion(question.Id, { IsActive: !question.IsActive })
      toast({
        title: question.IsActive
          ? "Question deactivated"
          : "Question activated",
      })
      router.refresh()
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    }
  }

  async function handleDelete() {
    if (deleteId === null) return
    setIsSubmitting(true)
    try {
      await deleteQuestion(deleteId)
      toast({ title: "Question deleted" })
      setDeleteId(null)
      router.refresh()
    } catch {
      toast({ title: "Failed to delete question", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Question Text</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No questions found. Click &quot;Add Question&quot; to create
                  one.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.Id}>
                  <TableCell className="font-medium">
                    {question.QuestionText || "—"}
                  </TableCell>
                  <TableCell>
                    {question.Category ? (
                      <Badge variant="secondary">{question.Category}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={question.IsActive ?? false}
                      onCheckedChange={() => handleToggleActive(question)}
                    />
                  </TableCell>
                  <TableCell>{question.DisplayOrder ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(question)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(question.Id)}
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
              {editingQuestion ? "Edit Question" : "Add Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question details below."
                : "Fill in the details to create a new question."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="QuestionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the question..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Personal, Lifestyle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="DisplayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="IsActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Active</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    : editingQuestion
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
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. This action cannot be
              undone.
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
