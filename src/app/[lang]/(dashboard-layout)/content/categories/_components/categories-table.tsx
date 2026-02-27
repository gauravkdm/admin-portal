"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createCategory,
  deleteCategory,
  updateCategory,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const categorySchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Description: z.string().optional(),
  Unicode: z.string().optional(),
  Color: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
  Id: number
  Name: string
  Description: string | null
  Unicode: string | null
  Color: string | null
}

interface CategoriesTableProps {
  categories: Category[]
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { Name: "", Description: "", Unicode: "", Color: "" },
  })

  function openAdd() {
    setEditingCategory(null)
    form.reset({ Name: "", Description: "", Unicode: "", Color: "" })
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat)
    form.reset({
      Name: cat.Name,
      Description: cat.Description ?? "",
      Unicode: cat.Unicode ?? "",
      Color: cat.Color ?? "",
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: CategoryFormValues) {
    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.Id, {
          Name: values.Name,
          Description: values.Description || undefined,
          Unicode: values.Unicode || undefined,
          Color: values.Color || undefined,
        })
        toast({ title: "Category updated" })
      } else {
        await createCategory({
          Name: values.Name,
          Description: values.Description || undefined,
          Unicode: values.Unicode || undefined,
          Color: values.Color || undefined,
        })
        toast({ title: "Category created" })
      }
      setDialogOpen(false)
      router.refresh()
    } catch {
      toast({
        title: editingCategory
          ? "Failed to update category"
          : "Failed to create category",
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
      await deleteCategory(deleteId)
      toast({ title: "Category deleted" })
      setDeleteId(null)
      router.refresh()
    } catch {
      toast({ title: "Failed to delete category", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Unicode</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No categories found. Click &quot;Add Category&quot; to create
                  one.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.Id}>
                  <TableCell className="font-medium">{cat.Name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cat.Description || "—"}
                  </TableCell>
                  <TableCell>{cat.Unicode || "—"}</TableCell>
                  <TableCell>
                    {cat.Color ? (
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: cat.Color,
                          color: "#fff",
                          border: "none",
                        }}
                      >
                        {cat.Color}
                      </Badge>
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
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(cat.Id)}
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
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Fill in the details to create a new category."}
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
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="Unicode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unicode Emoji</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 🎉" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. #FF5733" {...field} />
                      </FormControl>
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
                    : editingCategory
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;
              {categories.find((c) => c.Id === deleteId)?.Name ?? "this"}
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
