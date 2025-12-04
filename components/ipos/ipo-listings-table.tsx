"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, TrendingUp, ArrowRight, Building2, Timer } from "lucide-react"
import Link from "next/link"

interface IPO {
  id: string
  active: boolean
  allotmentDate: string
  category: string
  closeDate: string
  companyLogo: string
  companyName: string
  companyWebsite: string
  createdAt: string
  createdBy: string
  creditDate: string
  description: string
  documents: {
    drhp: string
    prospectus: string
    rhp: string
  }
  featured: boolean
  financials: {
    netWorth: number
    profit: number
    revenue: number
  }
  gmp: number
  issueSize: number
  leadManagers: string[]
  listingDate: string
  lotSize: number
  objectives: string[]
  openDate: string
  priceRange: {
    max: number
    min: number
  }
  refundDate: string
  registrars: string
  sector: string
  seoDescription: string
  seoKeywords: string[]
  seoTitle: string
  slug: string
  status: string
  subscription: number
  updatedAt: string
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  hover: {
    y: -2,
    scale: 1.01,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function IPOListingsTable() {
  const [ipos, setIpos] = useState<IPO[]>([])
  const [loading, setLoading] = useState(true)
  const [nextIPOCountdown, setNextIPOCountdown] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  // Modal / enquiry form state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false)
  const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Set up real-time listener for active IPOs
    const iposQuery = query(collection(db, "ipos"), where("active", "==", true), orderBy("openDate", "desc"))

    const unsubscribeIpos = onSnapshot(iposQuery, (snapshot) => {
      const iposData: IPO[] = []
      snapshot.forEach((doc) => {
        iposData.push({ id: doc.id, ...(doc.data() as object) } as IPO)
      })

      setIpos(iposData)
      setLoading(false)
    })

    return () => {
      unsubscribeIpos()
    }
  }, [])

