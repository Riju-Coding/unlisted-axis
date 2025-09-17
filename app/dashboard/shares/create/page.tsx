"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import { ArrowLeft, Plus, Upload, Newspaper, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { LinkPreview } from "@/components/link-preview"
import { toast } from "@/hooks/use-toast"
import BulkUploadShares from "./bulk-upload-shares"

interface ShareFormData {
  logo: string
  sharesName: string
  depository: string
  minimumLotSize: number
  description: string
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

interface NewsUpdateData {
  title: string
  content: string
  category: string
  priority: string
  publishDate: string
  shareId?: string
  isGlobal: boolean
}

interface PeerComparisonData {
  shareId: string
  peerName: string
  peerPrice: number
  peerMarketCap: number
  peerPeRatio: number
  peerPbRatio: number
  peerRoe: number
}

const sectors = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Real Estate",
  "Energy",
  "Consumer Goods",
  "Telecommunications",
  "Transportation",
  "Agriculture",
  "Education",
  "Hospitality",
  "Other",
]

const categories = ["Large Cap", "Mid Cap", "Small Cap", "Micro Cap", "Startup", "Growth", "Value", "Dividend", "Other"]

export default function CreateSharePage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("single")
  const [formData, setFormData] = useState<ShareFormData>({
    logo: "",
    sharesName: "",
    depository: "",
    minimumLotSize: 1,
    description: "",
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
  const [newsData, setNewsData] = useState<NewsUpdateData>({
    title: "",
    content: "",
    category: "general",
    priority: "medium",
    publishDate: new Date().toISOString().split("T")[0],
    shareId: "",
    isGlobal: false,
  })
  const [peerData, setPeerData] = useState<PeerComparisonData>({
    shareId: "",
    peerName: "",
    peerPrice: 0,
    peerMarketCap: 0,
    peerPeRatio: 0,
    peerPbRatio: 0,
    peerRoe: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user || role !== "admin") {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to create shares.</p>
      </div>
    )
  }

  const handleInputChange = (field: keyof ShareFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
    setSuccess(null)
  }

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (!newsData.title.trim()) {
        throw new Error("News title is required")
      }
      if (!newsData.content.trim()) {
        throw new Error("News content is required")
      }

      const newsDocData = {
        ...newsData,
        title: newsData.title.trim(),
        content: newsData.content.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: "published",
      }

      await addDoc(collection(db, "newsUpdates"), newsDocData)
      setSuccess("News update created successfully!")

      // Reset form
      setNewsData({
        title: "",
        content: "",
        category: "general",
        priority: "medium",
        publishDate: new Date().toISOString().split("T")[0],
        shareId: "",
        isGlobal: false,
      })

      toast({
        title: "Success",
        description: "News update created successfully",
      })
    } catch (err: any) {
      console.error("Error creating news update:", err)
      setError(err.message || "Failed to create news update. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePeerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (!peerData.shareId.trim()) {
        throw new Error("Share ID is required")
      }
      if (!peerData.peerName.trim()) {
        throw new Error("Peer company name is required")
      }
      if (peerData.peerPrice <= 0) {
        throw new Error("Peer price must be greater than 0")
      }

      const peerDocData = {
        ...peerData,
        peerName: peerData.peerName.trim(),
        shareId: peerData.shareId.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: "active",
      }

      await addDoc(collection(db, "peerComparisons"), peerDocData)
      setSuccess("Peer comparison data created successfully!")

      // Reset form
      setPeerData({
        shareId: "",
        peerName: "",
        peerPrice: 0,
        peerMarketCap: 0,
        peerPeRatio: 0,
        peerPbRatio: 0,
        peerRoe: 0,
      })

      toast({
        title: "Success",
        description: "Peer comparison data created successfully",
      })
    } catch (err: any) {
      console.error("Error creating peer comparison:", err)
      setError(err.message || "Failed to create peer comparison. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!formData.sharesName.trim()) {
        throw new Error("Share name is required")
      }
      if (!formData.depository.trim()) {
        throw new Error("Depository is required")
      }
      if (formData.currentPrice <= 0) {
        throw new Error("Current price must be greater than 0")
      }
      if (formData.minimumLotSize <= 0) {
        throw new Error("Minimum lot size must be greater than 0")
      }
      if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        throw new Error("PAN number must be in format: AAKCA9053A (5 letters, 4 digits, 1 letter)")
      }
      if (formData.isinNumber && !/^[A-Z]{2}[A-Z0-9]{9}[0-9]{1}$/.test(formData.isinNumber)) {
        throw new Error("ISIN number must be 12 characters (2 letters + 9 alphanumeric + 1 digit)")
      }

      // Create share document
      const shareData = {
        logo: formData.logo.trim(),
        sharesName: formData.sharesName.trim(),
        depository: formData.depository.trim(),
        minimumLotSize: formData.minimumLotSize,
        description: formData.description.trim(),
        website: formData.website.trim(),
        blogUrl: formData.blogUrl.trim(),
        sector: formData.sector,
        category: formData.category,
        marketCap: formData.marketCap,
        weekHigh52: formData.weekHigh52,
        weekLow52: formData.weekLow52,
        panNumber: formData.panNumber.trim().toUpperCase(),
        isinNumber: formData.isinNumber.trim().toUpperCase(),
        cin: formData.cin.trim().toUpperCase(),
        rta: formData.rta.trim(),
        peRatio: formData.peRatio,
        pbRatio: formData.pbRatio,
        debtToEquity: formData.debtToEquity,
        roe: formData.roe,
        bookValue: formData.bookValue,
        faceValue: formData.faceValue,
        totalShares: formData.totalShares,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: "active", // active, inactive, delisted
      }

      const shareDocRef = await addDoc(collection(db, "shares"), shareData)

      // Create initial price record
      const priceData = {
        shareId: shareDocRef.id,
        price: formData.currentPrice,
        timestamp: serverTimestamp(),
        updatedBy: user.uid,
        changeType: "initial", // initial, increase, decrease, no_change
      }

      await addDoc(collection(db, "sharePrices"), priceData)

      setSuccess("Share created successfully!")

      toast({
        title: "Success",
        description: "Share created successfully",
      })

      // Reset form
      setFormData({
        logo: "",
        sharesName: "",
        depository: "",
        minimumLotSize: 1,
        description: "",
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

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/shares")
      }, 2000)
    } catch (err: any) {
      console.error("Error creating share:", err)
      setError(err.message || "Failed to create share. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
        <h2 className="text-2xl font-bold">Admin Management</h2>
        <p className="text-muted-foreground">Create shares, manage news updates, and add peer comparisons</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Single Share
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            News & Updates
          </TabsTrigger>
          <TabsTrigger value="peer" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Peer Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Share Details</CardTitle>
                  <CardDescription>Enter the details for the new unlisted share</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
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
                          <Label htmlFor="currentPrice">Current Price (₹) *</Label>
                          <Input
                            id="currentPrice"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={formData.currentPrice || ""}
                            onChange={(e) => handleInputChange("currentPrice", Number.parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectItem value="NSDL & CDSL">NSDL & CDSL</SelectItem>
                              <SelectItem value="Physical">Physical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="minimumLotSize">Lot Size *</Label>
                          <Input
                            id="minimumLotSize"
                            type="number"
                            min="1"
                            placeholder="100"
                            value={formData.minimumLotSize || ""}
                            onChange={(e) => handleInputChange("minimumLotSize", Number.parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Price Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="faceValue">Face Value (₹)</Label>
                          <Input
                            id="faceValue"
                            type="number"
                            min="1"
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
                      </div>
                    </div>

                    {/* Company Identifiers */}
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
                          <p className="text-xs text-muted-foreground">Format: 5 letters + 4 digits + 1 letter</p>
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
                          <p className="text-xs text-muted-foreground">12 character alphanumeric code</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cin">CIN Number</Label>
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

                    {/* Financial Metrics */}
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                        <div className="space-y-2">
                          <Label htmlFor="marketCap">Market Cap (₹ Crores)</Label>
                          <Input
                            id="marketCap"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="2225.00"
                            value={formData.marketCap || ""}
                            onChange={(e) => handleInputChange("marketCap", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="totalShares">Total Shares</Label>
                          <Input
                            id="totalShares"
                            type="number"
                            min="1"
                            placeholder="68465270"
                            value={formData.totalShares || ""}
                            onChange={(e) => handleInputChange("totalShares", Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Classification */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Classification</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector">Sector</Label>
                          <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sector" />
                            </SelectTrigger>
                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem key={sector} value={sector}>
                                  {sector}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleInputChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Branding</h3>
                      <div className="space-y-2">
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input
                          id="logo"
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={formData.logo}
                          onChange={(e) => handleInputChange("logo", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Direct URL to company logo or use website preview below
                        </p>
                      </div>
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
                        {isSubmitting ? "Creating Share..." : "Create Share"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/shares")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Link</CardTitle>
                  <CardDescription>Add the company's official website</CardDescription>
                </CardHeader>
                <CardContent>
                  <LinkPreview
                    url={formData.website}
                    onUrlChange={(url) => handleInputChange("website", url)}
                    onImageChange={(imageUrl) => {
                      if (!formData.logo) {
                        handleInputChange("logo", imageUrl)
                      }
                    }}
                    selectedImage={formData.logo}
                    label="Website URL"
                    placeholder="https://company.com"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blog/News Link</CardTitle>
                  <CardDescription>Add link to company blog or news section</CardDescription>
                </CardHeader>
                <CardContent>
                  <LinkPreview
                    url={formData.blogUrl}
                    onUrlChange={(url) => handleInputChange("blogUrl", url)}
                    onImageChange={() => {}} // Don't update logo from blog
                    label="Blog URL"
                    placeholder="https://company.com/blog"
                  />
                </CardContent>
              </Card>

              {formData.logo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Logo Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <img
                        src={formData.logo || "/placeholder.svg"}
                        alt="Company Logo"
                        className="max-h-24 max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 break-all">{formData.logo}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkUploadShares />
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create News & Updates</CardTitle>
              <CardDescription>Add news updates and announcements for shares or general market news</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsTitle">News Title *</Label>
                    <Input
                      id="newsTitle"
                      type="text"
                      placeholder="e.g., Company announces Q4 results"
                      value={newsData.title}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newsCategory">Category</Label>
                    <Select
                      value={newsData.category}
                      onValueChange={(value) => setNewsData((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="earnings">Earnings</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="market">Market Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newsPriority">Priority</Label>
                    <Select
                      value={newsData.priority}
                      onValueChange={(value) => setNewsData((prev) => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
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
                      value={newsData.publishDate}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, publishDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shareId">Share ID (Optional)</Label>
                    <Input
                      id="shareId"
                      type="text"
                      placeholder="Leave empty for global news"
                      value={newsData.shareId}
                      onChange={(e) => setNewsData((prev) => ({ ...prev, shareId: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsContent">Content *</Label>
                  <Textarea
                    id="newsContent"
                    placeholder="Enter the news content..."
                    value={newsData.content}
                    onChange={(e) => setNewsData((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGlobal"
                    checked={newsData.isGlobal}
                    onChange={(e) => setNewsData((prev) => ({ ...prev, isGlobal: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isGlobal">Global news (affects all shares)</Label>
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

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Creating News Update..." : "Create News Update"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Peer Comparison Data</CardTitle>
              <CardDescription>Add competitor data for share comparison analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePeerSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peerShareId">Share ID *</Label>
                    <Input
                      id="peerShareId"
                      type="text"
                      placeholder="Enter the share ID to add peer for"
                      value={peerData.shareId}
                      onChange={(e) => setPeerData((prev) => ({ ...prev, shareId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peerName">Peer Company Name *</Label>
                    <Input
                      id="peerName"
                      type="text"
                      placeholder="e.g., Competitor Ltd."
                      value={peerData.peerName}
                      onChange={(e) => setPeerData((prev) => ({ ...prev, peerName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peerPrice">Peer Price (₹) *</Label>
                    <Input
                      id="peerPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={peerData.peerPrice || ""}
                      onChange={(e) =>
                        setPeerData((prev) => ({ ...prev, peerPrice: Number.parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peerMarketCap">Market Cap (₹ Crores)</Label>
                    <Input
                      id="peerMarketCap"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={peerData.peerMarketCap || ""}
                      onChange={(e) =>
                        setPeerData((prev) => ({ ...prev, peerMarketCap: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peerPeRatio">P/E Ratio</Label>
                    <Input
                      id="peerPeRatio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={peerData.peerPeRatio || ""}
                      onChange={(e) =>
                        setPeerData((prev) => ({ ...prev, peerPeRatio: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peerPbRatio">P/B Ratio</Label>
                    <Input
                      id="peerPbRatio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={peerData.peerPbRatio || ""}
                      onChange={(e) =>
                        setPeerData((prev) => ({ ...prev, peerPbRatio: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peerRoe">ROE (%)</Label>
                    <Input
                      id="peerRoe"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00"
                      value={peerData.peerRoe || ""}
                      onChange={(e) =>
                        setPeerData((prev) => ({ ...prev, peerRoe: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
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

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Adding Peer Comparison..." : "Add Peer Comparison"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
