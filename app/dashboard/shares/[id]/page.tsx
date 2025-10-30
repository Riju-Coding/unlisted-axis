"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Edit, DollarSign, IndianRupee } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

interface Share {
  id: string
  logo: string
  sharesName: string
  depository: string
  minimumLotSize: number
  description: string
  status: string
  createdAt: any
}

interface PriceHistory {
  id: string
  price: number
  timestamp: any
  changeType: string
  updatedBy: string
}

export default function ShareDetailsPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const shareId = params.id as string

  const [share, setShare] = useState<Share | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loadingShare, setLoadingShare] = useState(true)
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  useEffect(() => {
    if (shareId && user && role === "admin") {
      fetchShareDetails()
      fetchPriceHistory()
    }
  }, [shareId, user, role])

  const fetchShareDetails = async () => {
    try {
      const shareDoc = await getDoc(doc(db, "shares", shareId))
      if (shareDoc.exists()) {
        setShare({ id: shareDoc.id, ...shareDoc.data() } as Share)
      } else {
        router.push("/dashboard/shares")
      }
    } catch (error) {
      console.error("Error fetching share details:", error)
    } finally {
      setLoadingShare(false)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      const pricesQuery = query(
        collection(db, "sharePrices"),
        where("shareId", "==", shareId),
        orderBy("timestamp", "desc"),
      )
      const pricesSnapshot = await getDocs(pricesQuery)

      const prices = pricesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PriceHistory[]

      setPriceHistory(prices)
      if (prices.length > 0) {
        setCurrentPrice(prices[0].price)
      }
    } catch (error) {
      console.error("Error fetching price history:", error)
    } finally {
      setLoadingPrices(false)
    }
  }

  const toggleShareStatus = async () => {
    if (!share) return

    try {
      const newStatus = share.status === "active" ? "inactive" : "active"
      await updateDoc(doc(db, "shares", shareId), {
        status: newStatus,
      })

      setShare((prev) => (prev ? { ...prev, status: newStatus } : null))
    } catch (error) {
      console.error("Error updating share status:", error)
    }
  }

  const getPriceChangeIndicator = (currentPrice: number, previousPrice: number) => {
    if (currentPrice > previousPrice) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-500" />,
        color: "text-green-500",
        change: "increase",
      }
    } else if (currentPrice < previousPrice) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-500" />,
        color: "text-red-500",
        change: "decrease",
      }
    } else {
      return {
        icon: <Minus className="h-4 w-4 text-gray-500" />,
        color: "text-gray-500",
        change: "no_change",
      }
    }
  }

  const calculatePriceChange = (current: number, previous: number) => {
    const change = current - previous
    const percentage = ((change / previous) * 100).toFixed(2)
    return { change: change.toFixed(2), percentage }
  }

  if (loading || loadingShare) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  if (!user || role !== "admin" || !share) {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have access to view this share.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/shares"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shares
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{share.sharesName}</h1>
            <p className="text-muted-foreground">Share Details & Price History</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/shares/${shareId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Share
              </Button>
            </Link>
            <Link href={`/dashboard/shares/${shareId}/update-price`}>
              <Button>
                <IndianRupee className="mr-2 h-4 w-4" />
                Update Price
              </Button>
            </Link>
            <Button variant={share.status === "active" ? "destructive" : "default"} onClick={toggleShareStatus}>
              {share.status === "active" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Share Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {share.logo && (
                <img
                  src={share.logo || "/placeholder.svg"}
                  alt={share.sharesName}
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
              Share Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Share Name</p>
                <p className="font-semibold">{share.sharesName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={share.status === "active" ? "default" : "secondary"}>{share.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Depository</p>
                <p className="font-semibold">{share.depository}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Min. Lot Size</p>
                <p className="font-semibold">{share.minimumLotSize}</p>
              </div>
            </div>
            {share.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{share.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Price */}
        <Card>
          <CardHeader>
            <CardTitle>Current Price</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPrices ? (
              <Skeleton className="h-16 w-full" />
            ) : currentPrice ? (
              <div className="space-y-4">
                <div className="text-3xl font-bold">₹{currentPrice.toFixed(2)}</div>
                {priceHistory.length > 1 && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const indicator = getPriceChangeIndicator(priceHistory[0].price, priceHistory[1].price)
                      const change = calculatePriceChange(priceHistory[0].price, priceHistory[1].price)
                      return (
                        <>
                          {indicator.icon}
                          <span className={indicator.color}>
                            ₹{change.change} ({change.percentage}%)
                          </span>
                          <span className="text-sm text-muted-foreground">from last update</span>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No price data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price History */}
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
          <CardDescription>Historical price changes and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPrices ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : priceHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No price history available</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.map((price, index) => {
                  const previousPrice = priceHistory[index + 1]
                  const indicator = previousPrice ? getPriceChangeIndicator(price.price, previousPrice.price) : null
                  const change = previousPrice ? calculatePriceChange(price.price, previousPrice.price) : null

                  return (
                    <TableRow key={price.id}>
                      <TableCell>
                        {price.timestamp?.toDate ? format(price.timestamp.toDate(), "MMM dd, yyyy 'at' HH:mm") : "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold">₹{price.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {change ? (
                          <span className={indicator?.color}>
                            ₹{change.change} ({change.percentage}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {indicator ? (
                          <div className="flex items-center">{indicator.icon}</div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {price.changeType}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
