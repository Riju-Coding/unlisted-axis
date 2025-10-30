"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, addDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Search, X, MessageSquare, ExternalLink, Globe, FileText } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"
import Header from "@/components/home/header"

interface UnlistedStock {
  id: string
  sharesName: string
  currentPrice: number
  faceValue?: number
  sector?: string
  description?: string
  logo?: string
  depository: string
  minimumLotSize: number
  weekHigh52?: number
  weekLow52?: number
  peRatio?: number
  pbRatio?: number
  bookValue?: number
  marketCap?: number
  roe?: number
  debtToEquity?: number
  totalShares?: number
  cin?: string
  panNumber?: string
  isinNumber?: string
  rta?: string
  website?: string
  blogUrl?: string
  status: string
  category?: string
}

// Collection: stock-financials
interface StockFinancial {
  id: string
  stockId: string
  year: string
  revenue: number
  profit: number
  netProfit?: number
  totalAssets?: number
  totalLiabilities?: number
  createdAt: any
}

// Collection: stock-shareholding
interface StockShareholding {
  id: string
  stockId: string
  promoters: number
  institutions: number
  retail: number
  others?: number
  updatedAt: any
}

// Collection: peerComparisons
interface StockPeer {
  id: string
  shareId: string
  companyName: string
  peRatio: number
  pbRatio: number
  marketCap?: number
  currentPrice: number
  debtToEquity: number
  roe: number
  createdAt: any
  createdBy: string
}

// Collection: stock-news
interface StockNews {
  id: string
  stockId?: string // if null, it's general market news
  title: string
  content?: string
  date: any
  source: string
  url?: string
  category: "ipo" | "earnings" | "expansion" | "regulatory" | "general"
}

// Collection: unlisted-stock-enquiry
interface StockEnquiry {
  stockId: string
  stockName: string
  name: string
  mobile: string
  email?: string
  quantity: number
  enquiryType: "buy" | "sell" | "enquire"
  message?: string
  timestamp: any
  status: "pending" | "contacted" | "closed"
}

type TimeFilter = "1M" | "1Y" | "MAX" | "CURRENT"

interface PricePopup {
  show: boolean
  price: number
  x: number
  y: number
}

