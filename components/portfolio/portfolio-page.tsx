"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, DollarSign, Target, Plus } from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"

const portfolioStats = [
  {
    title: "Total Value",
    value: "₹12,45,678",
    change: "+₹23,456",
    percentage: "+1.92%",
    isPositive: true,
    icon: DollarSign,
  },
  {
    title: "Today's P&L",
    value: "₹8,945",
    change: "+₹1,234",
    percentage: "+0.67%",
    isPositive: true,
    icon: TrendingUp,
  },
  { title: "Total P&L", value: "₹1,23,456", change: "+₹5,678", percentage: "+4.8%", isPositive: true, icon: BarChart3 },
  { title: "Invested", value: "₹11,22,222", change: "₹0", percentage: "0%", isPositive: true, icon: Target },
]

const holdings = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    qty: 50,
    avgPrice: "2,400.00",
    ltp: "2,456.75",
    pnl: "+₹2,837.50",
    pnlPercent: "+2.37%",
    isPositive: true,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    qty: 25,
    avgPrice: "3,800.00",
    ltp: "3,789.30",
    pnl: "-₹267.50",
    pnlPercent: "-0.28%",
    isPositive: false,
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    qty: 100,
    avgPrice: "1,650.00",
    ltp: "1,678.90",
    pnl: "+₹2,890.00",
    pnlPercent: "+1.75%",
    isPositive: true,
  },
  {
    symbol: "INFY",
    name: "Infosys",
    qty: 75,
    avgPrice: "1,420.00",
    ltp: "1,456.20",
    pnl: "+₹2,715.00",
    pnlPercent: "+2.55%",
    isPositive: true,
  },
]

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState("Holdings")
  const tabs = ["Holdings", "Orders", "Positions", "Analytics"]

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
                    Portfolio
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Track your investments and analyze performance
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </motion.div>
            </motion.div>

            {/* Portfolio Stats */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {portfolioStats.map((stat, i) => (
                <motion.div key={stat.title} variants={cardVariants}>
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.title}
                        </CardTitle>
                        <motion.div
                          className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <stat.icon className="w-4 h-4 text-white" />
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                        <div
                          className={`flex items-center space-x-1 text-sm ${stat.isPositive ? "text-green-600" : "text-red-600"}`}
                        >
                          <span>{stat.change}</span>
                          <span>({stat.percentage})</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Tabs */}
            <motion.div
              className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                    selectedTab === tab
                      ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Holdings Table */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-green-100/50 dark:border-gray-700/50 shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="p-6 border-b border-green-100/50 dark:border-gray-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Holdings</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Avg Price
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                        LTP
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                        P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, i) => (
                      <motion.tr
                        key={holding.symbol}
                        className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {holding.symbol.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">{holding.symbol}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          {holding.qty}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          ₹{holding.avgPrice}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                          ₹{holding.ltp}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-semibold ${holding.isPositive ? "text-green-600" : "text-red-600"}`}>
                            {holding.pnl}
                          </div>
                          <div className={`text-sm ${holding.isPositive ? "text-green-600" : "text-red-600"}`}>
                            {holding.pnlPercent}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  )
}
