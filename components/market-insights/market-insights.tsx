"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  User,
  TrendingUp,
  Star,
  Award,
  Users,
  Eye,
  ArrowRight,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"

interface BlogPost {
  id: string
  active: boolean
  author: string
  authorEmail: string
  content: string
  createdAt: any
  excerpt: string
  featuredImage: string
  publishedAt: any
  readTime: number
  slug: string
  status: string
  tags: string[]
  title: string
  updatedAt: any
  views?: number
}

const trustIndicators = [
  {
    title: "Expert Analysis",
    value: "500+",
    description: "Market Reports",
    icon: BarChart3,
    color: `linear-gradient(135deg, ${colors.success.main}, ${colors.success.dark})`,
  },
  {
    title: "Trusted by",
    value: "10K+",
    description: "Investors",
    icon: Users,
    color: `linear-gradient(135deg, ${colors.secondary.main}, ${colors.secondary.dark})`,
  },
  {
    title: "Success Rate",
    value: "85%",
    description: "Accurate Predictions",
    icon: TrendingUp,
    color: `linear-gradient(135deg, ${colors.accent.main}, ${colors.accent.dark})`,
  },
  {
    title: "Experience",
    value: "15+",
    description: "Years in Market",
    icon: Award,
    color: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.dark})`,
  },
]

const expertiseAreas = [
  "IPO Analysis & Reviews",
  "Unlisted Share Insights",
  "Market Trend Predictions",
  "Investment Strategies",
  "Risk Assessment",
  "Portfolio Optimization",
]

export default function MarketInsightsPage() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)

  useEffect(() => {
    // Get featured posts (limit to 4 most recent)
    const featuredQuery = query(
      collection(db, "blogPosts"),
      where("active", "==", true),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(4),
    )

    const unsubscribeFeatured = onSnapshot(featuredQuery, (snapshot) => {
      const postsData: BlogPost[] = []
      snapshot.forEach((doc) => {
        const post = { id: doc.id, ...doc.data() } as BlogPost
        postsData.push(post)
      })
      setFeaturedPosts(postsData)
      setLoading(false)
    })

    // Get total posts count for stats
    const allPostsQuery = query(
      collection(db, "blogPosts"),
      where("active", "==", true),
      where("status", "==", "published"),
    )

    const unsubscribeAll = onSnapshot(allPostsQuery, (snapshot) => {
      setTotalPosts(snapshot.size)
    })

    return () => {
      unsubscribeFeatured()
      unsubscribeAll()
    }
  }, [])

  const formatDate = (timestamp: any) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.background.light}, ${colors.background.main}, ${colors.background.dark})`,
        }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${colors.primary.main} transparent transparent transparent` }}
          ></div>
          <p style={{ color: colors.text.secondary }}>Loading market insights...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.background.light}, ${colors.background.main}, ${colors.background.dark})`,
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* <Header /> */}
      <main className="py-8">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{
                  backgroundColor: colors.primary.light,
                  color: colors.primary.dark,
                }}
              >
                <Star className="w-4 h-4 mr-2" />
                Latest Market Insights
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
                  }}
                >
                  Expert Market Analysis
                </span>
              </h1>
              <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: colors.text.secondary }}>
                Stay ahead of the market with our expert insights on IPOs, unlisted shares, and investment
                opportunities. Trusted by thousands of investors for accurate analysis and profitable recommendations.
              </p>

              {/* Trust Indicators */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {trustIndicators.map((indicator, i) => (
                  <motion.div key={indicator.title} variants={cardVariants}>
                    <div className="text-center">
                      <motion.div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: indicator.color }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <indicator.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        {indicator.value}
                      </div>
                      <div className="text-sm" style={{ color: colors.text.secondary }}>
                        {indicator.description}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Featured Insights */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Investment Blogs
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
                Our expert team analyzes market trends and opportunities to bring you actionable insights
              </p>
            </motion.div>

            {featuredPosts.length > 0 ? (
              <motion.div
                className="grid md:grid-cols-2 gap-8 mb-12"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* Main Featured Post */}
                <motion.div variants={cardVariants} className="md:row-span-2">
                  <Link href={`/blog/${featuredPosts[0].slug}`}>
                    <Card
                      className="backdrop-blur-sm hover:shadow-2xl transition-all duration-500 h-full group cursor-pointer overflow-hidden"
                      style={{
                        backgroundColor: `${colors.background.main}90`,
                        borderColor: `${colors.primary.light}50`,
                      }}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={
                            featuredPosts[0].featuredImage ||
                            "/placeholder.svg?height=400&width=600&query=market analysis chart" ||
                            "/placeholder.svg"
                          }
                          alt={featuredPosts[0].title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-8">
                        <div className="flex items-center space-x-3 mb-4">
                          <Badge
                            className="border-0 text-white"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                            }}
                          >
                            Featured Analysis
                          </Badge>
                          <div className="flex items-center text-sm" style={{ color: colors.text.secondary }}>
                            <Clock className="w-4 h-4 mr-1" />
                            {featuredPosts[0].readTime} min read
                          </div>
                          {featuredPosts[0].views && (
                            <div className="flex items-center text-sm" style={{ color: colors.text.secondary }}>
                              <Eye className="w-4 h-4 mr-1" />
                              {featuredPosts[0].views.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <h3
                          className="font-bold text-2xl mb-4 group-hover:transition-colors leading-tight"
                          style={{
                            color: colors.text.primary,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary.main)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.primary)}
                        >
                          {featuredPosts[0].title}
                        </h3>
                        <p className="mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
                          {featuredPosts[0].excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                              style={{
                                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                              }}
                            >
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: colors.text.primary }}>
                                {featuredPosts[0].author}
                              </div>
                              <div className="text-sm" style={{ color: colors.text.secondary }}>
                                {formatDate(featuredPosts[0].publishedAt)}
                              </div>
                            </div>
                          </div>
                          <ArrowRight
                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            style={{ color: colors.primary.main }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>

                {/* Secondary Featured Posts */}
                <div className="space-y-6">
                  {featuredPosts.slice(1, 4).map((post, i) => (
                    <motion.div key={post.id} variants={cardVariants}>
                      <Link href={`/blog/${post.slug}`}>
                        <Card
                          className="backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
                          style={{
                            backgroundColor: `${colors.background.main}80`,
                            borderColor: `${colors.primary.light}50`,
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="flex gap-4">
                              <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                                <img
                                  src={
                                    post.featuredImage || "/placeholder.svg?height=96&width=96&query=financial chart"
                                  }
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex items-center text-xs" style={{ color: colors.text.secondary }}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {post.readTime} min
                                  </div>
                                  <div className="text-xs" style={{ color: colors.text.secondary }}>
                                    {formatDate(post.publishedAt)}
                                  </div>
                                </div>
                                <h4
                                  className="font-semibold mb-2 group-hover:transition-colors line-clamp-2"
                                  style={{ color: colors.text.primary }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary.main)}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.primary)}
                                >
                                  {post.title}
                                </h4>
                                <p className="text-sm line-clamp-2 mb-2" style={{ color: colors.text.secondary }}>
                                  {post.excerpt}
                                </p>
                                <div className="flex items-center text-xs" style={{ color: colors.text.secondary }}>
                                  <User className="w-3 h-3 mr-1" />
                                  {post.author}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: colors.neutral.light }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                  No insights available
                </h3>
                <p style={{ color: colors.text.secondary }}>Check back soon for the latest market analysis</p>
              </div>
            )}

            {/* CTA Section */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/blog">
                <Button
                  size="lg"
                  className="text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.dark}, ${colors.secondary.dark})`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`
                  }}
                >
                  View All Insights
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-sm mt-3" style={{ color: colors.text.secondary }}>
                Explore {totalPosts}+ expert market analyses and investment insights
              </p>
            </motion.div>
          </div>
        </section>

        {/* Expertise Areas */}
        <section className="py-16 px-4" style={{ backgroundColor: `${colors.background.main}50` }}>
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Our Areas of Expertise
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
                Comprehensive market coverage across all major investment sectors
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {expertiseAreas.map((area, i) => (
                <motion.div key={area} variants={cardVariants}>
                  <div
                    className="flex items-center p-4 backdrop-blur-sm rounded-lg"
                    style={{
                      backgroundColor: `${colors.background.main}80`,
                      borderColor: `${colors.primary.light}50`,
                      border: "1px solid",
                    }}
                  >
                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: colors.success.main }} />
                    <span className="font-medium" style={{ color: colors.text.primary }}>
                      {area}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </motion.div>
  )
}
