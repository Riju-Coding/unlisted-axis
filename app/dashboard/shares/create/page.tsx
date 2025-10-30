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
import {
  ArrowLeft,
  Plus,
  Upload,
  Newspaper,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { LinkPreview } from "@/components/link-preview"
import { toast } from "@/hooks/use-toast"
import BulkUploadShares from "./bulk-upload-shares"
import { Badge } from "@/components/ui/badge" // Added for SEO keywords

interface YearlyFinancialData {
  [year: string]: number
}

interface IncomeStatementData {
  revenue: YearlyFinancialData
  costOfMaterialConsumed: YearlyFinancialData
  changeInInventory: YearlyFinancialData
  grossMargins: YearlyFinancialData
  employeeBenefitExpenses: YearlyFinancialData
  otherExpenses: YearlyFinancialData
  ebitda: YearlyFinancialData
  opm: YearlyFinancialData
  otherIncome: YearlyFinancialData
  financeCost: YearlyFinancialData
  depreciation: YearlyFinancialData
  ebit: YearlyFinancialData
  ebitMargins: YearlyFinancialData
  pbt: YearlyFinancialData
  pbtMargins: YearlyFinancialData
  tax: YearlyFinancialData
  pat: YearlyFinancialData
  npm: YearlyFinancialData
  eps: YearlyFinancialData
}

interface BalanceSheetData {
  // Assets
  fixedAssets: YearlyFinancialData
  cwip: YearlyFinancialData
  investments: YearlyFinancialData
  tradeReceivables: YearlyFinancialData
  inventory: YearlyFinancialData
  otherAssets: YearlyFinancialData
  totalAssets: YearlyFinancialData
  // Liabilities
  shareCapital: YearlyFinancialData
  faceValue: YearlyFinancialData
  reserves: YearlyFinancialData
  borrowings: YearlyFinancialData
  tradePayables: YearlyFinancialData
  otherLiabilities: YearlyFinancialData
  totalLiabilities: YearlyFinancialData
}

interface CashFlowData {
  pbt: YearlyFinancialData
  opbwc: YearlyFinancialData
  changeInReceivables: YearlyFinancialData
  changeInInventories: YearlyFinancialData
  changeInPayables: YearlyFinancialData
  otherChanges: YearlyFinancialData
  workingCapitalChange: YearlyFinancialData
  cashGeneratedFromOperations: YearlyFinancialData
  tax: YearlyFinancialData
  cashFlowFromOperations: YearlyFinancialData
  purchaseOfPPE: YearlyFinancialData
  saleOfPPE: YearlyFinancialData
  cashFlowFromInvestment: YearlyFinancialData
  borrowing: YearlyFinancialData
  dividend: YearlyFinancialData
  equity: YearlyFinancialData
  othersFromFinancing: YearlyFinancialData
  cashFlowFromFinancing: YearlyFinancialData
  netCashGenerated: YearlyFinancialData
  cashAtStart: YearlyFinancialData
  cashAtEnd: YearlyFinancialData
}

interface ShareholdingPatternData {
  individuals: YearlyFinancialData
  corporatesListed: YearlyFinancialData
  corporatesUnlisted: YearlyFinancialData
  financialInstitutions: YearlyFinancialData
  insuranceCompanies: YearlyFinancialData
  ventureCapitalFunds: YearlyFinancialData
  foreignHolding: YearlyFinancialData
  others: YearlyFinancialData
}

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
  incomeStatement: IncomeStatementData
  balanceSheet: BalanceSheetData
  cashFlow: CashFlowData
  shareholdingPattern: ShareholdingPatternData
  seoTitle: string // Added for SEO
  seoDescription: string // Added for SEO
  seoKeywords: string[] // Added for SEO
  slug: string // Added for SEO
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

const availableYears = ["2020", "2021", "2022", "2023", "2024", "2025"]

// Helper function to generate slug for SEO
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function CreateSharePage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("single")
  const [activeFinancialTab, setActiveFinancialTab] = useState("income-statement")
  const [selectedYear, setSelectedYear] = useState("2025")

  // State for SEO keywords
  const [newKeyword, setNewKeyword] = useState("")

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
    incomeStatement: {
      revenue: {},
      costOfMaterialConsumed: {},
      changeInInventory: {},
      grossMargins: {},
      employeeBenefitExpenses: {},
      otherExpenses: {},
      ebitda: {},
      opm: {},
      otherIncome: {},
      financeCost: {},
      depreciation: {},
      ebit: {},
      ebitMargins: {},
      pbt: {},
      pbtMargins: {},
      tax: {},
      pat: {},
      npm: {},
      eps: {},
    },
    balanceSheet: {
      fixedAssets: {},
      cwip: {},
      investments: {},
      tradeReceivables: {},
      inventory: {},
      otherAssets: {},
      totalAssets: {},
      shareCapital: {},
      faceValue: {},
      reserves: {},
      borrowings: {},
      tradePayables: {},
      otherLiabilities: {},
      totalLiabilities: {},
    },
    cashFlow: {
      pbt: {},
      opbwc: {},
      changeInReceivables: {},
      changeInInventories: {},
      changeInPayables: {},
      otherChanges: {},
      workingCapitalChange: {},
      cashGeneratedFromOperations: {},
      tax: {},
      cashFlowFromOperations: {},
      purchaseOfPPE: {},
      saleOfPPE: {},
      cashFlowFromInvestment: {},
      borrowing: {},
      dividend: {},
      equity: {},
      othersFromFinancing: {},
      cashFlowFromFinancing: {},
      netCashGenerated: {},
      cashAtStart: {},
      cashAtEnd: {},
    },
    shareholdingPattern: {
      individuals: {},
      corporatesListed: {},
      corporatesUnlisted: {},
      financialInstitutions: {},
      insuranceCompanies: {},
      ventureCapitalFunds: {},
      foreignHolding: {},
      others: {},
    },
    // Initialize SEO fields
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    slug: "",
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

  // Enhanced handleInputChange to auto-generate slug and default SEO title
  const handleInputChange = (field: keyof ShareFormData, value: string | number) => {
    setFormData((prev) => {
      const next: Partial<ShareFormData> = { ...prev, [field]: value } // Use Partial for intermediate type
      if (field === "sharesName") {
        const v = (value as string) || ""
        next.slug = v ? generateSlug(v) : prev.slug
        // Default SEO title if it's empty or has the default placeholder text
        if (!prev.seoTitle || prev.seoTitle.includes("Latest Updates, Price, Dates & Review")) {
          next.seoTitle = v ? `${v} - Unlisted Share Details & Price` : prev.seoTitle
        }
      }
      // Handle SEO title changes to prevent overriding with default if user manually edits
      if (field === "seoTitle" && (value as string).length > 0) {
        next.seoTitle = value as string
      }
      return next as ShareFormData // Cast back to ShareFormData
    })
    setError(null)
    setSuccess(null)
  }

  const handleFinancialDataChange = (
    section: "incomeStatement" | "balanceSheet" | "cashFlow" | "shareholdingPattern",
    field: string,
    year: string,
    value: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...(prev[section] as any)[field],
          [year]: value,
        },
      },
    }))
    setError(null)
    setSuccess(null)
  }

  // Handlers for SEO keywords
  const addKeyword = () => {
    if (!newKeyword.trim()) return
    setFormData((prev) => ({ ...prev, seoKeywords: [...prev.seoKeywords, newKeyword.trim()] }))
    setNewKeyword("")
  }
  const removeKeyword = (index: number) => {
    setFormData((prev) => ({ ...prev, seoKeywords: prev.seoKeywords.filter((_, i) => i !== index) }))
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
      if (!formData.slug.trim()) {
        throw new Error("URL Slug is required for SEO.")
      }
      if (!formData.seoTitle.trim()) {
        throw new Error("SEO Title is required.")
      }
      if (!formData.seoDescription.trim()) {
        throw new Error("SEO Description is required.")
      }

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
        incomeStatement: formData.incomeStatement,
        balanceSheet: formData.balanceSheet,
        cashFlow: formData.cashFlow,
        shareholdingPattern: formData.shareholdingPattern,
        // Include SEO fields in Firestore payload
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        slug: formData.slug,
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
        incomeStatement: {
          revenue: {},
          costOfMaterialConsumed: {},
          changeInInventory: {},
          grossMargins: {},
          employeeBenefitExpenses: {},
          otherExpenses: {},
          ebitda: {},
          opm: {},
          otherIncome: {},
          financeCost: {},
          depreciation: {},
          ebit: {},
          ebitMargins: {},
          pbt: {},
          pbtMargins: {},
          tax: {},
          pat: {},
          npm: {},
          eps: {},
        },
        balanceSheet: {
          fixedAssets: {},
          cwip: {},
          investments: {},
          tradeReceivables: {},
          inventory: {},
          otherAssets: {},
          totalAssets: {},
          shareCapital: {},
          faceValue: {},
          reserves: {},
          borrowings: {},
          tradePayables: {},
          otherLiabilities: {},
          totalLiabilities: {},
        },
        cashFlow: {
          pbt: {},
          opbwc: {},
          changeInReceivables: {},
          changeInInventories: {},
          changeInPayables: {},
          otherChanges: {},
          workingCapitalChange: {},
          cashGeneratedFromOperations: {},
          tax: {},
          cashFlowFromOperations: {},
          purchaseOfPPE: {},
          saleOfPPE: {},
          cashFlowFromInvestment: {},
          borrowing: {},
          dividend: {},
          equity: {},
          othersFromFinancing: {},
          cashFlowFromFinancing: {},
          netCashGenerated: {},
          cashAtStart: {},
          cashAtEnd: {},
        },
        shareholdingPattern: {
          individuals: {},
          corporatesListed: {},
          corporatesUnlisted: {},
          financialInstitutions: {},
          insuranceCompanies: {},
          ventureCapitalFunds: {},
          foreignHolding: {},
          others: {},
        },
        // Reset SEO fields
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
        slug: "",
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

                    {/* SEO Settings Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Optimize the share detail page for search engines</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="slug">URL Slug</Label>
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => handleInputChange("slug", e.target.value)}
                            placeholder="company-name-unlisted-shares"
                          />
                          <p className="text-sm text-muted-foreground">
                            URL will be: /shares/{"{"}formData.slug{"}"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoTitle">SEO Title</Label>
                          <Input
                            id="seoTitle"
                            value={formData.seoTitle}
                            onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                            placeholder="Company Name - Unlisted Share Price, Details & Updates"
                            maxLength={60}
                          />
                          <p className="text-sm text-muted-foreground">{formData.seoTitle.length}/60 characters</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seoDescription">SEO Description</Label>
                          <Textarea
                            id="seoDescription"
                            value={formData.seoDescription}
                            onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                            placeholder="Get complete details about this unlisted share including price, company info, financials, and latest updates."
                            maxLength={160}
                            rows={3}
                          />
                          <p className="text-sm text-muted-foreground">
                            {formData.seoDescription.length}/160 characters
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>SEO Keywords</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              placeholder="Enter keyword"
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                            />
                            <Button type="button" onClick={addKeyword}>
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.seoKeywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() => removeKeyword(index)}
                                  aria-label={`Remove ${keyword}`}
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Comprehensive Financial Data</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableYears.map((year) => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Tabs value={activeFinancialTab} onValueChange={setActiveFinancialTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="income-statement" className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            P&L
                          </TabsTrigger>
                          <TabsTrigger value="balance-sheet" className="flex items-center gap-1">
                            <PieChart className="h-3 w-3" />
                            Balance Sheet
                          </TabsTrigger>
                          <TabsTrigger value="cash-flow" className="flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" />
                            Cash Flow
                          </TabsTrigger>
                          <TabsTrigger value="shareholding" className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Shareholding
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="income-statement" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Income Statement - {selectedYear}</CardTitle>
                              <CardDescription>Enter P&L data for the selected year</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Revenue (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.revenue[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "revenue",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cost of Material Consumed (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.costOfMaterialConsumed[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "costOfMaterialConsumed",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Change in Inventory (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.changeInInventory[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "changeInInventory",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Gross Margins (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.grossMargins[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "grossMargins",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Employee Benefit Expenses (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.employeeBenefitExpenses[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "employeeBenefitExpenses",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Other Expenses (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.otherExpenses[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "otherExpenses",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>EBITDA (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.ebitda[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "ebitda",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>OPM (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.opm[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "opm",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Other Income (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.otherIncome[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "otherIncome",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Finance Cost (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.financeCost[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "financeCost",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>D&A (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.depreciation[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "depreciation",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>EBIT (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.ebit[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "ebit",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>EBIT Margins (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.ebitMargins[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "ebitMargins",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>PBT (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.pbt[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "pbt",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>PBT Margins (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.pbtMargins[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "pbtMargins",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Tax (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.tax[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "tax",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>PAT (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.pat[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "pat",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>NPM (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.npm[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "npm",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>EPS (₹)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.incomeStatement.eps[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "incomeStatement",
                                        "eps",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="balance-sheet" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Balance Sheet - {selectedYear}</CardTitle>
                              <CardDescription>Enter balance sheet data for the selected year</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">Assets</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Fixed Assets (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.fixedAssets[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "fixedAssets",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>CWIP (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.cwip[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "cwip",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Investments (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.investments[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "investments",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Trade Receivables (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.tradeReceivables[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "tradeReceivables",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Inventory (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.inventory[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "inventory",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Other Assets (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.otherAssets[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "otherAssets",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Total Assets (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.totalAssets[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "totalAssets",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">Liabilities</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Share Capital (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.shareCapital[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "shareCapital",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Face Value (₹)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.faceValue[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "faceValue",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Reserves (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.reserves[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "reserves",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Borrowings (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.borrowings[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "borrowings",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Trade Payables (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.tradePayables[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "tradePayables",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Other Liabilities (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.otherLiabilities[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "otherLiabilities",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Total Liabilities (₹ Crores)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={formData.balanceSheet.totalLiabilities[selectedYear] || ""}
                                      onChange={(e) =>
                                        handleFinancialDataChange(
                                          "balanceSheet",
                                          "totalLiabilities",
                                          selectedYear,
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="cash-flow" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Cash Flow Statement - {selectedYear}</CardTitle>
                              <CardDescription>Enter cash flow data for the selected year</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>PBT (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.pbt[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "pbt",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>OPBWC (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.opbwc[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "opbwc",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Change in Receivables (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.changeInReceivables[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "changeInReceivables",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Change in Inventories (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.changeInInventories[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "changeInInventories",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Change in Payables (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.changeInPayables[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "changeInPayables",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Other Changes (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.otherChanges[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "otherChanges",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Working Capital Change (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.workingCapitalChange[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "workingCapitalChange",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cash Generated From Operations (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.cashGeneratedFromOperations[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "cashGeneratedFromOperations",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Tax (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.tax[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "tax",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cash Flow From Operations (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.cashFlowFromOperations[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "cashFlowFromOperations",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Purchase of PPE (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.purchaseOfPPE[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "purchaseOfPPE",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Sale of PPE (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.saleOfPPE[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "saleOfPPE",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cash Flow From Investment (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.cashFlowFromInvestment[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "cashFlowFromInvestment",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Borrowing (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.borrowing[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "borrowing",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Dividend (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.dividend[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "dividend",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Equity (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.equity[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "equity",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Others From Financing (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.othersFromFinancing[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "othersFromFinancing",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cash Flow From Financing (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.cashFlowFromFinancing[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "cashFlowFromFinancing",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Net Cash Generated (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.netCashGenerated[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "netCashGenerated",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cash at Start (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.cashAtStart[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "cashAtStart",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Cash at End (₹ Crores)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cashFlow.cashAtEnd[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "cashFlow",
                                        "cashAtEnd",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="shareholding" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Shareholding Pattern - {selectedYear}</CardTitle>
                              <CardDescription>
                                Enter shareholding pattern data for the selected year (in %)
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Individuals (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.individuals[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "individuals",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Corporates - Listed (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.corporatesListed[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "corporatesListed",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Corporates - Unlisted (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.corporatesUnlisted[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "corporatesUnlisted",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Financial Institutions/Banks (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.financialInstitutions[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "financialInstitutions",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Insurance Companies (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.insuranceCompanies[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "insuranceCompanies",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Venture Capital Fund/AIFs (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.ventureCapitalFunds[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "ventureCapitalFunds",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Foreign Holding (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.foreignHolding[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "foreignHolding",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Others (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="0.00"
                                    value={formData.shareholdingPattern.others[selectedYear] || ""}
                                    onChange={(e) =>
                                      handleFinancialDataChange(
                                        "shareholdingPattern",
                                        "others",
                                        selectedYear,
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
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
                    onUrlChange={(e) => handleInputChange("blogUrl", e.target.value)}
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
