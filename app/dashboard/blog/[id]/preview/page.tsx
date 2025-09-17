"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Clock, User, Eye } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  status: "draft" | "published" | "archived"
  active: boolean
  author: string
  authorEmail: string
  createdAt: any
  updatedAt: any
  publishedAt?: any
  tags: string[]
  readTime: number
}

export default function PreviewBlogPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loadingPost, setLoadingPost] = useState(true)

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  useEffect(() => {
    if (postId && user && role === "admin") {
      fetchPost()
    }
  }, [postId, user, role])

  const fetchPost = async () => {
    try {
      const postDoc = await getDoc(doc(db, "blogPosts", postId))
      if (postDoc.exists()) {
        setPost({ id: postDoc.id, ...postDoc.data() } as BlogPost)
      } else {
        router.push("/dashboard/blog")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
    } finally {
      setLoadingPost(false)
    }
  }

  if (loading || loadingPost) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!user || role !== "admin" || !post) {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have access to preview this post.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Preview Blog Post</h1>
            <p className="text-muted-foreground">How your post will appear to readers</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/blog/${postId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                  <Badge variant={post.active ? "default" : "secondary"}>{post.active ? "Active" : "Inactive"}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {post.status === "published" && post.publishedAt
                    ? `Published ${format(post.publishedAt.toDate(), "MMM dd, yyyy")}`
                    : `Created ${format(post.createdAt.toDate(), "MMM dd, yyyy")}`}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Post Preview */}
      <div className="max-w-4xl mx-auto">
        <article className="prose prose-lg max-w-none">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}

          {/* Title */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4 leading-tight">{post.title}</h1>

            {/* Meta Information */}
            <div className="flex items-center gap-6 text-muted-foreground mb-6 not-prose">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">By {post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {post.status === "published" && post.publishedAt
                    ? format(post.publishedAt.toDate(), "MMMM dd, yyyy")
                    : format(post.createdAt.toDate(), "MMMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{post.readTime} minute read</span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 not-prose">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div
            className="prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated: {format(post.updatedAt.toDate(), "MMMM dd, yyyy 'at' HH:mm")}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Preview Mode</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
