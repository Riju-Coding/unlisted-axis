"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, BarChart3, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { pageVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

const truncateWords = (text: string, maxWords: number) => {
  if (!text) return ""
  const words = text.trim().split(/\s+/)
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "…" : text
}

const marketStats = [
  {
    title: "Active Shares",
    value: "0",
    change: "Live",
    icon: Activity,
    color: colors.primary.main,
  },
  {
    title: "Gainers",
    value: "0",
    change: "Today",
    icon: TrendingUp,
    color: colors.success.main,
  },
  {
    title: "Decliners",
    value: "0",
    change: "Today",
    icon: TrendingDown,
    color: colors.error.main,
  },
  {
    title: "Market Cap",
    value: "₹0",
    change: "Total",
    icon: BarChart3,
    color: colors.accent.main,
  },
]

export default function MarketsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(marketStats)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState(["All", "NSDL", "CDSL"])
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [shares, setShares] = useState([])
  const [filteredShares, setFilteredShares] = useState([])

  useEffect(() => {
    const q = query(collection(db, "shares"), orderBy("sharesName"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sharesData = []
      querySnapshot.forEach((doc) => {
        sharesData.push({ id: doc.id, ...doc.data() })
      })
      setShares(sharesData)
      setFilteredShares(sharesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedFilter === "All") {
      setFilteredShares(shares)
    } else {
      setFilteredShares(shares.filter((share) => share.depository === selectedFilter))
    }
  }, [selectedFilter, shares])

  useEffect(() => {
    setFilteredShares(shares.filter((share) => share.sharesName.toLowerCase().includes(searchTerm.toLowerCase())))
  }, [searchTerm, shares])

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
          <p style={{ color: colors.text.secondary }}>Loading market data...</p>
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
                <h1 className="text-5xl md:text-6xl font-black mb-11">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary.main} 50%, ${colors.accent.main} 100%)`,
                    }}
                  >
                    Live Markets
                  </span>
                </h1>
                <p style={{ color: colors.text.secondary }} className="text-xl">
                  Real-time share prices and market updates
                </p>
              </div>
              <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.02 }}>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: colors.success.main }}
                ></div>
                <span className="text-sm font-medium" style={{ color: colors.success.main }}>
                  LIVE
                </span>
              </motion.div>
            </motion.div>

            {/* Market Stats */}

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
                  placeholder="Search shares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 backdrop-blur-sm"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                    color: colors.text.primary,
                  }}
                />
              </div>
              <div className="flex space-x-2">
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
                            color: colors.text.primary,
                          }
                    }
                    className="hover:opacity-90"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {filter}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Shares Table */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="backdrop-blur-sm rounded-xl border shadow-xl overflow-hidden"
              style={{
                backgroundColor: `${colors.background.main}CC`,
                borderColor: `${colors.primary.light}80`,
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="p-6 border-b" style={{ borderColor: `${colors.primary.light}80` }}>
                <h3 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                  Market Shares ({filteredShares.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: `${colors.neutral.light}80` }}>
                    <tr>
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold"
                        style={{ color: colors.text.secondary }}
                      >
                        Share
                      </th>
                      <th
                        className="px-6 py-4 text-center text-sm font-semibold"
                        style={{ color: colors.text.secondary }}
                      >
                        Depository
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-semibold"
                        style={{ color: colors.text.secondary }}
                      >
                        Min Lot
                      </th>
                      <th
                        className="px-6 py-4 text-right text-sm font-semibold"
                        style={{ color: colors.text.secondary }}
                      >
                        Current Price
                      </th>
                      <th
                        className="px-6 py-4 text-center text-sm font-semibold"
                        style={{ color: colors.text.secondary }}
                      >
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShares.map((share, i) => (
                      <motion.tr
                        key={share.id}
                        className="border-b hover:bg-opacity-50 transition-colors"
                        style={{
                          borderColor: `${colors.neutral.light}80`,
                          ":hover": { backgroundColor: `${colors.primary.light}20` },
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Link href={`/markets/${createSlug(share.sharesName)}?id=${share.id}`}>
                              <div
                                className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
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
                                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                                    style={{
                                      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                                    }}
                                  >
                                    {share.sharesName.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Link href={`/markets/${createSlug(share.sharesName)}?id=${share.id}`}>
                                  <span className="font-semibold hover:underline cursor-pointer" style={{ color: colors.text.primary }}>
                                    {share.sharesName}
                                  </span>
                                </Link>
                                <Link href={`/markets/${createSlug(share.sharesName)}?id=${share.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    style={{
                                      color: colors.primary.main,
                                      borderColor: colors.primary.light,
                                    }}
                                  >
                                    Read more →
                                  </Button>
                                </Link>
                              </div>
                              <div className="text-sm" style={{ color: colors.text.secondary }}>
                                {truncateWords(share.description, 10)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
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
                            {share.depository}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-medium" style={{ color: colors.text.primary }}>
                          {share.minimumLotSize}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-lg" style={{ color: colors.text.primary }}>
                            {share.currentPrice ? `₹${share.currentPrice}` : "N/A"}
                          </div>
                          {share.priceTimestamp && (
                            <div className="text-xs" style={{ color: colors.text.secondary }}>
                              {new Date(share.priceTimestamp.toDate()).toLocaleTimeString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {share.changeType ? (
                            <motion.div
                              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium"
                              style={
                                share.changeType === "increase"
                                  ? {
                                      backgroundColor: `${colors.success.light}40`,
                                      color: colors.success.main,
                                    }
                                  : {
                                      backgroundColor: `${colors.error.light}40`,
                                      color: colors.error.main,
                                    }
                              }
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
                            >
                              {share.changeType === "increase" ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span className="capitalize">{share.changeType}</span>
                            </motion.div>
                          ) : (
                            <span style={{ color: colors.text.secondary }}>-</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredShares.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mb-2" style={{ color: colors.text.secondary }}>
                      No shares found
                    </div>
                    <div className="text-sm" style={{ color: colors.text.secondary }}>
                      Try adjusting your search or filter criteria
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  )
}