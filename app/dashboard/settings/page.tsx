"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Save, Mail, TestTube } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

interface SMTPSettings {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromEmail: string
  fromName: string
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromEmail: "",
    fromName: "Unlisted Axis",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchSmtpSettings()
    }
  }, [user])

  const fetchSmtpSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "smtp"))
      if (settingsDoc.exists()) {
        setSmtpSettings(settingsDoc.data() as SMTPSettings)
      }
    } catch (error) {
      console.error("Error fetching SMTP settings:", error)
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleInputChange = (field: keyof SMTPSettings, value: string | number | boolean) => {
    setSmtpSettings((prev) => ({
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
      if (!smtpSettings.host.trim()) {
        throw new Error("SMTP host is required")
      }
      if (!smtpSettings.user.trim()) {
        throw new Error("SMTP username is required")
      }
      if (!smtpSettings.fromEmail.trim()) {
        throw new Error("From email is required")
      }

      await setDoc(doc(db, "settings", "smtp"), {
        ...smtpSettings,
        updatedAt: new Date(),
        updatedBy: user.uid,
      })

      setSuccess("SMTP settings saved successfully!")

      toast({
        title: "Success",
        description: "SMTP settings have been saved",
      })
    } catch (err: any) {
      console.error("Error saving SMTP settings:", err)
      setError(err.message || "Failed to save SMTP settings. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const testSmtpConnection = async () => {
    setIsTesting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/test-smtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          smtpSettings,
          testEmail: user.email,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess("Test email sent successfully! Check your inbox.")
        toast({
          title: "Success",
          description: "Test email sent successfully",
        })
      } else {
        throw new Error(result.error || "Failed to send test email")
      }
    } catch (err: any) {
      console.error("Error testing SMTP:", err)
      setError(err.message || "Failed to test SMTP connection")
    } finally {
      setIsTesting(false)
    }
  }

  if (loading || loadingSettings) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smtp">Email Settings</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails. Leave empty to use the default free email service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input
                      id="host"
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={smtpSettings.host}
                      onChange={(e) => handleInputChange("host", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      placeholder="587"
                      value={smtpSettings.port}
                      onChange={(e) => handleInputChange("port", Number.parseInt(e.target.value) || 587)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">Username</Label>
                    <Input
                      id="user"
                      type="text"
                      placeholder="your-email@gmail.com"
                      value={smtpSettings.user}
                      onChange={(e) => handleInputChange("user", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your app password"
                      value={smtpSettings.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="noreply@yourcompany.com"
                      value={smtpSettings.fromEmail}
                      onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      type="text"
                      placeholder="Unlisted Axis"
                      value={smtpSettings.fromName}
                      onChange={(e) => handleInputChange("fromName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={smtpSettings.secure}
                    onChange={(e) => handleInputChange("secure", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="secure" className="text-sm">
                    Use SSL/TLS (recommended for port 465)
                  </Label>
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
                    {isSubmitting ? "Saving..." : "Save SMTP Settings"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testSmtpConnection}
                    disabled={isTesting || !smtpSettings.host}
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    {isTesting ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Popular SMTP Settings:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Gmail:</strong> smtp.gmail.com, Port 587, Use app password
                  </p>
                  <p>
                    <strong>Outlook:</strong> smtp-mail.outlook.com, Port 587
                  </p>
                  <p>
                    <strong>Yahoo:</strong> smtp.mail.yahoo.com, Port 587
                  </p>
                  <p>
                    <strong>SendGrid:</strong> smtp.sendgrid.net, Port 587
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings will be available in future updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
