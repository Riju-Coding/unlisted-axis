"use client"

import type React from "react"
import Head from "next/head"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, doc, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ExternalLink,
  Building2,
  Globe,
  FileText,
  BarChart3,
  DollarSign,
  MessageSquare,
  Send,
  CheckCircle,
  IndianRupee,
} from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"

interface ShareData {
  id: string
  sharesName: string
  logo?: string
  description?: string
  currentPrice?: number
  weekHigh52?: number
  weekLow52?: number
  minimumLotSize?: number
  depository?: string
  panNumber?: string
  isinNumber?: string
  cin?: string
  rta?: string
  peRatio?: number
  pbRatio?: number
  debtToEquity?: number
  roe?: number
  bookValue?: number
  faceValue?: number
  totalShares?: number
  marketCap?: number
  sector?: string
  category?: string
  website?: string
  blogUrl?: string
  priceTimestamp?: any
  changeType?: string
  financialData?: {
    incomeStatement?: {
      [field: string]: { [year: string]: number }
    }
    balanceSheet?: {
      [field: string]: { [year: string]: number }
    }
    cashFlow?: {
      [field: string]: { [year: string]: number }
    }
    shareholdingPattern?: {
      [field: string]: { [year: string]: number }
    }
  }
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  slug?: string
}

interface ShareDetailPageProps {
  slug: string
  id?: string
}

