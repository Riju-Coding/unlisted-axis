"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import StockCard3D from "@/components/watchlist/stock-card-3d"

const watchlistStocks = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: "2,456.75",
    change: "+45.20",
    percentage: "+1.87%",
    isPositive: true,
    alertPrice: "2,400.00",
    volume: "2.5M",
    dayHigh: "2,478.90",
    dayLow: "2,423.15",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: "3,789.30",
    change: "-23.45",
    percentage: "-0.61%",
    isPositive: false,
    alertPrice: "3,800.00",
    volume: "1.8M",
    dayHigh: "3,812.45",
    dayLow: "3,776.20",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: "1,678.90",
    change: "+12.35",
    percentage: "+0.74%",
    isPositive: true,
    alertPrice: "1,650.00",
    volume: "3.2M",
    dayHigh: "1,689.75",
    dayLow: "1,665.30",
  },
  {
    symbol: "INFY",
    name: "Infosys",
    price: "1,456.20",
    change: "+8.90",
    percentage: "+0.62%",
    isPositive: true,
    alertPrice: "1,450.00",
    volume: "2.1M",
    dayHigh: "1,467.85",
    dayLow: "1,445.60",
  },
]

export default function WatchlistPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedView, setSelectedView] = useState("Grid")

  const views = ["Grid", "List", "Compact"]

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header />

      <main className="py-8">
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
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                    Watchlist
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Track your favorite stocks and get real-time alerts
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stock
                </Button>
              </motion.div>
            </motion.div>

            {/* Search and View Options */}
            <motion.div
              className="flex flex-col md:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search your watchlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-200 dark:border-gray-700 focus:border-green-500"
                />
              </div>
              <div className="flex gap-2">
                {views.map((view) => (
                  <Button
                    key={view}
                    variant={selectedView === view ? "default" : "outline"}
                    onClick={() => setSelectedView(view)}
                    className={`${
                      selectedView === view
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        : "border-green-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {view}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Watchlist Stocks */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Stocks</h2>
              <Badge variant="outline" className="text-sm">
                {watchlistStocks.length} stocks
              </Badge>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {watchlistStocks.map((stock, i) => (
                <motion.div key={stock.symbol} variants={cardVariants}>
                  <StockCard3D stock={stock} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  )
}
