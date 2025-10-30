"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Building2, Search, Filter, ExternalLink, Star, Users, Target, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"

type PriceRange = {
  min: number
  max: number
}

interface IPO {
  id: string
  slug: string
  companyLogo?: string
  companyName: string
  sector: string
  featured?: boolean
  status: string
  priceRange: PriceRange
  issueSize: number
  subscription: number
  gmp: number
  openDate: string
  closeDate: string
  companyWebsite?: string
}

const ipoStats = [
  {
    title: "Active IPOs",
    value: "0",
    change: "Live",
    icon: Building2,
    color: colors.primary.main,
  },
  {
    title: "Open IPOs",
    value: "0",
    change: "Subscribe Now",
    icon: Target,
    color: colors.success.main,
  },
  {
    title: "Avg Subscription",
    value: "0x",
    change: "Current",
    icon: Users,
    color: colors.secondary.main,
  },
  {
    title: "Total Issue Size",
    value: "₹0 Cr",
    change: "Combined",
    icon: DollarSign,
    color: colors.accent.main,
  },
]

export default function IPOsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(ipoStats)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState(["All", "Open", "Closed", "Upcoming"])
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [filteredIpos, setFilteredIpos] = useState<IPO[]>([])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return `bg-[${colors.success.light}] text-[${colors.success.dark}]`
      case "closed":
        return `bg-[${colors.error.light}] text-[${colors.error.dark}]`
      case "upcoming":
        return `bg-[${colors.primary.light}] text-[${colors.primary.dark}]`
      default:
        return `bg-[${colors.neutral.light}] text-[${colors.neutral.dark}]`
    }
  }

  const getSubscriptionColor = (subscription: number) => {
    if (subscription >= 5) return `text-[${colors.success.main}]`
    if (subscription >= 2) return `text-[${colors.accent.main}]`
    return `text-[${colors.error.main}]`
  }

  const getDaysRemaining = (closeDate: string) => {
    const today = new Date()
    const closeDateObj = new Date(closeDate)
    const timeDifference = closeDateObj.getTime() - today.getTime()
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))
    return daysDifference
  }

  useEffect(() => {
    const q = query(collection(db, "ipos"), orderBy("openDate"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ipos: IPO[] = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<IPO, "id">) }))
      setFilteredIpos(ipos)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
          <p style={{ color: colors.text.secondary }}>Loading IPO data...</p>
        </div>
      </div>
    )
  }

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
        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <motion.div
              className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h1 className="text-5xl md:text-6xl font-black mb-4">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.text.secondary} 100%)`,
                    }}
                  >
                    IPO Listings
                  </span>
                </h1>
                <p style={{ color: colors.text.secondary }} className="text-xl">
                  Track latest IPOs, subscription status, and investment opportunities
                </p>
              </div>
              <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.02 }}>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: colors.primary.main }}
                ></div>
                <span className="text-sm font-medium" style={{ color: colors.primary.main }}>
                  LIVE UPDATES
                </span>
              </motion.div>
            </motion.div>

            {/* IPO Stats */}
           

            {/* Search and Filters */}
            <motion.div
              className="flex flex-col md:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: colors.text.secondary }}
                />
                <Input
                  placeholder="Search IPOs by company or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 backdrop-blur-sm border"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                    color: colors.text.primary,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    style={
                      selectedFilter === filter
                        ? {
                            backgroundColor: colors.primary.main,
                            borderColor: colors.primary.main,
                            color: "white",
                          }
                        : {
                            borderColor: colors.primary.light,
                            color: colors.primary.main,
                          }
                    }
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {filter}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* IPOs Grid */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredIpos.map((ipo, i) => (
                <motion.div key={ipo.id} variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border hover:shadow-xl transition-all duration-300 h-full"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: colors.neutral.light }}
                          >
                            {"companyLogo" in ipo && ipo.companyLogo ? (
                              <img
                                src={ipo.companyLogo || "/placeholder.svg"}
                                alt={"companyName" in ipo ? ipo.companyName : ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                                style={{
                                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                                }}
                              >
                                {ipo.companyName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg leading-tight" style={{ color: colors.text.primary }}>
                              <a
                                href={`/ipos/${ipo.slug}?id=${ipo.id}`}
                                className="hover:underline transition-colors duration-200"
                                style={{ color: colors.text.primary }}
                              >
                                {ipo.companyName}
                              </a>
                            </h3>
                            <p className="text-sm" style={{ color: colors.text.secondary }}>
                              {ipo.sector}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {ipo.featured && (
                            <Star className="w-4 h-4 fill-current" style={{ color: colors.accent.main }} />
                          )}
                          <Badge
                            className={getStatusColor(ipo.status)}
                            style={
                              ipo.status.toLowerCase() === "open"
                                ? {
                                    backgroundColor: colors.success.light,
                                    color: colors.success.dark,
                                  }
                                : ipo.status.toLowerCase() === "closed"
                                  ? {
                                      backgroundColor: colors.error.light,
                                      color: colors.error.dark,
                                    }
                                  : ipo.status.toLowerCase() === "upcoming"
                                    ? {
                                        backgroundColor: colors.primary.light,
                                        color: colors.primary.dark,
                                      }
                                    : {
                                        backgroundColor: colors.neutral.light,
                                        color: colors.neutral.dark,
                                      }
                            }
                          >
                            {ipo.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Price Range */}
                      <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: colors.neutral.light }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Price Range
                          </span>
                          <span className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                            Issue Size
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold" style={{ color: colors.text.primary }}>
                            ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
                          </span>
                          <span className="font-bold" style={{ color: colors.text.primary }}>
                            ₹{ipo.issueSize} Cr
                          </span>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.neutral.light }}>
                          <div className="text-xs mb-1" style={{ color: colors.text.secondary }}>
                            Subscription
                          </div>
                          <div
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
                          </div>
                        </div>
                        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: colors.neutral.light }}>
                          <div className="text-xs mb-1" style={{ color: colors.text.secondary }}>
                            GMP
                          </div>
                          <div
                            className="font-bold"
                            style={{
                              color:
                                ipo.gmp > 0
                                  ? colors.success.main
                                  : ipo.gmp < 0
                                    ? colors.error.main
                                    : colors.text.secondary,
                            }}
                          >
                            ₹{ipo.gmp}
                          </div>
                        </div>
                      </div>

                      {/* Subscription Progress */}
                      {ipo.status === "open" && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs" style={{ color: colors.text.secondary }}>
                              Subscription Progress
                            </span>
                            <span className="text-xs" style={{ color: colors.text.secondary }}>
                              {ipo.subscription}x
                            </span>
                          </div>
                          <Progress value={Math.min(ipo.subscription * 20, 100)} className="h-2" />
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Important Dates */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center" style={{ color: colors.text.secondary }}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Open Date
                          </span>
                          <span className="font-medium" style={{ color: colors.text.primary }}>
                            {new Date(ipo.openDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center" style={{ color: colors.text.secondary }}>
                            <Clock className="w-3 h-3 mr-1" />
                            Close Date
                          </span>
                          <span className="font-medium" style={{ color: colors.text.primary }}>
                            {new Date(ipo.closeDate).toLocaleDateString()}
                          </span>
                        </div>
                        {ipo.status === "open" && (
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: colors.text.secondary }}>Days Remaining</span>
                            <span className="font-bold" style={{ color: colors.error.main }}>
                              {getDaysRemaining(ipo.closeDate)} days
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={ipo.status !== "open"}
                          style={{
                            backgroundColor: colors.primary.main,
                            borderColor: colors.primary.main,
                            color: "white",
                          }}
                        >
                          {ipo.status === "open" ? "Apply Now" : "View Details"}
                        </Button>
                        {ipo.companyWebsite && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            style={{
                              borderColor: colors.primary.light,
                              color: colors.primary.main,
                            }}
                          >
                            <a href={ipo.companyWebsite} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {filteredIpos.length === 0 && (
              <div className="text-center py-12">
                <div className="mb-2" style={{ color: colors.text.secondary }}>
                  No IPOs found
                </div>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Try adjusting your search or filter criteria
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  )
}