  // Countdown timer for next upcoming IPO
  useEffect(() => {
    const upcomingIPOs = ipos.filter((ipo) => ipo.status === "upcoming")
    if (upcomingIPOs.length === 0) {
      setNextIPOCountdown(null)
      return
    }

    // Find the next upcoming IPO
    const nextIPO = upcomingIPOs.reduce((earliest, current) => {
      return new Date(current.openDate) < new Date(earliest.openDate) ? current : earliest
    })

    const updateCountdown = () => {
      const now = new Date().getTime()
      const targetDate = new Date(nextIPO.openDate).getTime()
      const difference = targetDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setNextIPOCountdown({ days, hours, minutes, seconds })
      } else {
        setNextIPOCountdown(null)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [ipos])

  // small safe HTML->text stripper
  const stripHtml = (html?: string) => {
    if (!html) return ""
    try {
      if (typeof window !== "undefined" && "DOMParser" in window) {
        const doc = new DOMParser().parseFromString(html, "text/html")
        return doc.body.textContent || ""
      }
    } catch (e) {
      // fallback
    }
    return html.replace(/<\/?[^>]+(>|$)/g, "")
  }

  const openEnquiryFor = (ipo: IPO) => {
    setSelectedIpo(ipo)

    setEnquiryForm((prev) => ({
      ...prev,
      message: `I would like to apply for the ${ipo.companyName} IPO (₹${ipo.priceRange?.min ?? ""} - ₹${ipo.priceRange?.max ?? ""}). Please guide me through the application process.`,
    }))

    setIsEnquiryOpen(true)

    // focus modal after open
    setTimeout(() => modalRef.current?.focus(), 150)
  }

  const closeEnquiry = () => {
    setIsEnquiryOpen(false)
    setSelectedIpo(null)
    setEnquiryForm({ name: "", email: "", phone: "", message: "" })
    setIsSubmitting(false)
    setSubmitSuccess(false)
  }

  const handleEnquirySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedIpo) return

    setIsSubmitting(true)
    try {
      const clean = {
        name: stripHtml(enquiryForm.name),
        email: stripHtml(enquiryForm.email),
        phone: stripHtml(enquiryForm.phone),
        message: stripHtml(enquiryForm.message),
      }

      await addDoc(collection(db, "ipo-enquiries"), {
        ...clean,
        ipoId: selectedIpo.id,
        ipoName: selectedIpo.companyName,
        createdAt: serverTimestamp(),
      })

      setSubmitSuccess(true)

      // clear fields but keep modal open to show success
      setEnquiryForm({ name: "", email: "", phone: "", message: "" })

      // auto-close after brief delay
      setTimeout(() => {
        closeEnquiry()
      }, 3500)
    } catch (err) {
      console.error("Error submitting enquiry:", err)
      // keep modal open so user can retry
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Separate IPOs by status
  const upcomingIPOs = ipos.filter((ipo) => ipo.status === "upcoming").slice(0, 5)
  const recentIPOs = ipos.filter((ipo) => ipo.status === "open" || ipo.status === "closed").slice(0, 5)

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading IPO data...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto">
        {/* ... header and countdown (unchanged) */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 bg-clip-text text-transparent">
              Upcoming & Recent IPOs
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stay updated with the latest IPO launches and investment opportunities in real-time.
          </p>
        </motion.div>

        {nextIPOCountdown && (
          <motion.div className="mb-12" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Timer className="w-6 h-6 mr-2" />
                    <h3 className="text-2xl font-bold">Next IPO Opening In</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-3xl font-bold">{nextIPOCountdown.days}</div>
                      <div className="text-sm opacity-90">Days</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-3xl font-bold">{nextIPOCountdown.hours}</div>
                      <div className="text-sm opacity-90">Hours</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-3xl font-bold">{nextIPOCountdown.minutes}</div>
                      <div className="text-sm opacity-90">Minutes</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <div className="text-3xl font-bold">{nextIPOCountdown.seconds}</div>
                      <div className="text-sm opacity-90">Seconds</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* IPO Tables */}
        <motion.div className="grid lg:grid-cols-2 gap-8 mb-12" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {/* Upcoming IPOs */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-green-100/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Upcoming IPOs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Open Date</TableHead>
                        <TableHead>Price Band</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingIPOs.map((ipo) => (
                        <TableRow key={ipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                {ipo.companyLogo ? (
                                  <img src={ipo.companyLogo || "/placeholder.svg"} alt={ipo.companyName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                                    {ipo.companyName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{ipo.companyName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{ipo.sector}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatDate(ipo.openDate)}</TableCell>
                          <TableCell>
                            <div className="text-sm">₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(ipo.status)}>{ipo.status.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => openEnquiryFor(ipo)} className="bg-green-600 text-white">
                                Apply Now
                              </Button>
                              <Link href={`/ipos/${ipo.slug}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent IPOs */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-green-100/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Recent IPOs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Close Date</TableHead>
                        <TableHead>Price Band</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentIPOs.map((ipo) => (
                        <TableRow key={ipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                {ipo.companyLogo ? (
                                  <img src={ipo.companyLogo || "/placeholder.svg"} alt={ipo.companyName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                                    {ipo.companyName.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{ipo.companyName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{ipo.sector}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatDate(ipo.closeDate)}</TableCell>
                          <TableCell>
                            <div className="text-sm">₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(ipo.status)}>{ipo.status.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => openEnquiryFor(ipo)} className="bg-green-600 text-white">
                                Apply Now
                              </Button>
                              <Link href={`/ipos/${ipo.slug}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* View All CTA + Quick Stats (unchanged) */}
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
          <Link href="/ipos">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Building2 className="w-5 h-5 mr-3" />
                View All IPOs
                <motion.div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity" animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div className="mt-16 grid md:grid-cols-3 gap-6 text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.6 }}>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-green-100/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{upcomingIPOs.length}</div>
            <div className="text-gray-600 dark:text-gray-400">Upcoming IPOs</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-green-100/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{ipos.filter((ipo) => ipo.status === "open").length}</div>
            <div className="text-gray-600 dark:text-gray-400">Currently Open</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-green-100/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">₹{ipos.reduce((sum, ipo) => sum + (ipo.issueSize || 0), 0).toLocaleString()}Cr</div>
            <div className="text-gray-600 dark:text-gray-400">Total Issue Size</div>
          </div>
        </motion.div>
      </div>

      {/* Enquiry Modal */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEnquiry} />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            tabIndex={-1}
            className="relative z-10 max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedIpo?.companyName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apply / Enquiry for this IPO</p>
              </div>
              <div>
                <button onClick={closeEnquiry} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">Close</button>
              </div>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-green-600 mb-2">Submitted</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your enquiry has been received. We'll contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleEnquirySubmit(); }} className="space-y-4">
                <div>
                  <input
                    required
                    placeholder="Your Name"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 outline-none"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 outline-none"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Message..."
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm((p) => ({ ...p, message: e.target.value }))}
                    rows={4}
                    className="w-full rounded-md border px-3 py-2 bg-white dark:bg-gray-800 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Button type="button" onClick={handleEnquirySubmit} disabled={isSubmitting} className="bg-green-600 text-white">
                    {isSubmitting ? "Submitting..." : `Submit Enquiry`}
                  </Button>
                  <Button variant="outline" onClick={closeEnquiry}>Cancel</Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </section>
  )
}
