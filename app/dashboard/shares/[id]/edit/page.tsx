"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ShareFormData {
  logo: string
  sharesName: string
  depository: string
  minimumLotSize: number
  description: string
  status: string
  currentPrice: number
  website: string
  blogUrl: string
  sector: string
  category: string
  marketCap: number
  weekHigh52: number
  weekLow52: number
  panNumber: string
  isinNumber: string
  cin: string
  rta: string
  peRatio: number
  pbRatio: number
  debtToEquity: number
  roe: number
  bookValue: number
  faceValue: number
  totalShares: number
}

interface NewsUpdate {
  id?: string
  title: string
  content: string
  category: string
  priority: string
  publishDate: string
  isActive: boolean
}

interface PeerComparison {
  id?: string
  companyName: string
  currentPrice: number
  marketCap: number
  peRatio: number
  pbRatio: number
  roe: number
  debtToEquity: number
}

export default function EditSharePage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const shareId = params.id as string

  const [formData, setFormData] = useState<ShareFormData>({
    logo: "",
    sharesName: "",
    depository: "",
    minimumLotSize: 1,
    description: "",
    status: "active",
    currentPrice: 0,
    website: "",
    blogUrl: "",
    sector: "",
    category: "",
    marketCap: 0,
    weekHigh52: 0,
    weekLow52: 0,
    panNumber: "",
    isinNumber: "",
    cin: "",
    rta: "",
    peRatio: 0,
    pbRatio: 0,
    debtToEquity: 0,
    roe: 0,
    bookValue: 0,
    faceValue: 10,
    totalShares: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingShare, setLoadingShare] = useState(true)
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([])
  const [peerComparisons, setPeerComparisons] = useState<PeerComparison[]>([])
  const [newNewsUpdate, setNewNewsUpdate] = useState<NewsUpdate>({
    title: "",
    content: "",
    category: "announcement",
    priority: "medium",
    publishDate: new Date().toISOString().split("T")[0],
    isActive: true,
  })
  const [newPeerComparison, setNewPeerComparison] = useState<PeerComparison>({
    companyName: "",
    currentPrice: 0,
    marketCap: 0,
    peRatio: 0,
    pbRatio: 0,
    roe: 0,
    debtToEquity: 0,
  })

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  useEffect(() => {
    if (shareId && user && role === "admin") {
      fetchShareDetails()
    }
  }, [shareId, user, role])

  const fetchShareDetails = async () => {
    try {
      const shareDoc = await getDoc(doc(db, "shares", shareId))
      if (shareDoc.exists()) {
        const shareData = shareDoc.data()
        setFormData({
          logo: shareData.logo || "",
          sharesName: shareData.sharesName || "",
          depository: shareData.depository || "",
          minimumLotSize: shareData.minimumLotSize || 1,
          description: shareData.description || "",
          status: shareData.status || "active",
          currentPrice: shareData.currentPrice || 0,
          website: shareData.website || "",
          blogUrl: shareData.blogUrl || "",
          sector: shareData.sector || "",
          category: shareData.category || "",
          marketCap: shareData.marketCap || 0,
          weekHigh52: shareData.weekHigh52 || 0,
          weekLow52: shareData.weekLow52 || 0,
          panNumber: shareData.panNumber || "",
          isinNumber: shareData.isinNumber || "",
          cin: shareData.cin || "",
          rta: shareData.rta || "",
          peRatio: shareData.peRatio || 0,
          pbRatio: shareData.pbRatio || 0,
          debtToEquity: shareData.debtToEquity || 0,
          roe: shareData.roe || 0,
          bookValue: shareData.bookValue || 0,
          faceValue: shareData.faceValue || 10,
          totalShares: shareData.totalShares || 0,
        })

        await fetchNewsUpdates()
        await fetchPeerComparisons()
      } else {
        router.push("/dashboard/shares")
      }
    } catch (error) {
      console.error("Error fetching share details:", error)
    } finally {
      setLoadingShare(false)
    }
  }

  const fetchNewsUpdates = async () => {
    try {
      const newsQuery = query(collection(db, "news"), where("shareId", "==", shareId))
      const newsSnapshot = await getDocs(newsQuery)
      const news = newsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as NewsUpdate)
      setNewsUpdates(news)
    } catch (error) {
      console.error("Error fetching news updates:", error)
    }
  }

  const fetchPeerComparisons = async () => {
    try {
      const peerQuery = query(collection(db, "peerComparisons"), where("shareId", "==", shareId))
      const peerSnapshot = await getDocs(peerQuery)
      const peers = peerSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as PeerComparison)
      setPeerComparisons(peers)
    } catch (error) {
      console.error("Error fetching peer comparisons:", error)
    }
  }

  const addNewsUpdate = async () => {
    try {
      if (!newNewsUpdate.title.trim() || !newNewsUpdate.content.trim()) {
        setError("Title and content are required for news updates")
        return
      }

      await addDoc(collection(db, "news"), {
        ...newNewsUpdate,
        shareId,
        createdAt: new Date(),
        createdBy: user.uid,
      })

      setNewNewsUpdate({
        title: "",
        content: "",
        category: "announcement",
        priority: "medium",
        publishDate: new Date().toISOString().split("T")[0],
        isActive: true,
      })

      await fetchNewsUpdates()
      setSuccess("News update added successfully!")
    } catch (error) {
      console.error("Error adding news update:", error)
      setError("Failed to add news update")
    }
  }

  const deleteNewsUpdate = async (newsId: string) => {
    try {
      await deleteDoc(doc(db, "news", newsId))
      await fetchNewsUpdates()
      setSuccess("News update deleted successfully!")
    } catch (error) {
      console.error("Error deleting news update:", error)
      setError("Failed to delete news update")
    }
  }

  const addPeerComparison = async () => {
    try {
      if (!newPeerComparison.companyName.trim()) {
        setError("Company name is required for peer comparison")
        return
      }

      await addDoc(collection(db, "peerComparisons"), {
        ...newPeerComparison,
        shareId,
        createdAt: new Date(),
        createdBy: user.uid,
      })

      setNewPeerComparison({
        companyName: "",
        currentPrice: 0,
        marketCap: 0,
        peRatio: 0,
        pbRatio: 0,
        roe: 0,
        debtToEquity: 0,
      })

      await fetchPeerComparisons()
      setSuccess("Peer comparison added successfully!")
    } catch (error) {
      console.error("Error adding peer comparison:", error)
      setError("Failed to add peer comparison")
    }
  }

  const deletePeerComparison = async (peerId: string) => {
    try {
      await deleteDoc(doc(db, "peerComparisons", peerId))
      await fetchPeerComparisons()
      setSuccess("Peer comparison deleted successfully!")
    } catch (error) {
      console.error("Error deleting peer comparison:", error)
      setError("Failed to delete peer comparison")
    }
  }

  const handleInputChange = (field: keyof ShareFormData, value: string | number) => {
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
      if (!formData.sharesName.trim()) {
        throw new Error("Share name is required")
      }
      if (!formData.depository.trim()) {
        throw new Error("Depository is required")
      }
      if (formData.minimumLotSize <= 0) {
        throw new Error("Minimum lot size must be greater than 0")
      }
      if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        throw new Error("PAN number must be in format: AAKCA9053A")
      }
      if (formData.isinNumber && !/^[A-Z]{2}[A-Z0-9]{9}[0-9]{1}$/.test(formData.isinNumber)) {
        throw new Error("ISIN number must be in format: INE0OTC01025")
      }

      await updateDoc(doc(db, "shares", shareId), {
        logo: formData.logo.trim(),
        sharesName: formData.sharesName.trim(),
        depository: formData.depository.trim(),
        minimumLotSize: formData.minimumLotSize,
        description: formData.description.trim(),
        status: formData.status,
        currentPrice: formData.currentPrice,
        website: formData.website.trim(),
        blogUrl: formData.blogUrl.trim(),
        sector: formData.sector.trim(),
        category: formData.category.trim(),
        marketCap: formData.marketCap,
        weekHigh52: formData.weekHigh52,
        weekLow52: formData.weekLow52,
        panNumber: formData.panNumber.trim(),
        isinNumber: formData.isinNumber.trim(),
        cin: formData.cin.trim(),
        rta: formData.rta.trim(),
        peRatio: formData.peRatio,
        pbRatio: formData.pbRatio,
        debtToEquity: formData.debtToEquity,
        roe: formData.roe,
        bookValue: formData.bookValue,
        faceValue: formData.faceValue,
        totalShares: formData.totalShares,
        updatedAt: new Date(),
        updatedBy: user.uid,
      })

      setSuccess("Share updated successfully!")

      setTimeout(() => {
        router.push(`/dashboard/shares/${shareId}`)
      }, 2000)
    } catch (err: any) {
      console.error("Error updating share:", err)
      setError(err.message || "Failed to update share. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingShare) {
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
        <p className="text-muted-foreground">You do not have access to edit shares.</p>
      </div>
    )
  }

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
        <h1 className="text-2xl font-bold">Edit Share</h1>
        <p className="text-muted-foreground">Update share information</p>
      </div>

      <Tabs defaultValue="share-details" className="max-w-6xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="share-details">Share Details</TabsTrigger>
          <TabsTrigger value="news-updates">News & Updates</TabsTrigger>
          <TabsTrigger value="peer-comparison">Peer Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="share-details">
          <Card>
            <CardHeader>
              <CardTitle>Share Details</CardTitle>
              <CardDescription>Update the details for this share</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sharesName">Share Name *</Label>
                      <Input
                        id="sharesName"
                        type="text"
                        placeholder="e.g., ABC Private Limited"
                        value={formData.sharesName}
                        onChange={(e) => handleInputChange("sharesName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="delisted">Delisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector</Label>
                      <Input
                        id="sector"
                        type="text"
                        placeholder="e.g., Technology, Healthcare"
                        value={formData.sector}
                        onChange={(e) => handleInputChange("sector", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        type="text"
                        placeholder="e.g., Large Cap, Mid Cap"
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blogUrl">Blog URL</Label>
                      <Input
                        id="blogUrl"
                        type="url"
                        placeholder="https://blog.company.com"
                        value={formData.blogUrl}
                        onChange={(e) => handleInputChange("blogUrl", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={formData.logo}
                      onChange={(e) => handleInputChange("logo", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Optional: URL to the company logo</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description about the company and shares..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Trading Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="depository">Depository *</Label>
                      <Select
                        value={formData.depository}
                        onValueChange={(value) => handleInputChange("depository", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select depository" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NSDL">NSDL</SelectItem>
                          <SelectItem value="CDSL">CDSL</SelectItem>
                          <SelectItem value="Physical">Physical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimumLotSize">Minimum Lot Size *</Label>
                      <Input
                        id="minimumLotSize"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.minimumLotSize || ""}
                        onChange={(e) => handleInputChange("minimumLotSize", Number.parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalShares">Total Shares</Label>
                      <Input
                        id="totalShares"
                        type="number"
                        min="0"
                        placeholder="68465270"
                        value={formData.totalShares || ""}
                        onChange={(e) => handleInputChange("totalShares", Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Price Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPrice">Current Price (₹)</Label>
                      <Input
                        id="currentPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="325.00"
                        value={formData.currentPrice || ""}
                        onChange={(e) => handleInputChange("currentPrice", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weekHigh52">52 Week High (₹)</Label>
                      <Input
                        id="weekHigh52"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="415.00"
                        value={formData.weekHigh52 || ""}
                        onChange={(e) => handleInputChange("weekHigh52", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weekLow52">52 Week Low (₹)</Label>
                      <Input
                        id="weekLow52"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="325.00"
                        value={formData.weekLow52 || ""}
                        onChange={(e) => handleInputChange("weekLow52", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faceValue">Face Value (₹)</Label>
                      <Input
                        id="faceValue"
                        type="number"
                        min="0"
                        placeholder="10"
                        value={formData.faceValue || ""}
                        onChange={(e) => handleInputChange("faceValue", Number.parseInt(e.target.value) || 10)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bookValue">Book Value (₹)</Label>
                      <Input
                        id="bookValue"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="66.46"
                        value={formData.bookValue || ""}
                        onChange={(e) => handleInputChange("bookValue", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marketCap">Market Cap (₹ Cr.)</Label>
                      <Input
                        id="marketCap"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="2225.00"
                        value={formData.marketCap || ""}
                        onChange={(e) => handleInputChange("marketCap", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Identifiers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        type="text"
                        placeholder="AAKCA9053A"
                        maxLength={10}
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-muted-foreground">
                        Format: AAKCA9053A (5 letters + 4 digits + 1 letter)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isinNumber">ISIN Number</Label>
                      <Input
                        id="isinNumber"
                        type="text"
                        placeholder="INE0OTC01025"
                        maxLength={12}
                        value={formData.isinNumber}
                        onChange={(e) => handleInputChange("isinNumber", e.target.value.toUpperCase())}
                      />
                      <p className="text-xs text-muted-foreground">Format: INE0OTC01025 (12 characters)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cin">CIN</Label>
                      <Input
                        id="cin"
                        type="text"
                        placeholder="U28999KA2012PLC063439"
                        value={formData.cin}
                        onChange={(e) => handleInputChange("cin", e.target.value.toUpperCase())}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rta">RTA (Registrar & Transfer Agent)</Label>
                      <Input
                        id="rta"
                        type="text"
                        placeholder="Bigshare Services"
                        value={formData.rta}
                        onChange={(e) => handleInputChange("rta", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financial Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="peRatio">P/E Ratio</Label>
                      <Input
                        id="peRatio"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="57.02"
                        value={formData.peRatio || ""}
                        onChange={(e) => handleInputChange("peRatio", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pbRatio">P/B Ratio</Label>
                      <Input
                        id="pbRatio"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="4.89"
                        value={formData.pbRatio || ""}
                        onChange={(e) => handleInputChange("pbRatio", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="debtToEquity">Debt to Equity</Label>
                      <Input
                        id="debtToEquity"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="2.34"
                        value={formData.debtToEquity || ""}
                        onChange={(e) => handleInputChange("debtToEquity", Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roe">ROE (%)</Label>
                      <Input
                        id="roe"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="8.76"
                        value={formData.roe || ""}
                        onChange={(e) => handleInputChange("roe", Number.parseFloat(e.target.value) || 0)}
                      />
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
                    {isSubmitting ? "Updating Share..." : "Update Share"}
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
        </TabsContent>

        <TabsContent value="news-updates">
          <Card>
            <CardHeader>
              <CardTitle>News & Updates</CardTitle>
              <CardDescription>Manage news and announcements for this share</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Add New Update</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsTitle">Title *</Label>
                    <Input
                      id="newsTitle"
                      placeholder="Enter news title"
                      value={newNewsUpdate.title}
                      onChange={(e) => setNewNewsUpdate((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newsCategory">Category</Label>
                    <Select
                      value={newNewsUpdate.category}
                      onValueChange={(value) => setNewNewsUpdate((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="financial">Financial Update</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="corporate">Corporate Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newsPriority">Priority</Label>
                    <Select
                      value={newNewsUpdate.priority}
                      onValueChange={(value) => setNewNewsUpdate((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input
                      id="publishDate"
                      type="date"
                      value={newNewsUpdate.publishDate}
                      onChange={(e) => setNewNewsUpdate((prev) => ({ ...prev, publishDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsContent">Content *</Label>
                  <Textarea
                    id="newsContent"
                    placeholder="Enter news content"
                    rows={4}
                    value={newNewsUpdate.content}
                    onChange={(e) => setNewNewsUpdate((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <Button onClick={addNewsUpdate} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add News Update
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Existing Updates ({newsUpdates.length})</h3>
                {newsUpdates.length === 0 ? (
                  <p className="text-muted-foreground">No news updates added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {newsUpdates.map((news) => (
                      <Card key={news.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{news.title}</h4>
                            <div className="flex gap-2">
                              <Badge
                                variant={
                                  news.priority === "urgent"
                                    ? "destructive"
                                    : news.priority === "high"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {news.priority}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => news.id && deleteNewsUpdate(news.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{news.content}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Category: {news.category}</span>
                            <span>Date: {news.publishDate}</span>
                            <span>Status: {news.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer-comparison">
          <Card>
            <CardHeader>
              <CardTitle>Peer Comparison</CardTitle>
              <CardDescription>Manage competitor data for benchmarking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Add Peer Company</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peerCompanyName">Company Name *</Label>
                    <Input
                      id="peerCompanyName"
                      placeholder="Enter company name"
                      value={newPeerComparison.companyName}
                      onChange={(e) => setNewPeerComparison((prev) => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerCurrentPrice">Current Price (₹)</Label>
                    <Input
                      id="peerCurrentPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPeerComparison.currentPrice || ""}
                      onChange={(e) =>
                        setNewPeerComparison((prev) => ({
                          ...prev,
                          currentPrice: Number.parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerMarketCap">Market Cap (₹ Cr.)</Label>
                    <Input
                      id="peerMarketCap"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPeerComparison.marketCap || ""}
                      onChange={(e) =>
                        setNewPeerComparison((prev) => ({ ...prev, marketCap: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerPeRatio">P/E Ratio</Label>
                    <Input
                      id="peerPeRatio"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPeerComparison.peRatio || ""}
                      onChange={(e) =>
                        setNewPeerComparison((prev) => ({ ...prev, peRatio: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerPbRatio">P/B Ratio</Label>
                    <Input
                      id="peerPbRatio"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPeerComparison.pbRatio || ""}
                      onChange={(e) =>
                        setNewPeerComparison((prev) => ({ ...prev, pbRatio: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peerRoe">ROE (%)</Label>
                    <Input
                      id="peerRoe"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPeerComparison.roe || ""}
                      onChange={(e) =>
                        setNewPeerComparison((prev) => ({ ...prev, roe: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={addPeerComparison} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Peer Company
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Peer Companies ({peerComparisons.length})</h3>
                {peerComparisons.length === 0 ? (
                  <p className="text-muted-foreground">No peer companies added yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Company</th>
                          <th className="border border-border p-2 text-right">Price (₹)</th>
                          <th className="border border-border p-2 text-right">Market Cap</th>
                          <th className="border border-border p-2 text-right">P/E</th>
                          <th className="border border-border p-2 text-right">P/B</th>
                          <th className="border border-border p-2 text-right">ROE</th>
                          <th className="border border-border p-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {peerComparisons.map((peer) => (
                          <tr key={peer.id}>
                            <td className="border border-border p-2 font-medium">{peer.companyName}</td>
                            <td className="border border-border p-2 text-right">₹{peer.currentPrice.toFixed(2)}</td>
                            <td className="border border-border p-2 text-right">₹{peer.marketCap.toFixed(2)} Cr</td>
                            <td className="border border-border p-2 text-right">{peer.peRatio.toFixed(2)}</td>
                            <td className="border border-border p-2 text-right">{peer.pbRatio.toFixed(2)}</td>
                            <td className="border border-border p-2 text-right">{peer.roe.toFixed(2)}%</td>
                            <td className="border border-border p-2 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => peer.id && deletePeerComparison(peer.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
