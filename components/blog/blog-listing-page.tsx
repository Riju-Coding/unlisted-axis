"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Clock, User, Search, Filter, Calendar, TrendingUp, Star } from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"

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
}

const blogStats = [
  {
    title: "Total Posts",
    value: "0",
    change: "Published",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "This Month",
    value: "0",
    change: "New Posts",
    icon: Calendar,
    color: "from-blue-500 to-cyan-600",
  },
  {
    title: "Avg Read Time",
    value: "0 min",
    change: "Per Post",
    icon: Clock,
    color: "from-purple-500 to-indigo-600",
  },
  {
    title: "Categories",
    value: "0",
    change: "Topics",
    icon: TrendingUp,
    color: "from-orange-500 to-red-600",
  },
]

export default function BlogListingPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("All")
  const [stats, setStats] = useState(blogStats)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    // Set up real-time listener for published blog posts
    const postsQuery = query(
      collection(db, "blogPosts"),
      where("active", "==", true),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
    )

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData: BlogPost[] = []
      const tagsSet = new Set<string>()

      snapshot.forEach((doc) => {
        const post = { id: doc.id, ...doc.data() } as BlogPost
        postsData.push(post)
        post.tags.forEach((tag) => tagsSet.add(tag))
      })

      setPosts(postsData)
      setAllTags(Array.from(tagsSet))

      // Get featured posts (first 3 posts)
      setFeaturedPosts(postsData.slice(0, 3))
      setLoading(false)
    })

    return () => {
      unsubscribePosts()
    }
  }, [])

  // Update stats based on current data
  useEffect(() => {
    const totalPosts = posts.length
    const thisMonth = posts.filter((post) => {
      const postDate = new Date(post.publishedAt.toDate())
      const now = new Date()
      return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear()
    }).length
    const avgReadTime =
      posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + post.readTime, 0) / posts.length) : 0
    const categories = allTags.length

    setStats([
      { ...blogStats[0], value: totalPosts.toString() },
      { ...blogStats[1], value: thisMonth.toString() },
      { ...blogStats[2], value: `${avgReadTime} min` },
      { ...blogStats[3], value: categories.toString() },
    ])
  }, [posts, allTags])

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTag = selectedTag === "All" || post.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const formatDate = (timestamp: any) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog posts...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
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
                  Investment Blog
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay updated with latest market insights, investment strategies, and financial analysis from our expert
                team
              </p>
            </motion.div>

            {/* Blog Stats */}
          

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  Featured Posts
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {featuredPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-emerald-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={post.featuredImage || "/placeholder.svg?height=200&width=400"}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge
                                variant="secondary"
                                className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                              >
                                Featured
                              </Badge>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {post.readTime} min read
                              </div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <User className="w-3 h-3 mr-1" />
                                {post.author}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(post.publishedAt)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Search and Filters */}
            <motion.div
              className="flex flex-col md:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search posts by title, content, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-emerald-100/50 dark:border-gray-700/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === "All" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag("All")}
                  className={selectedTag === "All" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  All
                </Button>
                {allTags.slice(0, 6).map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className={selectedTag === tag ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* All Posts */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                All Posts ({filteredPosts.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Explore our complete collection of investment insights and market analysis
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredPosts.map((post, i) => (
                <motion.div key={post.id} variants={cardVariants}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-emerald-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.featuredImage || "/placeholder.svg?height=200&width=400"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {post.readTime} min read
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.publishedAt)}</div>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="w-3 h-3 mr-1" />
                          {post.author}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-2">No blog posts found</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
