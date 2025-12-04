"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  ExternalLink,
  Star,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react"
import { pageVariants, staggerContainer } from "@/lib/animations"
import { colors } from "@/lib/colors"

interface IPO {
  id: string
  companyLogo?: string
  companyName: string
  sector: string
  category: string
  featured?: boolean
  status: string
  priceRange: {
    min: number
    max: number
  }
  issueSize: number
  subscription: number
  gmp: number
  lotSize: number
  openDate: string
  closeDate: string
  allotmentDate?: string
  listingDate?: string
  refundDate?: string
  creditDate?: string
  companyWebsite?: string
  description?: string
  leadManagers?: string[]
  registrars?: string
  objectives?: string[]
  financials?: {
    revenue?: number
    profit?: number
    netWorth?: number
  }
  documents?: {
    drhp?: string
    rhp?: string
    prospectus?: string
  }
  seoTitle?: string
  seoDescription?: string
  slug: string
}

interface EnquiryForm {
  name: string
  email: string
  phone: string
  message: string
}

interface IPODetailPageProps {
  slug: string
  id?: string
}

export default function IPODetailPage({ slug, id }: IPODetailPageProps) {
  const [ipo, setIpo] = useState<IPO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState<EnquiryForm>({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // ref to the enquiry form container so Apply Now can scroll to it
  const enquiryRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const fetchIPO = async () => {
      try {
        console.log("[v0] Starting IPO fetch process")
        console.log("[v0] Slug:", slug, "ID:", id)

        if (!db) {
          console.error("[v0] Firebase database not initialized")
          setError("Database connection failed")
          return
        }

        let ipoData: IPO | null = null

        // Try to fetch by ID first if provided
        if (id) {
          console.log("[v0] Attempting to fetch by ID:", id)
          try {
            const docRef = doc(db, "ipos", id)
            const docSnap = await getDoc(docRef)
            console.log("[v0] Document snapshot exists:", docSnap.exists())

            if (docSnap.exists()) {
              const data = docSnap.data()
              ipoData = { id: docSnap.id, ...(data as object) } as IPO
              console.log("[v0] Successfully fetched IPO by ID:", ipoData.companyName)
            }
          } catch (idError) {
            console.error("[v0] Error fetching by ID:", idError)
          }
        }

        // Fallback to slug-based search
        if (!ipoData && slug) {
          console.log("[v0] Attempting to fetch by slug:", slug)
          try {
            const q = query(collection(db, "ipos"), where("slug", "==", slug))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0]
              const data = docSnap.data()
              ipoData = { id: docSnap.id, ...(data as object) } as IPO
              console.log("[v0] Successfully fetched IPO by slug:", ipoData.companyName)
            }
          } catch (slugError) {
            console.error("[v0] Error fetching by slug:", slugError)
          }
        }

        if (ipoData) {
          console.log("[v0] Setting IPO data:", ipoData.companyName)
          setIpo(ipoData)
          setError(null)
        } else {
          console.log("[v0] No IPO data found")
          setError("IPO not found")
        }
      } catch (err) {
        console.error("[v0] Critical error in fetchIPO:", err)
        setError(
          `Failed to load IPO details: ${err instanceof Error ? err.message : "Unknown error"}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchIPO()
  }, [slug, id, mounted])

  // Helper: strip HTML -> plain text (use DOMParser on client, fallback to regex for SSR)
  const stripHtml = (html?: string) => {
    if (!html) return ""
    try {
      if (typeof window !== "undefined" && "DOMParser" in window) {
        const doc = new DOMParser().parseFromString(html, "text/html")
        return doc.body.textContent || ""
      }
    } catch (e) {
      // fallthrough to regex fallback
    }
    return html.replace(/<\/?[^>]+(>|$)/g, "")
  }

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ipo || !mounted) return

    setIsSubmitting(true)
    try {
      console.log("[v0] Submitting enquiry for IPO:", ipo.companyName)

      // sanitize all fields to avoid storing HTML tags or markup
      const cleanEnquiry = {
        ...enquiryForm,
        name: stripHtml(enquiryForm.name),
        email: stripHtml(enquiryForm.email),
        phone: stripHtml(enquiryForm.phone),
        message: stripHtml(enquiryForm.message),
      }

      await addDoc(collection(db, "ipo-enquiries"), {
        ...cleanEnquiry,
        ipoId: ipo.id,
        ipoName: ipo.companyName,
        createdAt: serverTimestamp(),
      })

      console.log("[v0] Enquiry submitted successfully")
      setSubmitSuccess(true)
      setEnquiryForm({ name: "", email: "", phone: "", message: "" })

      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error) {
      console.error("[v0] Error submitting enquiry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // When user clicks Apply Now:
  // - Prefill the enquiry message with a friendly default
  // - Scroll the enquiry area into view and focus first input
  const handleApplyNow = () => {
    if (!ipo) return

    setEnquiryForm((prev) => ({
      ...prev,
      message: `I would like to apply for the ${ipo.companyName} IPO (₹${ipo.priceRange?.min} - ₹${ipo.priceRange?.max}). Please guide me through the application process.`,
    }))

    // scroll the enquiry form into view (smooth)
    enquiryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })

    // focus the first interactive field inside the enquiry area after a short delay
    // (delay helps when browser is animating scroll)
    setTimeout(() => {
      const field = enquiryRef.current?.querySelector("input, textarea") as HTMLElement | null
      field?.focus()
    }, 300)
  }

  if (!mounted || loading) {
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
          <p style={{ color: colors.text.secondary }}>Loading IPO details...</p>
        </div>
      </div>
    )
  }

  if (error || !ipo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.main} 50%, ${colors.background.dark} 100%)`,
        }}
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.error.main }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
            IPO Not Found
          </h1>
          <p style={{ color: colors.text.secondary }}>{error || "The requested IPO could not be found."}</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return { bg: colors.success.light, text: colors.success.dark }
      case "closed":
        return { bg: colors.error.light, text: colors.error.dark }
      case "upcoming":
        return { bg: colors.primary.light, text: colors.primary.dark }
      default:
        return { bg: colors.neutral.light, text: colors.neutral.dark }
    }
  }

  const getDaysRemaining = (closeDate: string) => {
    if (!mounted) return 0 // Return consistent value during SSR
    const today = new Date()
    const closeDateObj = new Date(closeDate)
    const timeDifference = closeDateObj.getTime() - today.getTime()
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
    return daysDifference
  }

  const statusColors = getStatusColor(ipo.status)

  return (
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
        <div className="container mx-auto px-4">
          {/* IPO Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card
              className="backdrop-blur-sm border"
              style={{
                backgroundColor: `${colors.background.main}CC`,
                borderColor: `${colors.primary.light}80`,
              }}
            >
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: colors.neutral.light }}
                    >
                      {ipo.companyLogo ? (
                        <img
                          src={ipo.companyLogo || "/placeholder.svg"}
                          alt={ipo.companyName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                          }}
                        >
                          {ipo.companyName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                          {ipo.companyName}
                        </h1>
                        {ipo.featured && <Star className="w-5 h-5 fill-current" style={{ color: colors.accent.main }} />}
                      </div>
                      <p className="text-lg" style={{ color: colors.text.secondary }}>
                        {ipo.sector} • {ipo.category.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="px-3 py-1"
                      style={{
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                      }}
                    >
                      {ipo.status.toUpperCase()}
                    </Badge>
                    {ipo.companyWebsite && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        style={{
                          borderColor: colors.primary.light,
                          color: colors.primary.main,
                        }}
                      >
                        <a href={ipo.companyWebsite} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span style={{ color: colors.text.secondary }}>Price Range</span>
                          <span className="font-bold" style={{ color: colors.text.primary }}>
                            ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: colors.text.secondary }}>Issue Size</span>
                          <span className="font-bold" style={{ color: colors.text.primary }}>
                            ₹{ipo.issueSize} Cr
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: colors.text.secondary }}>Lot Size</span>
                          <span className="font-bold" style={{ color: colors.text.primary }}>
                            {ipo.lotSize} Shares
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span style={{ color: colors.text.secondary }}>Subscription</span>
                          <span
                            className="font-bold"
                            style={{
                              color:
                                ipo.subscription >= 5
                                  ? colors.success.main
                                  : ipo.subscription >= 2
                                  ? colors.accent.main
                                  : colors.error.main,
                            }}
                          >
                            {ipo.subscription}x
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: colors.text.secondary }}>GMP</span>
                          <span
                            className="font-bold"
                            style={{
                              color:
                                ipo.gmp > 0 ? colors.success.main : ipo.gmp < 0 ? colors.error.main : colors.text.secondary,
                            }}
                          >
                            ₹{ipo.gmp}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span style={{ color: colors.text.secondary }}>Registrars</span>
                          <span className="font-bold" style={{ color: colors.text.primary }}>
                            {ipo.registrars || "TBA"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Progress */}
                    {ipo.status === "open" && (
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span style={{ color: colors.text.secondary }}>Subscription Progress</span>
                          <span style={{ color: colors.text.secondary }}>{ipo.subscription}x</span>
                        </div>
                        <Progress value={Math.min(ipo.subscription * 20, 100)} className="h-3" />
                        {mounted && ipo.status === "open" && (
                          <div className="flex justify-between items-center mt-2 text-sm">
                            <span style={{ color: colors.text.secondary }}>Days Remaining</span>
                            <span className="font-bold" style={{ color: colors.error.main }}>
                              {getDaysRemaining(ipo.closeDate)} days
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Important Dates */}
              <Card
                className="backdrop-blur-sm border"
                style={{
                  backgroundColor: `${colors.background.main}CC`,
                  borderColor: `${colors.primary.light}80`,
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text.primary }}>Important Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center" style={{ color: colors.text.secondary }}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Open Date
                        </span>
                        <span className="font-medium" style={{ color: colors.text.primary }}>
                          {mounted ? new Date(ipo.openDate).toLocaleDateString() : "Loading..."}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center" style={{ color: colors.text.secondary }}>
                          <Clock className="w-4 h-4 mr-2" />
                          Close Date
                        </span>
                        <span className="font-medium" style={{ color: colors.text.primary }}>
                          {mounted ? new Date(ipo.closeDate).toLocaleDateString() : "Loading..."}
                        </span>
                      </div>
                      {ipo.listingDate && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center" style={{ color: colors.text.secondary }}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Listing Date
                          </span>
                          <span className="font-medium" style={{ color: colors.text.primary }}>
                            {mounted ? new Date(ipo.listingDate).toLocaleDateString() : "Loading..."}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {ipo.allotmentDate && (
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.text.secondary }}>Allotment Date</span>
                          <span className="font-medium" style={{ color: colors.text.primary }}>
                            {mounted ? new Date(ipo.allotmentDate).toLocaleDateString() : "Loading..."}
                          </span>
                        </div>
                      )}
                      {ipo.refundDate && (
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.text.secondary }}>Refund Date</span>
                          <span className="font-medium" style={{ color: colors.text.primary }}>
                            {mounted ? new Date(ipo.refundDate).toLocaleDateString() : "Loading..."}
                          </span>
                        </div>
                      )}
                      {ipo.creditDate && (
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.text.secondary }}>Credit Date</span>
                          <span className="font-medium" style={{ color: colors.text.primary }}>
                            {mounted ? new Date(ipo.creditDate).toLocaleDateString() : "Loading..."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Description - stripped to plain text */}
              {ipo.description && (
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>About the Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ color: colors.text.secondary }} className="leading-relaxed">
                      {stripHtml(ipo.description)}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Financials */}
              {ipo.financials && (
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>Financial Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {ipo.financials.revenue && (
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.neutral.light }}>
                          <div className="text-2xl font-bold mb-1" style={{ color: colors.text.primary }}>
                            ₹{ipo.financials.revenue} Cr
                          </div>
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            Revenue
                          </div>
                        </div>
                      )}
                      {ipo.financials.profit && (
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.neutral.light }}>
                          <div className="text-2xl font-bold mb-1" style={{ color: colors.text.primary }}>
                            ₹{ipo.financials.profit} Cr
                          </div>
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            Profit
                          </div>
                        </div>
                      )}
                      {ipo.financials.netWorth && (
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.neutral.light }}>
                          <div className="text-2xl font-bold mb-1" style={{ color: colors.text.primary }}>
                            ₹{ipo.financials.netWorth} Cr
                          </div>
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            Net Worth
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Objectives */}
              {ipo.objectives && ipo.objectives.length > 0 && (
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>Objects of the Issue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ipo.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <div
                            className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                            style={{ backgroundColor: colors.primary.main }}
                          ></div>
                          <span style={{ color: colors.text.secondary }}>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Lead Managers */}
              {ipo.leadManagers && ipo.leadManagers.length > 0 && (
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>Lead Managers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {ipo.leadManagers.map((manager, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          style={{
                            borderColor: colors.primary.light,
                            color: colors.primary.main,
                          }}
                        >
                          {manager}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              {ipo.documents && (ipo.documents.drhp || ipo.documents.rhp || ipo.documents.prospectus) && (
                <Card
                  className="backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {ipo.documents.drhp && (
                        <Button
                          variant="outline"
                          asChild
                          className="h-auto p-4 bg-transparent"
                          style={{
                            borderColor: colors.primary.light,
                            color: colors.primary.main,
                          }}
                        >
                          <a href={ipo.documents.drhp} target="_blank" rel="noopener noreferrer">
                            <div className="text-center">
                              <FileText className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">DRHP</div>
                              <div className="text-xs opacity-70">Draft Red Herring Prospectus</div>
                            </div>
                          </a>
                        </Button>
                      )}
                      {ipo.documents.rhp && (
                        <Button
                          variant="outline"
                          asChild
                          className="h-auto p-4 bg-transparent"
                          style={{
                            borderColor: colors.primary.light,
                            color: colors.primary.main,
                          }}
                        >
                          <a href={ipo.documents.rhp} target="_blank" rel="noopener noreferrer">
                            <div className="text-center">
                              <FileText className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">RHP</div>
                              <div className="text-xs opacity-70">Red Herring Prospectus</div>
                            </div>
                          </a>
                        </Button>
                      )}
                      {ipo.documents.prospectus && (
                        <Button
                          variant="outline"
                          asChild
                          className="h-auto p-4 bg-transparent"
                          style={{
                            borderColor: colors.primary.light,
                            color: colors.primary.main,
                          }}
                        >
                          <a href={ipo.documents.prospectus} target="_blank" rel="noopener noreferrer">
                            <div className="text-center">
                              <FileText className="w-8 h-8 mx-auto mb-2" />
                              <div className="font-medium">Prospectus</div>
                              <div className="text-xs opacity-70">Final Prospectus</div>
                            </div>
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card
                className="backdrop-blur-sm border"
                style={{
                  backgroundColor: `${colors.background.main}CC`,
                  borderColor: `${colors.primary.light}80`,
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text.primary }}>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    disabled={ipo.status !== "open"}
                    onClick={handleApplyNow}
                    style={{
                      backgroundColor: ipo.status === "open" ? colors.primary.main : colors.neutral.main,
                      borderColor: ipo.status === "open" ? colors.primary.main : colors.neutral.main,
                      color: "white",
                    }}
                  >
                    {ipo.status === "open" ? "Apply Now" : "Not Available"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    style={{
                      borderColor: colors.primary.light,
                      color: colors.primary.main,
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Prospectus
                  </Button>
                </CardContent>
              </Card>

              {/* IPO Enquiry Form */}
              <Card
                className="backdrop-blur-sm border"
                style={{
                  backgroundColor: `${colors.background.main}CC`,
                  borderColor: `${colors.primary.light}80`,
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text.primary }}>IPO Enquiry</CardTitle>
                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                    Get expert guidance on this IPO investment
                  </p>
                </CardHeader>
                <CardContent>
                  {/* attach ref to this wrapper so Apply Now can scroll into view */}
                  <div ref={enquiryRef}>
                    {submitSuccess ? (
                      <div className="text-center py-6">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: colors.success.main }} />
                        <h3 className="font-semibold mb-2" style={{ color: colors.text.primary }}>
                          Enquiry Submitted!
                        </h3>
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                          Our team will contact you soon with IPO guidance.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleEnquirySubmit} className="space-y-4">
                        <div>
                          <Input
                            placeholder="Your Name"
                            value={enquiryForm.name}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                            required
                            className="backdrop-blur-sm"
                            style={{
                              backgroundColor: `${colors.background.main}CC`,
                              borderColor: `${colors.primary.light}80`,
                              color: colors.text.primary,
                            }}
                          />
                        </div>
                        <div>
                          <Input
                            type="email"
                            placeholder="Email Address"
                            value={enquiryForm.email}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                            required
                            className="backdrop-blur-sm"
                            style={{
                              backgroundColor: `${colors.background.main}CC`,
                              borderColor: `${colors.primary.light}80`,
                              color: colors.text.primary,
                            }}
                          />
                        </div>
                        <div>
                          <Input
                            type="tel"
                            placeholder="Phone Number"
                            value={enquiryForm.phone}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                            required
                            className="backdrop-blur-sm"
                            style={{
                              backgroundColor: `${colors.background.main}CC`,
                              borderColor: `${colors.primary.light}80`,
                              color: colors.text.primary,
                            }}
                          />
                        </div>
                        <div>
                          <Textarea
                            placeholder="Your message or questions about this IPO..."
                            value={enquiryForm.message}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                            rows={3}
                            className="backdrop-blur-sm"
                            style={{
                              backgroundColor: `${colors.background.main}CC`,
                              borderColor: `${colors.primary.light}80`,
                              color: colors.text.primary,
                            }}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                          style={{
                            backgroundColor: colors.primary.main,
                            borderColor: colors.primary.main,
                            color: "white",
                          }}
                        >
                          {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  )
}
