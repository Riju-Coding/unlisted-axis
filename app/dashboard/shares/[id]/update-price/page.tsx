"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"

interface Share {
  id: string
  sharesName: string
  currentPrice?: number
}

export default function UpdatePricePage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const params = useParams()

  const shareId = params?.id as string

  const [share, setShare] = useState<Share | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [newPrice, setNewPrice] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [customDateTime, setCustomDateTime] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingShare, setLoadingShare] = useState(true)

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  useEffect(() => {
    if (shareId && user && role === "admin") {
      fetchShareAndCurrentPrice()
    } else if (!shareId && !loading) {
      // If shareId is not available, stop loading
      setLoadingShare(false)
    }
  }, [shareId, user, role, loading])

  const fetchShareAndCurrentPrice = async () => {
    try {
      const shareDoc = await getDoc(doc(db, "shares", shareId))
      if (!shareDoc.exists()) {
        router.push("/dashboard/shares")
        return
      }

      const shareData = { id: shareDoc.id, ...shareDoc.data() } as Share

      const pricesQuery = query(
        collection(db, "sharePrices"),
        where("shareId", "==", shareId),
        orderBy("timestamp", "desc"),
        limit(1),
      )
      const pricesSnapshot = await getDocs(pricesQuery)

      if (!pricesSnapshot.empty) {
        const latestPrice = pricesSnapshot.docs[0].data().price
        shareData.currentPrice = latestPrice
        setCurrentPrice(latestPrice)
      }

      setShare(shareData)
    } catch (error) {
      console.error("Error fetching share and price:", error)
    } finally {
      setLoadingShare(false)
    }
  }

  const getChangeType = (newPrice: number, oldPrice: number) => {
    if (newPrice > oldPrice) return "increase"
    if (newPrice < oldPrice) return "decrease"
    return "no_change"
  }

  const getPriceChangeIndicator = (newPrice: number, oldPrice: number) => {
    const changeType = getChangeType(newPrice, oldPrice)
    const change = newPrice - oldPrice
    const percentage = oldPrice > 0 ? ((change / oldPrice) * 100).toFixed(2) : "0.00"

    if (changeType === "increase") {
      return {
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        color: "text-green-500",
        text: `+₹${change.toFixed(2)} (+${percentage}%)`,
      }
    } else if (changeType === "decrease") {
      return {
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
        color: "text-red-500",
        text: `-₹${Math.abs(change).toFixed(2)} (-${Math.abs(Number(percentage))}%)`,
      }
    } else {
      return {
        icon: <Minus className="h-5 w-5 text-gray-500" />,
        color: "text-gray-500",
        text: "No change",
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const priceValue = Number.parseFloat(newPrice)

      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Please enter a valid price greater than 0")
      }

      if (priceValue === currentPrice) {
        throw new Error("New price cannot be the same as current price")
      }

      if (!customDateTime) {
        throw new Error("Please select a date and time for the price update")
      }

      const selectedDate = new Date(customDateTime)
      const now = new Date()

      if (selectedDate > now) {
        throw new Error("Cannot set a future date for price updates")
      }

      const changeType = getChangeType(priceValue, currentPrice)

      const customTimestamp = Timestamp.fromDate(selectedDate)

      await addDoc(collection(db, "sharePrices"), {
        shareId: shareId,
        price: priceValue,
        timestamp: customTimestamp,
        updatedBy: user.uid,
        changeType: changeType,
        reason: reason.trim() || null,
      })

      setSuccess("Price updated successfully!")

      setNewPrice("")
      setReason("")
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setCustomDateTime(localDateTime)
      setCurrentPrice(priceValue)

      setTimeout(() => {
        router.push(`/dashboard/shares/${shareId}`)
      }, 2000)
    } catch (err: any) {
      console.error("Error updating price:", err)
      setError(err.message || "Failed to update price. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingShare || !shareId) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-[400px] w-full max-w-2xl" />
      </div>
    )
  }

  if (!user || role !== "admin" || !share) {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have access to update prices.</p>
      </div>
    )
  }

  const newPriceValue = Number.parseFloat(newPrice)
  const showPreview = !isNaN(newPriceValue) && newPriceValue > 0 && newPriceValue !== currentPrice

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <Link
          href={`/dashboard/shares/${shareId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Share Details
        </Link>
        <h1 className="text-2xl font-bold">Update Price</h1>
        <p className="text-muted-foreground">{share.sharesName}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Price</CardTitle>
            <CardDescription>Latest recorded price for this share</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{currentPrice.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Update Price</CardTitle>
            <CardDescription>Enter the new price and date/time for this share</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPrice">New Price (₹) *</Label>
                <Input
                  id="newPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={newPrice}
                  onChange={(e) => {
                    setNewPrice(e.target.value)
                    setError(null)
                    setSuccess(null)
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDateTime">Date & Time *</Label>
                <Input
                  id="customDateTime"
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => {
                    setCustomDateTime(e.target.value)
                    setError(null)
                    setSuccess(null)
                  }}
                  max={new Date().toISOString().slice(0, 16)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Select the date and time when this price change occurred. Cannot be in the future.
                </p>
              </div>

              {showPreview && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Price Change Preview</h4>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const indicator = getPriceChangeIndicator(newPriceValue, currentPrice)
                      return (
                        <>
                          {indicator.icon}
                          <span className={indicator.color}>{indicator.text}</span>
                        </>
                      )
                    })()}
                  </div>
                  {customDateTime && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Effective Date: {new Date(customDateTime).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Price Change</Label>
                <Textarea
                  id="reason"
                  placeholder="Optional: Explain the reason for this price change..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
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
                  {isSubmitting ? "Updating Price..." : "Update Price"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/shares/${shareId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