export default function ShareDetailPage({ slug, id }: ShareDetailPageProps) {
  const [loading, setLoading] = useState(true)
  const [share, setShare] = useState<ShareData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [selectedYear, setSelectedYear] = useState("2024")
  const [activeFinancialTab, setActiveFinancialTab] = useState("income")
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (id) {
      const shareDocRef = doc(db, "shares", id)
      const unsubscribe = onSnapshot(shareDocRef, (docSnapshot) => {
        if (!docSnapshot.exists()) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setShare({ id: docSnapshot.id, ...docSnapshot.data() } as ShareData)
        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      const shareNameFromSlug = slug.replace(/-/g, " ")
      const q = query(collection(db, "shares"), where("sharesName", "==", shareNameFromSlug))

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const shareData = querySnapshot.docs[0]
        setShare({ id: shareData.id, ...shareData.data() } as ShareData)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [slug, id])

  const defaultBrand = "Unlisted Axis"
  const metaTitle =
    (share?.seoTitle && share.seoTitle.trim()) ||
    (share?.sharesName ? `${share.sharesName} | ${defaultBrand}` : defaultBrand)
  const metaDescription =
    (share?.seoDescription && share.seoDescription.trim()) ||
    (share?.description && share.description.trim()) ||
    `${defaultBrand} - Unlisted shares information`
  const metaKeywords =
    share?.seoKeywords && share.seoKeywords.length > 0
      ? share.seoKeywords.join(", ")
      : `unlisted axis, unlisted shares${share?.sharesName ? `, ${share.sharesName}` : ""}`

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.main} 50%, ${colors.background.dark} 100%)`,
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${colors.primary.main} transparent transparent transparent` }}
          ></div>
          <p style={{ color: colors.text.secondary }}>Loading share details...</p>
        </div>
      </div>
    )
  }

  if (notFound || !share) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.main} 50%, ${colors.background.dark} 100%)`,
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.text.primary }}>
            Share Not Found
          </h1>
          <p className="mb-6" style={{ color: colors.text.secondary }}>
            The share you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/markets")}
            style={{
              backgroundColor: colors.primary.main,
              borderColor: colors.primary.main,
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (value?: number) => {
    if (!value) return "-"
    return `₹${value.toLocaleString()}`
  }

  const formatNumber = (value?: number) => {
    if (!value) return "-"
    return value.toLocaleString()
  }

  const formatPercentage = (value?: number) => {
    if (!value) return "-"
    return `${value}%`
  }

  const getAvailableYears = () => {
    if (!share?.financialData) return ["2024", "2023", "2022", "2021", "2020"]

    const years = new Set<string>()
    Object.values(share.financialData).forEach((section) => {
      if (section) {
        Object.values(section).forEach((field) => {
          Object.keys(field).forEach((year) => years.add(year))
        })
      }
    })

    return Array.from(years).sort().reverse()
  }

  const getFinancialValue = (section: string, field: string, year: string) => {
    return share?.financialData?.[section as keyof typeof share.financialData]?.[field]?.[year] || 0
  }

  const formatFinancialValue = (value: number, isPercentage = false, isCurrency = false) => {
    if (value === 0) return "-"
    if (isPercentage) return `${value}%`
    if (isCurrency) return formatCurrency(value)
    return formatNumber(value)
  }

  const handleEnquiryChange = (field: string, value: string) => {
    setEnquiryForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!share?.id) return

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "enquiries"), {
        shareId: share.id,
        shareName: share.sharesName,
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        message: enquiryForm.message,
        createdAt: new Date(),
        status: "pending",
      })

      setSubmitSuccess(true)
      setEnquiryForm({ name: "", email: "", phone: "", message: "" })

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting enquiry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        {/* Basic OG/Twitter fallbacks */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
      </Head>

      <motion.div
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.main} 50%, ${colors.background.dark} 100%)`,
        }}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Header />
        <main className="py-8 mt-10">
          {/* Back Button */}
          <section className="py-4 px-4">
            <div className="container mx-auto">
              <Button
                variant="outline"
                onClick={() => router.push("/markets")}
                className="mb-6"
                style={{
                  borderColor: colors.primary.light,
                  color: colors.text.primary,
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Markets
              </Button>
            </div>
          </section>

          {/* Share Header */}
          <section className="py-8 px-4">
            <div className="container mx-auto">
              <motion.div
                className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: colors.neutral.light }}
                  >
                    {share.logo ? (
                      <img
                        src={share.logo || "/placeholder.svg"}
                        alt={share.sharesName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold text-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                        }}
                      >
                        {share.sharesName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ color: colors.text.primary }}>
                      {share.sharesName}
                    </h1>
                    <p className="text-lg" style={{ color: colors.text.secondary }}>
                      {share.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:ml-auto">
                  {share.website && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(share.website, "_blank")}
                      style={{
                        borderColor: colors.primary.light,
                        color: colors.text.primary,
                      }}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  )}
                  {share.blogUrl && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(share.blogUrl, "_blank")}
                      style={{
                        borderColor: colors.primary.light,
                        color: colors.text.primary,
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Blog
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Price Information */}
          <section className="py-4 px-4">
            <div className="container mx-auto">
              <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                          Current Price
                        </CardTitle>
                        <IndianRupee className="w-5 h-5" style={{ color: colors.primary.main }} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                        {formatCurrency(share.currentPrice)}
                      </div>
                      {share.changeType && (
                        <div className="flex items-center mt-2">
                          {share.changeType === "increase" ? (
                            <TrendingUp className="w-4 h-4 mr-1" style={{ color: colors.success.main }} />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" style={{ color: colors.error.main }} />
                          )}
                          <span
                            className="text-sm capitalize"
                            style={{
                              color: share.changeType === "increase" ? colors.success.main : colors.error.main,
                            }}
                          >
                            {share.changeType}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        52 Week Range
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm" style={{ color: colors.text.secondary }}>
                            High:
                          </span>
                          <span className="font-semibold" style={{ color: colors.success.main }}>
                            {formatCurrency(share.weekHigh52)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm" style={{ color: colors.text.secondary }}>
                            Low:
                          </span>
                          <span className="font-semibold" style={{ color: colors.error.main }}>
                            {formatCurrency(share.weekLow52)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        Market Cap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        {formatCurrency(share.marketCap)}
                      </div>
                      <div className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                        Total Value
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border hover:shadow-xl transition-all duration-300"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        Minimum Lot Size
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        {formatNumber(share.minimumLotSize)}
                      </div>
                      <div className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                        Shares
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Detailed Information */}
          <section className="py-4 px-4">
            <div className="container mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Company Information */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card
                    className="backdrop-blur-sm border"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ color: colors.text.primary }}>
                        <Building2 className="w-5 h-5" />
                        Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Sector
                          </label>
                          <p className="font-semibold" style={{ color: colors.text.primary }}>
                            {share.sector || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Category
                          </label>
                          <p className="font-semibold" style={{ color: colors.text.primary }}>
                            {share.category || "-"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                          Depository
                        </label>
                        <div className="mt-1">
                          <Badge
                            variant={share.depository === "NSDL" ? "default" : "secondary"}
                            style={
                              share.depository === "NSDL"
                                ? {
                                    backgroundColor: `${colors.primary.light}40`,
                                    color: colors.primary.main,
                                  }
                                : {
                                    backgroundColor: `${colors.accent.light}40`,
                                    color: colors.accent.main,
                                  }
                            }
                          >
                            {share.depository || "-"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            PAN Number
                          </label>
                          <p className="font-mono" style={{ color: colors.text.primary }}>
                            {share.panNumber || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            ISIN Number
                          </label>
                          <p className="font-mono" style={{ color: colors.text.primary }}>
                            {share.isinNumber || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            CIN
                          </label>
                          <p className="font-mono text-sm" style={{ color: colors.text.primary }}>
                            {share.cin || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            RTA
                          </label>
                          <p className="font-semibold" style={{ color: colors.text.primary }}>
                            {share.rta || "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Financial Metrics */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card
                    className="backdrop-blur-sm border"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" style={{ color: colors.text.primary }}>
                        <BarChart3 className="w-5 h-5" />
                        Financial Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            P/E Ratio
                          </label>
                          <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            {share.peRatio || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            P/B Ratio
                          </label>
                          <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            {share.pbRatio || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Debt to Equity
                          </label>
                          <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            {share.debtToEquity || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            ROE
                          </label>
                          <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            {formatPercentage(share.roe)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Book Value
                          </label>
                          <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                            {formatCurrency(share.bookValue)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Face Value
                          </label>
                          <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                            {formatCurrency(share.faceValue)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                          Total Shares
                        </label>
                        <p className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                          {formatNumber(share.totalShares)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-8 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="space-y-6"
              >
                {/* Year Selection and Tab Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <h2 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                    Historical Financial Data
                  </h2>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        Year:
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-3 py-2 rounded-lg border text-sm font-medium"
                        style={{
                          backgroundColor: colors.background.light,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      >
                        {getAvailableYears().map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Data Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { id: "income", label: "Income Statement", icon: DollarSign },
                    { id: "balance", label: "Balance Sheet", icon: BarChart3 },
                    { id: "cashflow", label: "Cash Flow", icon: TrendingUp },
                    { id: "shareholding", label: "Shareholding", icon: Building2 },
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Button
                        key={tab.id}
                        variant={activeFinancialTab === tab.id ? "default" : "outline"}
                        onClick={() => setActiveFinancialTab(tab.id)}
                        className="flex items-center gap-2"
                        style={
                          activeFinancialTab === tab.id
                            ? {
                                backgroundColor: colors.primary.main,
                                borderColor: colors.primary.main,
                                color: "white",
                              }
                            : {
                                borderColor: colors.primary.light,
                                color: colors.text.primary,
                                backgroundColor: "transparent",
                              }
                        }
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </Button>
                    )
                  })}
                </div>

                {/* Income Statement */}
                {activeFinancialTab === "income" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      className="backdrop-blur-sm border"
                      style={{
                        backgroundColor: `${colors.background.main}CC`,
                        borderColor: `${colors.primary.light}80`,
                      }}
                    >
                      <CardHeader>
                        <CardTitle style={{ color: colors.text.primary }}>Income Statement - {selectedYear}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            { field: "revenue", label: "Revenue", isCurrency: true },
                            { field: "ebitda", label: "EBITDA", isCurrency: true },
                            { field: "pat", label: "PAT", isCurrency: true },
                            { field: "eps", label: "EPS", isCurrency: true },
                            { field: "operatingMargin", label: "Operating Margin", isPercentage: true },
                            { field: "netProfitMargin", label: "Net Profit Margin", isPercentage: true },
                          ].map((item) => (
                            <div key={item.field} className="space-y-2">
                              <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                                {item.label}
                              </label>
                              <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                                {formatFinancialValue(
                                  getFinancialValue("incomeStatement", item.field, selectedYear),
                                  item.isPercentage,
                                  item.isCurrency,
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Balance Sheet */}
                {activeFinancialTab === "balance" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      className="backdrop-blur-sm border"
                      style={{
                        backgroundColor: `${colors.background.main}CC`,
                        borderColor: `${colors.primary.light}80`,
                      }}
                    >
                      <CardHeader>
                        <CardTitle style={{ color: colors.text.primary }}>Balance Sheet - {selectedYear}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                              Assets
                            </h4>
                            <div className="space-y-4">
                              {[
                                { field: "totalAssets", label: "Total Assets" },
                                { field: "currentAssets", label: "Current Assets" },
                                { field: "fixedAssets", label: "Fixed Assets" },
                                { field: "investments", label: "Investments" },
                              ].map((item) => (
                                <div key={item.field} className="flex justify-between">
                                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                                    {item.label}:
                                  </span>
                                  <span className="font-semibold" style={{ color: colors.text.primary }}>
                                    {formatFinancialValue(
                                      getFinancialValue("balanceSheet", item.field, selectedYear),
                                      false,
                                      true,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                              Liabilities
                            </h4>
                            <div className="space-y-4">
                              {[
                                { field: "totalLiabilities", label: "Total Liabilities" },
                                { field: "currentLiabilities", label: "Current Liabilities" },
                                { field: "longTermDebt", label: "Long Term Debt" },
                                { field: "shareholderEquity", label: "Shareholder Equity" },
                              ].map((item) => (
                                <div key={item.field} className="flex justify-between">
                                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                                    {item.label}:
                                  </span>
                                  <span className="font-semibold" style={{ color: colors.text.primary }}>
                                    {formatFinancialValue(
                                      getFinancialValue("balanceSheet", item.field, selectedYear),
                                      false,
                                      true,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Cash Flow */}
                {activeFinancialTab === "cashflow" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      className="backdrop-blur-sm border"
                      style={{
                        backgroundColor: `${colors.background.main}CC`,
                        borderColor: `${colors.primary.light}80`,
                      }}
                    >
                      <CardHeader>
                        <CardTitle style={{ color: colors.text.primary }}>
                          Cash Flow Statement - {selectedYear}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                              Operating Activities
                            </h4>
                            <div className="space-y-3">
                              {[
                                { field: "operatingCashFlow", label: "Operating Cash Flow" },
                                { field: "netIncome", label: "Net Income" },
                              ].map((item) => (
                                <div key={item.field} className="space-y-1">
                                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                                    {item.label}
                                  </span>
                                  <p className="font-semibold" style={{ color: colors.text.primary }}>
                                    {formatFinancialValue(
                                      getFinancialValue("cashFlow", item.field, selectedYear),
                                      false,
                                      true,
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                              Investing Activities
                            </h4>
                            <div className="space-y-3">
                              {[
                                { field: "investingCashFlow", label: "Investing Cash Flow" },
                                { field: "capex", label: "Capital Expenditure" },
                              ].map((item) => (
                                <div key={item.field} className="space-y-1">
                                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                                    {item.label}
                                  </span>
                                  <p className="font-semibold" style={{ color: colors.text.primary }}>
                                    {formatFinancialValue(
                                      getFinancialValue("cashFlow", item.field, selectedYear),
                                      false,
                                      true,
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                              Financing Activities
                            </h4>
                            <div className="space-y-3">
                              {[
                                { field: "financingCashFlow", label: "Financing Cash Flow" },
                                { field: "freeCashFlow", label: "Free Cash Flow" },
                              ].map((item) => (
                                <div key={item.field} className="space-y-1">
                                  <span className="text-sm" style={{ color: colors.text.secondary }}>
                                    {item.label}
                                  </span>
                                  <p className="font-semibold" style={{ color: colors.text.primary }}>
                                    {formatFinancialValue(
                                      getFinancialValue("cashFlow", item.field, selectedYear),
                                      false,
                                      true,
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Shareholding Pattern */}
                {activeFinancialTab === "shareholding" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card
                      className="backdrop-blur-sm border"
                      style={{
                        backgroundColor: `${colors.background.main}CC`,
                        borderColor: `${colors.primary.light}80`,
                      }}
                    >
                      <CardHeader>
                        <CardTitle style={{ color: colors.text.primary }}>
                          Shareholding Pattern - {selectedYear}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[
                            { field: "promoterHolding", label: "Promoter Holding" },
                            { field: "publicHolding", label: "Public Holding" },
                            { field: "institutionalHolding", label: "Institutional Holding" },
                            { field: "mutualFunds", label: "Mutual Funds" },
                            { field: "foreignInvestors", label: "Foreign Investors" },
                            { field: "retailInvestors", label: "Retail Investors" },
                          ].map((item) => (
                            <div key={item.field} className="space-y-2">
                              <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                                {item.label}
                              </label>
                              <p className="text-xl font-bold" style={{ color: colors.text.primary }}>
                                {formatFinancialValue(
                                  getFinancialValue("shareholdingPattern", item.field, selectedYear),
                                  true,
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Enquiry Form Section */}
          <section className="py-8 px-4">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-2xl mx-auto"
              >
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: colors.text.primary }}>
                      <MessageSquare className="w-5 h-5" />
                      Enquire About {share?.sharesName}
                    </CardTitle>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      Get in touch with us for more information about this share
                    </p>
                  </CardHeader>
                  <CardContent>
                    {submitSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.success.main }} />
                        <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                          Enquiry Submitted Successfully!
                        </h3>
                        <p style={{ color: colors.text.secondary }}>
                          We'll get back to you soon with more information about {share?.sharesName}.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleEnquirySubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" style={{ color: colors.text.primary }}>
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              value={enquiryForm.name}
                              onChange={(e) => handleEnquiryChange("name", e.target.value)}
                              required
                              placeholder="Enter your full name"
                              style={{
                                borderColor: colors.primary.light,
                                backgroundColor: `${colors.background.light}80`,
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" style={{ color: colors.text.primary }}>
                              Phone Number *
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={enquiryForm.phone}
                              onChange={(e) => handleEnquiryChange("phone", e.target.value)}
                              required
                              placeholder="Enter your phone number"
                              style={{
                                borderColor: colors.primary.light,
                                backgroundColor: `${colors.background.light}80`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" style={{ color: colors.text.primary }}>
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={enquiryForm.email}
                            onChange={(e) => handleEnquiryChange("email", e.target.value)}
                            required
                            placeholder="Enter your email address"
                            style={{
                              borderColor: colors.primary.light,
                              backgroundColor: `${colors.background.light}80`,
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" style={{ color: colors.text.primary }}>
                            Message *
                          </Label>
                          <Textarea
                            id="message"
                            value={enquiryForm.message}
                            onChange={(e) => handleEnquiryChange("message", e.target.value)}
                            required
                            placeholder="Tell us what you'd like to know about this share..."
                            rows={4}
                            style={{
                              borderColor: colors.primary.light,
                              backgroundColor: `${colors.background.light}80`,
                            }}
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full"
                          style={{
                            backgroundColor: colors.primary.main,
                            borderColor: colors.primary.main,
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Enquiry
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </motion.div>
    </>
  )
}
