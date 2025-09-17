"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

interface UserFormData {
  email: string
  displayName: string
  role: "admin" | "user"
  active: boolean
  emailVerified: boolean
}

export default function EditUserPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    displayName: "",
    role: "user",
    active: true,
    emailVerified: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [originalData, setOriginalData] = useState<UserFormData | null>(null)

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  useEffect(() => {
    if (userId && user && role === "admin") {
      fetchUser()
    }
  }, [userId, user, role])

  const fetchUser = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const userFormData = {
          email: userData.email || "",
          displayName: userData.displayName || "",
          role: userData.role || "user",
          active: userData.active !== undefined ? userData.active : true,
          emailVerified: userData.emailVerified || false,
        }
        setFormData(userFormData)
        setOriginalData(userFormData)
      } else {
        router.push("/dashboard/users")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      })
    } finally {
      setLoadingUser(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (!formData.displayName.trim()) {
        throw new Error("Display name is required")
      }

      // Update user document
      await updateDoc(doc(db, "users", userId), {
        displayName: formData.displayName.trim(),
        role: formData.role,
        active: formData.active,
        updatedAt: new Date(),
      })

      // Update role document if role changed
      if (originalData && formData.role !== originalData.role) {
        await updateDoc(doc(db, "roles", userId), {
          role: formData.role,
        })
      }

      setSuccess("User updated successfully!")
      setOriginalData(formData)

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/users")
      }, 2000)
    } catch (err: any) {
      console.error("Error updating user:", err)
      setError(err.message || "Failed to update user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingUser) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-[500px] w-full max-w-2xl" />
      </div>
    )
  }

  if (!user || role !== "admin") {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to edit users.</p>
      </div>
    )
  }

  const isOwnAccount = userId === user.uid

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold">Edit User</h1>
        <p className="text-muted-foreground">Update user information and permissions</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Update the user's information and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isOwnAccount} // Prevent changing own role
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {isOwnAccount && <p className="text-xs text-muted-foreground">You cannot change your own role</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed after account creation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInputChange("active", !formData.active)}
                    disabled={isOwnAccount} // Prevent deactivating own account
                  >
                    <Badge variant={formData.active ? "default" : "secondary"}>
                      {formData.active ? "Active" : "Inactive"}
                    </Badge>
                  </Button>
                  {isOwnAccount && (
                    <p className="text-xs text-muted-foreground">You cannot deactivate your own account</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Verification</Label>
                <div>
                  <Badge variant={formData.emailVerified ? "default" : "destructive"}>
                    {formData.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Email verification is managed by Firebase Auth</p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircledIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Updating User..." : "Update User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/users")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
