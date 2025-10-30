import { Suspense } from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import IPODetailPage from "@/components/ipos/ipo-detail-page"

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const slug = params.slug
  const id = searchParams.id as string

  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} IPO - Details, Price, Dates & Analysis | StockFlow`,
    description: `Complete details about ${slug.replace(/-/g, " ")} IPO including price range, subscription status, GMP, important dates, and comprehensive analysis.`,
    keywords: `${slug.replace(/-/g, " ")} IPO, IPO details, IPO price, IPO subscription, IPO analysis, IPO dates`,
  }
}

export default function Page({ params, searchParams }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading IPO details...</p>
            </div>
          </div>
        }
      >
        <IPODetailPage slug={params.slug} id={searchParams.id as string} />
      </Suspense>
    </ThemeProvider>
  )
}
