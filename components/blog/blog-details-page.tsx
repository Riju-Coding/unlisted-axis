"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Tag, ExternalLink } from "lucide-react"
import { pageVariants } from "@/lib/animations"

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

interface BlogDetailsPageProps {
  slug: string
}

export default function BlogDetailsPage({ slug }: BlogDetailsPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("BlogDetailsPage: Component mounted, slug:", slug)
    setLoading(true) // Ensure loading is true at the start of the effect

    let unsubscribeRelated: (() => void) | null = null // To store the unsubscribe function for related posts

    const postQuery = query(
      collection(db, "blogPosts"),
      where("slug", "==", slug),
      where("active", "==", true),
      where("status", "==", "published"),
    )

    console.log("BlogDetailsPage: Setting up main post listener for slug:", slug)
    const unsubscribePost = onSnapshot(postQuery, (snapshot) => {
      if (!snapshot.empty) {
        const postData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost
        setPost(postData)
        console.log("BlogDetailsPage: Main post found:", postData.id, postData.title)

        if (postData.tags.length > 0) {
          console.log("BlogDetailsPage: Tags found, fetching related posts.")
          const relatedQuery = query(
            collection(db, "blogPosts"),
            where("active", "==", true),
            where("status", "==", "published"),
            limit(4), // Fetch one more than needed to ensure we can filter out current post
          )

          // Unsubscribe previous related listener if it exists (important for re-renders)
          if (unsubscribeRelated) {
            unsubscribeRelated()
          }

          unsubscribeRelated = onSnapshot(relatedQuery, (relatedSnapshot) => {
            const relatedData: BlogPost[] = []
            relatedSnapshot.forEach((doc) => {
              const relatedPost = { id: doc.id, ...doc.data() } as BlogPost
              // Ensure it's not the current post and has at least one common tag
              if (relatedPost.id !== postData.id && relatedPost.tags.some((tag) => postData.tags.includes(tag))) {
                relatedData.push(relatedPost)
              }
            })
            setRelatedPosts(relatedData.slice(0, 3)) // Take only up to 3 related posts
            setLoading(false) // All data (main post + related) is now loaded
            console.log("BlogDetailsPage: Related posts fetched, loading complete.")
          })
        } else {
          // No tags, so no related posts to fetch. Main post is loaded.
          setRelatedPosts([]) // Ensure related posts is an empty array
          setLoading(false)
          console.log("BlogDetailsPage: No tags, main post loaded, loading complete.")
        }
      } else {
        // Post not found
        console.log("BlogDetailsPage: Post not found for slug:", slug)
        setPost(null) // Explicitly set post to null
        setRelatedPosts([]) // Ensure related posts is empty
        setLoading(false) // Loading is complete, even if post not found
        router.push("/blog") // Redirect after state update
        console.log("BlogDetailsPage: Post not found, loading complete and redirecting.")
      }
    })

    // Cleanup function for both listeners
    return () => {
      console.log("BlogDetailsPage: Cleaning up listeners.")
      unsubscribePost()
      if (unsubscribeRelated) {
        unsubscribeRelated()
      }
    }
  }, [slug, router]) // Dependencies

  const formatDate = (timestamp: any) => {
    return new Date(timestamp.toDate()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
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
        {/* Back Button */}
        <section className="py-4 px-4">
          <div className="container mx-auto">
            <Link href="/blog">
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </section>

        {/* Article Header */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Featured Image */}
              <div className="aspect-video overflow-hidden rounded-xl mb-8 shadow-2xl">
                <img
                  src={post.featuredImage || "/placeholder.svg?height=400&width=800"}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{post.readTime} min read</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{post.excerpt}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mr-2">
                  <Tag className="w-3 h-3 mr-1" />
                  Tags:
                </div>
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator className="mb-8" />
            </motion.div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="prose prose-lg dark:prose-invert max-w-none [&_*]:!text-black [&_*]:dark:!text-black"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                className="text-black dark:text-black leading-relaxed [&_*]:!text-black [&_*]:dark:!text-black"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </motion.div>
          </div>
        </section>

        {/* Author Info */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-emerald-100/50 dark:border-gray-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.author}</h3>
                      <p className="text-gray-600 dark:text-gray-400">Investment Analyst & Content Writer</p>
                      <div className="flex items-center mt-2">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        <a
                          href={`mailto:${post.authorEmail}`}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
                        >
                          {post.authorEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-8 px-4">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <BookOpen className="w-6 h-6 text-emerald-600 mr-2" />
                  Related Posts
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-emerald-100/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={relatedPost.featuredImage || "/placeholder.svg?height=200&width=400"}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {relatedPost.readTime} min read
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(relatedPost.publishedAt)}
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{relatedPost.excerpt}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </motion.div>
  )
}