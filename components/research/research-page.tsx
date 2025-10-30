"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, FileText, BarChart3, Target, Calendar, User } from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"

const researchReports = [
  {
    title: "Q3 Banking Sector Analysis",
    analyst: "Rajesh Kumar",
    date: "2024-01-15",
    rating: "BUY",
    target: "₹2,800",
    current: "₹2,456",
    summary: "Strong fundamentals with improving asset quality and robust credit growth outlook.",
    tags: ["Banking", "Q3 Results", "Sector Analysis"],
    isPositive: true,
  },
  {
    title: "IT Sector Outlook 2024",
    analyst: "Priya Sharma",
    date: "2024-01-12",
    rating: "HOLD",
    target: "₹1,650",
    current: "₹1,456",
    summary: "Mixed outlook with headwinds in traditional services but growth in digital transformation.",
    tags: ["IT", "Annual Outlook", "Digital"],
    isPositive: true,
  },
  {
    title: "Pharma Sector Deep Dive",
    analyst: "Dr. Amit Patel",
    date: "2024-01-10",
    rating: "SELL",
    target: "₹890",
    current: "₹987",
    summary: "Regulatory challenges and pricing pressure expected to impact margins in near term.",
    tags: ["Pharma", "Regulatory", "Margins"],
    isPositive: false,
  },
]

const marketInsights = [
  {
    title: "FII/DII Activity Analysis",
    description: "Foreign and domestic institutional investor flows and their market impact",
    icon: BarChart3,
    trend: "+₹2,345 Cr",
    isPositive: true,
  },
  {
    title: "Sector Rotation Trends",
    description: "Identifying sectors gaining and losing investor interest",
    icon: Target,
    trend: "IT → Banking",
    isPositive: true,
  },
  {
    title: "Technical Analysis",
    description: "Key support and resistance levels for major indices",
    icon: TrendingUp,
    trend: "Bullish",
    isPositive: true,
  },
]

export default function ResearchPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const categories = ["All", "Banking", "IT", "Pharma", "Auto", "FMCG"]

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
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                  Research & Analysis
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Expert insights, comprehensive reports, and data-driven analysis to guide your investment decisions
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : "border-green-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Market Insights */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              Market Insights
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-12"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {marketInsights.map((insight, i) => (
                <motion.div key={insight.title} variants={cardVariants}>
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <insight.icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <Badge
                          variant={insight.isPositive ? "default" : "destructive"}
                          className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {insight.trend}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {insight.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        {insight.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Research Reports */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Latest Research Reports
            </motion.h2>

            <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
              {researchReports.map((report, i) => (
                <motion.div key={report.title} variants={cardVariants}>
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-2">
                                {report.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{report.analyst}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{report.date}</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                report.rating === "BUY"
                                  ? "default"
                                  : report.rating === "HOLD"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={`${
                                report.rating === "BUY"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : report.rating === "HOLD"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {report.rating}
                            </Badge>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mb-4">{report.summary}</p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {report.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="mb-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Target Price</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">{report.target}</div>
                          </div>
                          <div className="mb-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                              {report.current}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Read Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
