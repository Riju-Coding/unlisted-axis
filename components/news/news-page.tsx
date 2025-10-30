"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Building, Zap } from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"

const breakingNews = [
  {
    title: "RBI Announces New Monetary Policy Changes",
    summary:
      "Reserve Bank of India maintains repo rate at 6.5% while signaling potential future adjustments based on inflation trends.",
    category: "Policy",
    time: "2 hours ago",
    isBreaking: true,
    impact: "High",
  },
  {
    title: "Reliance Industries Q3 Results Beat Estimates",
    summary: "Strong performance across petrochemicals and retail segments drives 15% YoY growth in net profit.",
    category: "Earnings",
    time: "4 hours ago",
    isBreaking: false,
    impact: "Medium",
  },
]

const newsArticles = [
  {
    title: "Indian IT Sector Shows Resilience Amid Global Headwinds",
    summary:
      "Major IT companies report stable growth despite challenges in traditional markets, with focus shifting to AI and cloud services.",
    category: "Technology",
    time: "6 hours ago",
    author: "Business Desk",
    readTime: "3 min read",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Banking Sector Credit Growth Accelerates to 16.5%",
    summary:
      "Strong demand for retail and corporate loans drives credit expansion, with asset quality showing improvement across major banks.",
    category: "Banking",
    time: "8 hours ago",
    author: "Financial Reporter",
    readTime: "4 min read",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Green Energy Investments Surge in India",
    summary:
      "Renewable energy sector attracts record investments as government pushes for carbon neutrality goals by 2070.",
    category: "Energy",
    time: "10 hours ago",
    author: "Energy Correspondent",
    readTime: "5 min read",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    title: "Pharmaceutical Exports Reach All-Time High",
    summary:
      "Indian pharma companies benefit from global supply chain diversification, with exports crossing $25 billion mark.",
    category: "Healthcare",
    time: "12 hours ago",
    author: "Healthcare Reporter",
    readTime: "3 min read",
    image: "/placeholder.svg?height=200&width=300",
  },
]

const categories = ["All", "Markets", "Banking", "Technology", "Energy", "Healthcare", "Policy"]

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

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
                  Market News
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay informed with the latest market developments, breaking news, and expert analysis
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

        {/* Breaking News */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="flex items-center space-x-2 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                <Zap className="w-6 h-6 text-red-500" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Breaking News</h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-6 mb-12"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {breakingNews.map((news, i) => (
                <motion.div key={news.title} variants={cardVariants}>
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-700/50 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="destructive" className="bg-red-500 text-white">
                          {news.isBreaking ? "BREAKING" : "UPDATE"}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{news.time}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {news.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">{news.summary}</CardDescription>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline">{news.category}</Badge>
                        <Badge variant={news.impact === "High" ? "destructive" : "secondary"}>
                          {news.impact} Impact
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Latest News */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Latest News
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {newsArticles.map((article, i) => (
                <motion.div key={article.title} variants={cardVariants}>
                  <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-green-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-lg flex items-center justify-center">
                      <Building className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{article.category}</Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{article.time}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-3">
                        {article.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>By {article.author}</span>
                        <span>{article.readTime}</span>
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
