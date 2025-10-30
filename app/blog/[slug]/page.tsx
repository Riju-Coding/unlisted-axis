import { Suspense } from "react"
import type { Metadata } from "next"
import BlogDetailsPage from "@/components/blog/blog-details-page"
import { ThemeProvider } from "@/components/theme-provider"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In a real app, you'd fetch the blog post data here
  return {
    title: "Blog Post | StockFlow",
    description: "Read our latest insights on stock market and investments",
  }
}

export default function Page({ params }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50" />}>
        <BlogDetailsPage slug={params.slug} />
      </Suspense>
    </ThemeProvider>
  )
}
