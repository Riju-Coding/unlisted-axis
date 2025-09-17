"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import AdminDashboard from "@/components/admin-dashboard"
import UserDashboard from "@/components/user-dashboard"
import { useAuth } from "@/context/auth-context"
import { SimpleLoader } from "@/components/simple-loader"

export default function DashboardPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, user, router])

  // Show full screen loader during initial auth check
  if (loading) {
    return <SimpleLoader />
  }

  // If no user, return null (will redirect via useEffect)
  if (!user) {
    return null
  }

  // Show dashboard based on role
  if (role === "admin") {
    return <AdminDashboard />
  } else if (role === "user") {
    return <UserDashboard />
  } else {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          Your role could not be determined or you do not have access to this page.
        </p>
        <Button onClick={() => signOut(auth)} className="mt-4">
          Sign Out
        </Button>
      </div>
    )
  }
}
