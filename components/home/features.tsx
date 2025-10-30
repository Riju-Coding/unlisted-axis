"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Eye, ArrowRight, BarChart3 } from "lucide-react"
import { colors } from "@/lib/colors"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"

const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

interface Share {
  id: string
  sharesName: string
  description: string
  logo: string
  depository: string
  minimumLotSize: number
  status: string
  createdAt: any
}

interface SharePrice {
  id: string
  shareId: string
  price: number
  changeType: "increase" | "decrease"
  timestamp: any
  reason?: string
}

interface ShareWithPrice extends Share {
  currentPrice?: number
  changeType?: "increase" | "decrease"
  priceTimestamp?: any
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  hover: {
    y: -8,
    scale: 1.02,
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

const getSectorColor = (description: string) => {
  const lowerDesc = description.toLowerCase()
  if (lowerDesc.includes("bank") || lowerDesc.includes("finance") || lowerDesc.includes("fintech"))
    return { from: colors.primary.main, to: colors.secondary.main }
  if (lowerDesc.includes("tech") || lowerDesc.includes("software"))
    return { from: colors.accent.main, to: colors.primary.main }
  if (lowerDesc.includes("food") || lowerDesc.includes("restaurant"))
    return { from: colors.secondary.main, to: colors.success.main }
  if (lowerDesc.includes("hospital") || lowerDesc.includes("travel"))
    return { from: colors.success.main, to: colors.accent.main }
  if (lowerDesc.includes("education") || lowerDesc.includes("learning"))
    return { from: colors.accent.main, to: colors.secondary.main }
  if (lowerDesc.includes("payment") || lowerDesc.includes("fintech"))
    return { from: colors.primary.main, to: colors.accent.main }
  if (lowerDesc.includes("ecommerce") || lowerDesc.includes("commerce"))
    return { from: colors.secondary.main, to: colors.primary.main }
  return { from: colors.neutral.medium, to: colors.neutral.dark }
}

const getSectorName = (description: string) => {
  const lowerDesc = description.toLowerCase()
  if (lowerDesc.includes("bank") || lowerDesc.includes("finance") || lowerDesc.includes("fintech")) return "Fintech"
  if (lowerDesc.includes("tech") || lowerDesc.includes("software")) return "Technology"
  if (lowerDesc.includes("food") || lowerDesc.includes("restaurant")) return "Food Tech"
  if (lowerDesc.includes("hospital") || lowerDesc.includes("travel")) return "Hospitality"
  if (lowerDesc.includes("education") || lowerDesc.includes("learning")) return "Education"
  if (lowerDesc.includes("payment") || lowerDesc.includes("fintech")) return "Fintech"
  if (lowerDesc.includes("ecommerce") || lowerDesc.includes("commerce")) return "E-commerce"
  return "Other"
}

export default function MarketListingsCards() {
  const [shares, setShares] = useState<ShareWithPrice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sharesQuery = query(collection(db, "shares"), orderBy("createdAt", "desc"), limit(8))

    const unsubscribe = onSnapshot(sharesQuery, async (snapshot) => {
      const sharesData: Share[] = []
      snapshot.forEach((doc) => {
        sharesData.push({ id: doc.id, ...doc.data() } as Share)
      })

      const sharesWithPrices: ShareWithPrice[] = await Promise.all(
        sharesData.map(async (share) => {
          try {
            const pricesQuery = query(collection(db, "sharePrices"), orderBy("timestamp", "desc"), limit(1))

            return new Promise<ShareWithPrice>((resolve) => {
              const priceUnsubscribe = onSnapshot(pricesQuery, (priceSnapshot) => {
                let shareWithPrice: ShareWithPrice = { ...share }

                priceSnapshot.forEach((priceDoc) => {
                  const priceData = priceDoc.data() as SharePrice
                  if (priceData.shareId === share.id) {
                    shareWithPrice = {
                      ...share,
                      currentPrice: priceData.price,
                      changeType: priceData.changeType,
                      priceTimestamp: priceData.timestamp,
                    }
                  }
                })

                resolve(shareWithPrice)
                priceUnsubscribe()
              })
            })
          } catch (error) {
            console.error("Error fetching price for share:", share.id, error)
            return share
          }
        }),
      )

      setShares(sharesWithPrices)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: `${colors.primary.main} transparent transparent transparent` }}
            ></div>
            <p style={{ color: colors.text.secondary }}>Loading market data...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="py-20 px-4"
      style={{
        background: `linear-gradient(135deg, ${colors.neutral.light}10, ${colors.neutral.light}20, ${colors.primary.light}10)`,
      }}
    >
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.text.primary }}>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
              }}
            >
              Trending Unlisted Shares
            </span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.text.secondary }}>
            Discover high-growth companies before they go public. Get exclusive access to India's most promising
            startups.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {shares.map((share, index) => (
            <motion.div key={share.id} variants={cardVariants} whileHover="hover" className="group">
              <Card
                className="h-full backdrop-blur-sm transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden relative"
                style={
                  {
                    backgroundColor: `${colors.background.white}CC`,
                    borderColor: `${colors.neutral.medium}40`,
                    "--hover-border-color": colors.primary.main,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary.main
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${colors.neutral.medium}40`
                }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main}05, ${colors.secondary.main}05, ${colors.accent.main}05)`,
                  }}
                />

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    {/* Company Logo/Icon */}
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${getSectorColor(share.description).from}, ${getSectorColor(share.description).to})`,
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {share.logo ? (
                        <img
                          src={share.logo || "/placeholder.svg"}
                          alt={share.sharesName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span style={{ color: colors.text.white }} className="font-bold text-lg">
                          {share.sharesName.charAt(0)}
                        </span>
                      )}
                    </motion.div>

                    {/* Depository Badge */}
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor:
                          share.depository === "NSDL" ? `${colors.primary.main}20` : `${colors.secondary.main}20`,
                        color: share.depository === "NSDL" ? colors.primary.main : colors.secondary.main,
                      }}
                    >
                      {share.depository}
                    </Badge>
                  </div>

                  {/* Company Info */}
                  <div>
                    <h3
                      className="font-bold text-lg mb-1 transition-colors line-clamp-1"
                      style={
                        {
                          color: colors.text.primary,
                          "--hover-color": colors.primary.main,
                        } as React.CSSProperties
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.primary.main
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.text.primary
                      }}
                    >
                      {share.sharesName}
                    </h3>
                    <p className="text-sm mb-2 line-clamp-1" style={{ color: colors.text.secondary }}>
                      {share.description}
                    </p>
                    <Badge variant="outline" className="text-xs" style={{ borderColor: colors.neutral.medium }}>
                      {getSectorName(share.description)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 pt-0">
                  {/* Price Section */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        {share.currentPrice ? `₹${share.currentPrice.toLocaleString()}` : "N/A"}
                      </div>
                      {share.changeType && (
                        <motion.div
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium`}
                          style={{
                            backgroundColor:
                              share.changeType === "increase" ? `${colors.success.main}40` : `${colors.error.main}40`,
                            color: share.changeType === "increase" ? colors.success.dark : colors.error.main,
                          }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                        >
                          {share.changeType === "increase" ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="capitalize">{share.changeType}</span>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs" style={{ color: colors.text.light }}>
                        Min Lot: {share.minimumLotSize} shares
                      </p>
                      {share.priceTimestamp && (
                        <p className="text-xs" style={{ color: colors.text.light }}>
                          {new Date(share.priceTimestamp).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link href={`/markets/${createSlug(share.sharesName)}?id=${share.id}`}>
                    <Button
                      className="w-full shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      style={
                        {
                          background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                          color: colors.text.white,
                          "--hover-bg": `linear-gradient(135deg, ${colors.primary.hover}, ${colors.secondary.hover})`,
                        } as React.CSSProperties
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.hover}, ${colors.secondary.hover})`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`
                      }}
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                      <motion.div
                        className="ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ArrowRight className="w-3 h-3" />
                      </motion.div>
                    </Button>
                  </Link>
                </CardContent>

                {/* Decorative elements */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"
                  style={{ background: `linear-gradient(135deg, ${colors.primary.main}10, transparent)` }}
                />
                <div
                  className="absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-700"
                  style={{ background: `linear-gradient(45deg, ${colors.secondary.main}10, transparent)` }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/markets">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button
                size="lg"
                variant="outline"
                className="px-12 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl group bg-transparent"
                style={
                  {
                    backgroundColor: `${colors.background.white}CC`,
                    borderColor: `${colors.primary.main}40`,
                    color: colors.primary.main,
                    "--hover-bg": `${colors.primary.main}10`,
                    "--hover-border": colors.primary.main,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.primary.main}10`
                  e.currentTarget.style.borderColor = colors.primary.main
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.background.white}CC`
                  e.currentTarget.style.borderColor = `${colors.primary.main}40`
                }}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                View All Markets
                <motion.div
                  className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick Stats */}
        
      </div>
    </section>
  )
}