export default function UnlistedStocksPage() {
  const [loading, setLoading] = useState(true)
  const [stocks, setStocks] = useState<UnlistedStock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<UnlistedStock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSector, setSelectedSector] = useState("All")
  const [selectedStock, setSelectedStock] = useState<UnlistedStock | null>(null)
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [enquiryType, setEnquiryType] = useState<"buy" | "sell" | "enquire">("enquire")
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", quantity: 1, message: "" })

  // Data for selected stock
  const [stockFinancials, setStockFinancials] = useState<StockFinancial[]>([])
  const [stockShareholding, setStockShareholding] = useState<StockShareholding | null>(null)
  const [stockPeers, setStockPeers] = useState<StockPeer[]>([])
  const [stockNews, setStockNews] = useState<StockNews[]>([])

  const [chartData, setChartData] = useState<any[]>([])

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("CURRENT")
  const [pricePopup, setPricePopup] = useState<PricePopup>({ show: false, price: 0, x: 0, y: 0 })
  const [filteredChartData, setFilteredChartData] = useState<any[]>([])

  // const chartData = [
  //   { time: "10:00 AM", price: 1250, changeType: "increase" },
  //   { time: "11:00 AM", price: 1275, changeType: "increase" },
  //   { time: "12:00 PM", price: 1260, changeType: "decrease" },
  //   { time: "1:00 PM", price: 1280, changeType: "increase" },
  //   { time: "2:00 PM", price: 1295, changeType: "increase" },
  // ]

  // Fetch stocks data
  useEffect(() => {
    const q = query(collection(db, "shares"), orderBy("sharesName"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const stocksData: UnlistedStock[] = []
      querySnapshot.forEach((doc) => {
        stocksData.push({ id: doc.id, ...doc.data() } as UnlistedStock)
      })
      setStocks(stocksData.filter((stock) => stock.status === "active"))
      setFilteredStocks(stocksData.filter((stock) => stock.status === "active"))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Fetch selected stock data
  useEffect(() => {
    if (!selectedStock) return

    const peersQuery = query(collection(db, "peerComparisons"), where("shareId", "==", selectedStock.id))
    const unsubPeers = onSnapshot(peersQuery, (snapshot) => {
      console.log("[v0] Fetching peers for shareId:", selectedStock.id)
      console.log("[v0] Peers snapshot size:", snapshot.size)

      const peers: StockPeer[] = []
      snapshot.forEach((doc) => {
        console.log("[v0] Peer document data:", doc.data())
        peers.push({ id: doc.id, ...doc.data() } as StockPeer)
      })
      console.log("[v0] Final peers array:", peers)
      setStockPeers(peers)
    })

    const newsQuery = query(
      collection(db, "news"),
      where("shareId", "==", selectedStock.id),
      orderBy("publishDate", "desc"),
    )
    const unsubNews = onSnapshot(newsQuery, (snapshot) => {
      console.log("[v0] Fetching news for shareId:", selectedStock.id)
      console.log("[v0] News snapshot size:", snapshot.size)

      const news: StockNews[] = []
      snapshot.forEach((doc) => {
        console.log("[v0] News document data:", doc.data())
        news.push({ id: doc.id, ...doc.data() } as StockNews)
      })
      console.log("[v0] Final news array:", news)
      setStockNews(news)
    })

    const sharePricesQuery = query(
      collection(db, "sharePrices"),
      where("shareId", "==", selectedStock.id),
      orderBy("timestamp", "desc"),
    )
    const unsubSharePrices = onSnapshot(sharePricesQuery, (snapshot) => {
      console.log("[v0] Fetching share prices for shareId:", selectedStock.id)
      console.log("[v0] Share prices snapshot size:", snapshot.size)

      const prices: any[] = []
      snapshot.forEach((doc) => {
        console.log("[v0] Share price document data:", doc.data())
        prices.push({ id: doc.id, ...doc.data() })
      })

      const allChartData = prices.reverse().map((price, index) => ({
        time: (() => {
          const date = price.timestamp?.toDate?.() || new Date()
          try {
            return date.toISOString()
          } catch (error) {
            return new Date().toISOString()
          }
        })(),
        displayTime: (() => {
          const date = price.timestamp?.toDate?.() || new Date()
          try {
            return date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "numeric",
            })
          } catch (error) {
            return `Point ${index + 1}`
          }
        })(),
        price: price.price || 0,
        changeType: price.changeType || "neutral",
      }))

      console.log("[v0] Generated chart data:", allChartData)
      setChartData(allChartData)
    })

    return () => {
      unsubPeers()
      unsubNews()
      unsubSharePrices()
    }
  }, [selectedStock])

  // Filter stocks
  useEffect(() => {
    let filtered = stocks

    if (searchTerm) {
      filtered = filtered.filter(
        (stock) =>
          stock.sharesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (stock.sector && stock.sector.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedSector !== "All") {
      filtered = filtered.filter((stock) => stock.sector === selectedSector)
    }

    setFilteredStocks(filtered)
  }, [searchTerm, selectedSector, stocks])

  useEffect(() => {
    if (!chartData.length) {
      setFilteredChartData([])
      return
    }

    const now = new Date()
    let filtered = [...chartData]

    switch (timeFilter) {
      case "1M":
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        filtered = chartData.filter((item) => new Date(item.time) >= oneMonthAgo)
        break
      case "1Y":
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        filtered = chartData.filter((item) => new Date(item.time) >= oneYearAgo)
        break
      case "MAX":
        filtered = chartData
        break
      case "CURRENT":
        filtered = chartData.slice(-10) // Last 10 data points
        break
    }

    setFilteredChartData(filtered)
  }, [chartData, timeFilter])

  const uniqueSectors = Array.from(new Set(stocks.map((stock) => stock.sector).filter(Boolean)))

  const handleEnquiry = async () => {
    if (!selectedStock || !formData.name || !formData.mobile) {
      alert("Please fill in required fields (Name and Mobile)")
      return
    }

    try {
      await addDoc(collection(db, "enquiries"), {
        stockId: selectedStock.id,
        stockName: selectedStock.sharesName,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || "",
        quantity: formData.quantity,
        enquiryType: enquiryType,
        message: formData.message || "",
        timestamp: new Date(),
        status: "pending",
      })

      alert("Enquiry submitted successfully! We will contact you soon.")
      setShowEnquiryForm(false)
      setFormData({ name: "", mobile: "", email: "", quantity: 1, message: "" })
    } catch (error) {
      console.error("Error submitting enquiry:", error)
      alert("Error submitting enquiry. Please try again.")
    }
  }

  const handleWhatsAppEnquiry = () => {
    if (!selectedStock) return
    const message = `Hi, I'm interested in ${selectedStock.sharesName} (${enquiryType}). Current Price: ₹${selectedStock.currentPrice}. Please provide more details.`
    const whatsappUrl = `https://wa.me/YOUR_WHATSAPP_NUMBER?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleStockClick = (stock: any, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPricePopup({
      show: true,
      price: stock.currentPrice,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })

    // Hide popup after 2 seconds
    setTimeout(() => {
      setPricePopup((prev) => ({ ...prev, show: false }))
    }, 2000)

    setSelectedStock(stock)
  }

  const formatNumber = (num?: number) => {
    if (!num) return "N/A"
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
    return `₹${num.toFixed(2)}`
  }

  const formatCurrency = (num?: number) => {
    if (!num) return "N/A"
    return `₹${num.toLocaleString()}`
  }

  const prepareShareholdingData = () => {
    if (!stockShareholding) return []
    return [
      { name: "Promoters", value: stockShareholding.promoters, color: colors.primary.main },
      { name: "Institutions", value: stockShareholding.institutions, color: colors.accent.main },
      { name: "Retail", value: stockShareholding.retail, color: colors.success.main },
      ...(stockShareholding.others
        ? [{ name: "Others", value: stockShareholding.others, color: colors.warning.main }]
        : []),
    ]
  }

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
          />
          <p style={{ color: colors.text.secondary }}>Loading unlisted stocks...</p>
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
      <main className="py-8">
        {/* Header */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary.main} 50%, ${colors.accent.main} 100%)`,
                  }}
                >
                  Unlisted Stocks
                </span>
              </h1>
              <p style={{ color: colors.text.secondary }} className="text-xl">
                Discover pre-IPO opportunities and unlisted securities
              </p>
            </motion.div>

            {/* Search and Filter Controls */}
            <motion.div
              className="flex flex-col lg:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: colors.text.secondary }}
                />
                <Input
                  placeholder="Search stocks by name or sector..."
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

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger
                  className="w-full lg:w-48"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                    color: colors.text.primary,
                  }}
                >
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Sectors</SelectItem>
                  {uniqueSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </section>

        {/* Stocks Grid */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold mb-8"
              style={{ color: colors.text.primary }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Available Stocks ({filteredStocks.length})
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredStocks.map((stock) => (
                <motion.div key={stock.id} variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                    onClick={(e) => handleStockClick(stock, e)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: colors.neutral.light }}
                        >
                          {stock.logo ? (
                            <img
                              src={stock.logo || "/placeholder.svg"}
                              alt={stock.sharesName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                              style={{
                                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                              }}
                            >
                              {stock.sharesName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm" style={{ color: colors.text.primary }}>
                            {stock.sharesName}
                          </div>
                          {stock.sector && (
                            <Badge
                              size="sm"
                              style={{
                                backgroundColor: `${colors.primary.light}40`,
                                color: colors.primary.main,
                              }}
                            >
                              {stock.sector}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span style={{ color: colors.text.secondary }}>Current Price</span>
                          <span style={{ color: colors.text.primary }} className="font-bold">
                            ₹{stock.currentPrice}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: colors.text.secondary }}>Face Value</span>
                          <span style={{ color: colors.text.primary }} className="font-medium">
                            ₹{stock.faceValue || "N/A"}
                          </span>
                        </div>
                        {stock.peRatio && (
                          <div className="flex justify-between">
                            <span style={{ color: colors.text.secondary }}>P/E Ratio</span>
                            <span style={{ color: colors.text.primary }} className="font-medium">
                              {stock.peRatio.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span style={{ color: colors.text.secondary }}>Min Lot Size</span>
                          <span style={{ color: colors.text.primary }} className="font-medium">
                            {stock.minimumLotSize}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200/20">
                        <Button
                          size="sm"
                          className="w-full"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                            border: "none",
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {pricePopup.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: pricePopup.x,
              top: pricePopup.y,
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="px-3 py-2 rounded-lg shadow-lg border"
              style={{
                backgroundColor: colors.background.light,
                borderColor: colors.primary.light,
                color: colors.text.primary,
              }}
            >
              <div className="text-sm font-semibold">Current Price</div>
              <div className="text-lg font-bold">₹{pricePopup.price}</div>
            </div>
          </motion.div>
        )}

        {/* Stock Detail Modal */}
        <AnimatePresence>
          {selectedStock && (
            <Dialog open={true} onOpenChange={() => setSelectedStock(null)}>
              <DialogContent
                className="max-w-7xl max-h-[95vh] overflow-y-auto p-0"
                style={{ backgroundColor: colors.background.main }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  {/* Header */}
                  <div
                    className="p-6 border-b"
                    style={{ backgroundColor: colors.background.main, borderColor: `${colors.primary.light}40` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: colors.neutral.light }}
                          >
                            {selectedStock.logo ? (
                              <img
                                src={selectedStock.logo || "/placeholder.svg"}
                                alt={selectedStock.sharesName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white font-bold"
                                style={{
                                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                                }}
                              >
                                {selectedStock.sharesName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold truncate" style={{ color: colors.text.primary }}>
                            {selectedStock.sharesName}
                          </h2>
                        </div>

                        <div className="flex items-center gap-3 mt-1">
                          {selectedStock.sector && (
                            <Badge style={{ backgroundColor: `${colors.primary.light}40`, color: colors.primary.main }}>
                              {selectedStock.sector}
                            </Badge>
                          )}
                          <Badge style={{ backgroundColor: `${colors.accent.light}40`, color: colors.accent.main }}>
                            {selectedStock.depository}
                          </Badge>
                        </div>

                        {/* Full-width description (removed max-w constraints) */}
                        <p style={{ color: colors.text.secondary }} className="mt-2">
                          {selectedStock.description || "Unlisted stock opportunity with growth potential"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEnquiryType("buy")
                            setShowEnquiryForm(true)
                          }}
                          style={{ backgroundColor: colors.success.main }}
                        >
                          Buy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEnquiryType("sell")
                            setShowEnquiryForm(true)
                          }}
                          style={{ backgroundColor: colors.error.main }}
                        >
                          Sell
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEnquiryType("enquire")
                            setShowEnquiryForm(true)
                          }}
                          style={{ borderColor: colors.primary.main, color: colors.primary.main }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Enquire
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleWhatsAppEnquiry}
                          style={{ borderColor: colors.success.main, color: colors.success.main }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedStock(null)}
                          style={{ color: colors.text.secondary }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-8">
                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <Card
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: `${colors.primary.light}40`,
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            Current Price
                          </div>
                          <div className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            ₹{selectedStock.currentPrice}
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: `${colors.primary.light}40`,
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            Face Value
                          </div>
                          <div className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            ₹{selectedStock.faceValue || "N/A"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: `${colors.primary.light}40`,
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            52W High
                          </div>
                          <div className="text-xl font-bold" style={{ color: colors.success.main }}>
                            ₹{selectedStock.weekHigh52 || "N/A"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: `${colors.primary.light}40`,
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            52W Low
                          </div>
                          <div className="text-xl font-bold" style={{ color: colors.error.main }}>
                            ₹{selectedStock.weekLow52 || "N/A"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: `${colors.primary.light}40`,
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            P/E Ratio
                          </div>
                          <div className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            {selectedStock.peRatio?.toFixed(2) || "N/A"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: `${colors.primary.light}40`,
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            Market Cap
                          </div>
                          <div className="text-xl font-bold" style={{ color: colors.text.primary }}>
                            {formatNumber(selectedStock.marketCap)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Left Column - Charts and Analysis */}
                      <div className="lg:col-span-2 space-y-6">
                        {/* Peer Comparison */}
                        <Card
                          style={{
                            backgroundColor: `${colors.background.light}80`,
                            borderColor: `${colors.primary.light}40`,
                          }}
                        >
                          <CardHeader>
                            <CardTitle style={{ color: colors.text.primary }}>Peer Comparison</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {stockPeers.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b" style={{ borderColor: `${colors.primary.light}40` }}>
                                      <th className="text-left py-2" style={{ color: colors.text.secondary }}>
                                        Company
                                      </th>
                                      <th className="text-right py-2" style={{ color: colors.text.secondary }}>
                                        P/E Ratio
                                      </th>
                                      <th className="text-right py-2" style={{ color: colors.text.secondary }}>
                                        P/B Ratio
                                      </th>
                                      <th className="text-right py-2" style={{ color: colors.text.secondary }}>
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b" style={{ borderColor: `${colors.primary.light}20` }}>
                                      <td className="py-2 font-medium" style={{ color: colors.text.primary }}>
                                        {selectedStock.sharesName}
                                      </td>
                                      <td className="text-right py-2" style={{ color: colors.text.primary }}>
                                        {selectedStock.peRatio?.toFixed(2) || "N/A"}
                                      </td>
                                      <td className="text-right py-2" style={{ color: colors.text.primary }}>
                                        {selectedStock.pbRatio?.toFixed(2) || "N/A"}
                                      </td>
                                      <td className="text-right py-2">
                                        <Badge
                                          size="sm"
                                          style={{ backgroundColor: colors.accent.main, color: "white" }}
                                        >
                                          Unlisted
                                        </Badge>
                                      </td>
                                    </tr>
                                    {stockPeers.map((peer) => (
                                      <tr
                                        key={peer.id}
                                        className="border-b"
                                        style={{ borderColor: `${colors.primary.light}20` }}
                                      >
                                        <td className="py-2" style={{ color: colors.text.primary }}>
                                          {peer.companyName}
                                        </td>
                                        <td className="text-right py-2" style={{ color: colors.text.primary }}>
                                          {peer.peRatio?.toFixed(2) || "N/A"}
                                        </td>
                                        <td className="text-right py-2" style={{ color: colors.text.primary }}>
                                          {peer.pbRatio?.toFixed(2) || "N/A"}
                                        </td>
                                        <td className="text-right py-2">
                                          <Badge
                                            size="sm"
                                            style={{
                                              backgroundColor: colors.success.main,
                                              color: "white",
                                            }}
                                          >
                                            Listed
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8" style={{ color: colors.text.secondary }}>
                                Peer comparison data not available
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Added time filter buttons and enhanced chart */}
                        {chartData.length > 0 && (
                          <Card
                            style={{
                              backgroundColor: `${colors.background.light}80`,
                              borderColor: `${colors.primary.light}40`,
                            }}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle style={{ color: colors.text.primary }}>Price Activity Chart</CardTitle>
                                <div className="flex space-x-2">
                                  {(["CURRENT", "1M", "1Y", "MAX"] as TimeFilter[]).map((filter) => (
                                    <Button
                                      key={filter}
                                      size="sm"
                                      variant={timeFilter === filter ? "default" : "outline"}
                                      onClick={() => setTimeFilter(filter)}
                                      style={{
                                        backgroundColor: timeFilter === filter ? colors.primary.main : "transparent",
                                        borderColor: colors.primary.main,
                                        color: timeFilter === filter ? "white" : colors.primary.main,
                                      }}
                                    >
                                      {filter}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {filteredChartData.length === 0 ? (
                                <div
                                  className="h-[300px] flex items-center justify-center"
                                  style={{ color: colors.text.secondary }}
                                >
                                  <div className="text-center">
                                    <div className="text-lg font-semibold mb-2">No Data Available</div>
                                    <div className="text-sm">
                                      No price data available for the selected time period ({timeFilter})
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <ChartContainer
                                  config={{
                                    price: {
                                      label: "Price (₹)",
                                      color: colors.primary.main,
                                    },
                                  }}
                                  className="h-[300px]"
                                >
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                      data={filteredChartData}
                                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" stroke={`${colors.primary.light}40`} />
                                      <XAxis
                                        dataKey="displayTime"
                                        stroke={colors.text.secondary}
                                        fontSize={12}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                      />
                                      <YAxis
                                        stroke={colors.text.secondary}
                                        fontSize={12}
                                        tickFormatter={(value) => `₹${value}`}
                                      />
                                      <ChartTooltip
                                        content={<ChartTooltipContent />}
                                        labelFormatter={(label) => `Time: ${label}`}
                                        formatter={(value) => [`₹${value}`, "Price"]}
                                      />
                                      <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke={colors.primary.main}
                                        strokeWidth={2}
                                        dot={{ fill: colors.primary.main, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: colors.primary.main, strokeWidth: 2 }}
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </ChartContainer>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Right Column - Stock Details & News */}
                      <div className="space-y-6">
                        {/* Additional Stock Details */}
                        <Card
                          style={{
                            backgroundColor: `${colors.background.light}80`,
                            borderColor: `${colors.primary.light}40`,
                          }}
                        >
                          <CardHeader>
                            <CardTitle style={{ color: colors.text.primary }}>Stock Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span style={{ color: colors.text.secondary }}>Book Value</span>
                              <span style={{ color: colors.text.primary }}>
                                ₹{selectedStock.bookValue?.toFixed(2) || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: colors.text.secondary }}>P/B Ratio</span>
                              <span style={{ color: colors.text.primary }}>
                                {selectedStock.pbRatio?.toFixed(2) || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: colors.text.secondary }}>ROE</span>
                              <span style={{ color: colors.text.primary }}>
                                {selectedStock.roe?.toFixed(2)}% 
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: colors.text.secondary }}>Debt/Equity</span>
                              <span style={{ color: colors.text.primary }}>
                                {selectedStock.debtToEquity?.toFixed(2) || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: colors.text.secondary }}>Total Shares</span>
                              <span style={{ color: colors.text.primary }}>
                                {selectedStock.totalShares?.toLocaleString() || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span style={{ color: colors.text.secondary }}>Min Lot Size</span>
                              <span style={{ color: colors.text.primary }}>{selectedStock.minimumLotSize}</span>
                            </div>
                            <div className="border-t pt-3" style={{ borderColor: `${colors.primary.light}40` }}>
                              <div className="flex justify-between">
                                <span style={{ color: colors.text.secondary }}>CIN</span>
                                <span style={{ color: colors.text.primary }} className="text-xs">
                                  {selectedStock.cin || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span style={{ color: colors.text.secondary }}>ISIN</span>
                                <span style={{ color: colors.text.primary }} className="text-xs">
                                  {selectedStock.isinNumber || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span style={{ color: colors.text.secondary }}>RTA</span>
                                <span style={{ color: colors.text.primary }} className="text-xs">
                                  {selectedStock.rta || "N/A"}
                                </span>
                              </div>
                            </div>
                            {(selectedStock.website || selectedStock.blogUrl) && (
                              <div
                                className="border-t pt-3 space-y-2"
                                style={{ borderColor: `${colors.primary.light}40` }}
                              >
                                {selectedStock.website && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full bg-transparent"
                                    onClick={() => window.open(selectedStock.website, "_blank")}
                                    style={{ borderColor: colors.primary.main, color: colors.primary.main }}
                                  >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Visit Website
                                  </Button>
                                )}
                                {selectedStock.blogUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full bg-transparent"
                                    onClick={() => window.open(selectedStock.blogUrl, "_blank")}
                                    style={{ borderColor: colors.accent.main, color: colors.accent.main }}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Read More
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Recent Price Activity */}
                        {chartData.length > 0 && (
                          <Card
                            style={{
                              backgroundColor: `${colors.background.light}80`,
                              borderColor: `${colors.primary.light}40`,
                            }}
                          >
                            <CardHeader>
                              <CardTitle style={{ color: colors.text.primary }}>Recent Price Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {chartData
                                  .slice(-5)
                                  .reverse()
                                  .map((data, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        {data.changeType === "increase" ? (
                                          <TrendingUp className="w-4 h-4" style={{ color: colors.success.main }} />
                                        ) : (
                                          <TrendingDown className="w-4 h-4" style={{ color: colors.error.main }} />
                                        )}
                                        <span style={{ color: colors.text.secondary }} className="text-sm">
                                          {data.time}
                                        </span>
                                      </div>
                                      <span style={{ color: colors.text.primary }} className="font-medium">
                                        ₹{data.price}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* News & Updates */}
                        <Card
                          style={{
                            backgroundColor: `${colors.background.light}80`,
                            borderColor: `${colors.primary.light}40`,
                          }}
                        >
                          <CardHeader>
                            <CardTitle style={{ color: colors.text.primary }}>News & Updates</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {stockNews.length > 0 ? (
                              <div className="space-y-3">
                                {stockNews.slice(0, 5).map((news) => (
                                  <div
                                    key={news.id}
                                    className="border-b pb-3 last:border-b-0 last:pb-0"
                                    style={{ borderColor: `${colors.primary.light}20` }}
                                  >
                                    <div className="flex items-start justify-between mb-1">
                                      <Badge
                                        size="sm"
                                        style={{
                                          backgroundColor: `${colors.accent.light}40`,
                                          color: colors.accent.main,
                                        }}
                                      >
                                        {news.category}
                                      </Badge>
                                      <div className="text-xs" style={{ color: colors.text.secondary }}>
                                        {(() => {
                                          if (news.date?.toDate) {
                                            return news.date.toDate().toLocaleDateString()
                                          } else if (news.date instanceof Date) {
                                            return news.date.toLocaleDateString()
                                          } else if (typeof news.date === "string") {
                                            return news.date
                                          } else {
                                            return "No date"
                                          }
                                        })()}
                                      </div>
                                    </div>
                                    <h4 className="font-medium text-sm mb-1" style={{ color: colors.text.primary }}>
                                      {news.title}
                                    </h4>
                                    {news.content && (
                                      <p className="text-xs mb-2" style={{ color: colors.text.secondary }}>
                                        {news.content}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs" style={{ color: colors.text.secondary }}>
                                        Source: {news.source}
                                      </div>
                                      {news.url && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="p-0 h-auto"
                                          onClick={() => window.open(news.url, "_blank")}
                                          style={{ color: colors.primary.main }}
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8" style={{ color: colors.text.secondary }}>
                                No recent news available
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Sticky CTA */}
                  <div
                    className="sticky bottom-0 p-4 border-t backdrop-blur-sm"
                    style={{
                      backgroundColor: `${colors.background.main}E6`,
                      borderColor: `${colors.primary.light}40`,
                    }}
                  >
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        onClick={() => {
                          setEnquiryType("buy")
                          setShowEnquiryForm(true)
                        }}
                        style={{ backgroundColor: colors.success.main }}
                      >
                        Buy Now
                      </Button>
                      <Button
                        onClick={() => {
                          setEnquiryType("sell")
                          setShowEnquiryForm(true)
                        }}
                        style={{ backgroundColor: colors.error.main }}
                      >
                        Sell Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEnquiryType("enquire")
                          setShowEnquiryForm(true)
                        }}
                        style={{ borderColor: colors.primary.main, color: colors.primary.main }}
                      >
                        Get Quote
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleWhatsAppEnquiry}
                        style={{ borderColor: colors.success.main, color: colors.success.main }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Enquiry Form Modal */}
        <AnimatePresence>
          {showEnquiryForm && (
            <Dialog open={true} onOpenChange={() => setShowEnquiryForm(false)}>
              <DialogContent className="max-w-md" style={{ backgroundColor: colors.background.main }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>
                      {enquiryType.charAt(0).toUpperCase() + enquiryType.slice(1)} Enquiry
                    </CardTitle>
                    <p style={{ color: colors.text.secondary }}>
                      {selectedStock?.sharesName} - ₹{selectedStock?.currentPrice}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-1">
                        Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-1">
                        Mobile *
                      </label>
                      <Input
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="Your mobile number"
                        type="tel"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-1">
                        Email
                      </label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Your email address"
                        type="email"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-1">
                        Quantity
                      </label>
                      <Input
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                        placeholder="Number of shares"
                        type="number"
                        min="1"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-1">
                        Message
                      </label>
                      <Input
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Additional requirements or questions"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                  </CardContent>
                  <div className="flex items-center justify-between p-6 pt-0">
                    <Button
                      variant="outline"
                      onClick={() => setShowEnquiryForm(false)}
                      style={{ borderColor: colors.neutral.main, color: colors.text.secondary }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEnquiry}
                      disabled={!formData.name || !formData.mobile}
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                        opacity: !formData.name || !formData.mobile ? 0.5 : 1,
                      }}
                    >
                      Submit Enquiry
                    </Button>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
