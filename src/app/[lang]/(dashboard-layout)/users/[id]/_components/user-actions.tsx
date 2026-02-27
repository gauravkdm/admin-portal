"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  deleteUser,
  deleteUserTokens,
  updateUserVerification,
} from "@/actions/users"
import { CheckCircle, LogOut, Trash2, XCircle } from "lucide-react"

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

interface UserActionsProps {
  user: {
    Id: string
    IsVerified: boolean
    UserTokens: Array<{ Id: number }>
  }
}

export function UserActions({ user }: UserActionsProps) {
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
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <CardTitle>Verification</CardTitle>
          <CardDescription>Manage user verification status</CardDescription>
        </div>
        <CardContent className="space-y-3">
          {user.IsVerified ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={loading === "unverify"}
              onClick={() =>
                handleAction(
                  "unverify",
                  () => updateUserVerification(user.Id, false),
                  "User has been unverified"
                )
              }
            >
              <XCircle className="mr-2 h-4 w-4" />
              Remove Verification
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={loading === "verify"}
              onClick={() =>
                handleAction(
                  "verify",
                  () => updateUserVerification(user.Id, true),
                  "User has been verified"
                )
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify User
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <div className="p-6">
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            {user.UserTokens.length} active token
            {user.UserTokens.length !== 1 ? "s" : ""}
          </CardDescription>
        </div>
        <CardContent>
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={loading === "logout" || user.UserTokens.length === 0}
            onClick={() =>
              handleAction(
                "logout",
                () => deleteUserTokens(user.Id),
                "All sessions have been invalidated"
              )
            }
          >
            <LogOut className="mr-2 h-4 w-4" />
            Force Logout (Invalidate All Tokens)
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <div className="p-6">
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </div>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this user and all associated
                  data. This action cannot be undone.
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
                        await deleteUser(user.Id)
                        router.push("/users")
                      },
                      "User has been deleted"
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
    </div>
  )
}
