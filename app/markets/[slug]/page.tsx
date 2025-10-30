import { Suspense } from "react"
import type { Metadata } from "next"
import ShareDetailPage from "@/components/markets/share-detail-page"
import { ThemeProvider } from "@/components/theme-provider"

type Props = {
  params: { slug: string }
  searchParams: { id?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shareName = params.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return {
    title: `${shareName} - Share Details | StockFlow`,
    description: `Detailed information about ${shareName} including price, financial metrics, and company data.`,
    keywords: `${shareName}, share price, financial metrics, stock analysis, NSE, BSE`,
  }
}

export default function Page({ params, searchParams }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading share details...</p>
            </div>
          </div>
        }
      >
        <ShareDetailPage slug={params.slug} id={searchParams.id} />
      </Suspense>
    </ThemeProvider>
  )
}
