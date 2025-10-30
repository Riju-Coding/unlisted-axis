import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ParticleBackground from "@/components/ui/particle-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Unlisted Axis - Trade Smarter, Invest Better | India's #1 Trading Platform",
  description:
    "Experience the future of stock trading with real-time NSE/BSE data, advanced analytics, and zero-commission trades in Indian markets.",
  keywords: "stock trading, NSE, BSE, Indian stock market, trading platform, investment",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={null}>
          {/* <ParticleBackground /> */}
        </Suspense>
        {children}
      </body>
    </html>
  )
}
