"use client"

import { motion } from "framer-motion"
import Header from "./header"
import Hero from "./hero"
import MarketTicker from "./market-ticker"
import Features from "./features"
import Stats from "./stats"
import Testimonials from "./testimonials"
import CTA from "./cta"
import Footer from "./footer"
import FloatingTicker from "./floating-ticker"
import { pageVariants } from "@/lib/animations"
import IPOListingsTable from "../ipos/ipo-listings-table"
import HowItWorksPage from "../hiw/how-it-works"
import MarketInsightsPage from "../market-insights/market-insights"
import WhatsAppUpdatesPage from "../whatsapp-updates/whatsapp-updates"

/**
 * Main home page component that orchestrates all landing page sections
 * Implements scroll-based animations and responsive design
 */
export default function HomePage() {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary floating orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/30 to-emerald-600/30 dark:from-green-400/20 dark:to-emerald-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/30 to-green-600/30 dark:from-emerald-400/20 dark:to-green-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.7, 0.3, 0.7],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
        />

        {/* Additional floating elements */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 dark:from-blue-400/10 dark:to-cyan-600/10 rounded-full blur-2xl"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 dark:from-purple-400/10 dark:to-pink-600/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 0.8, 1.2],
            opacity: [0.5, 0.2, 0.5],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-20 w-4 h-4 border border-green-500 rotate-45 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-6 h-6 border border-emerald-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-green-500 rotate-45 animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 border border-emerald-500 animate-spin"></div>
        </div>
      </div>

      <Header />
      <main>
        <Hero />
       
        
        <Features />
       
        {/* <IPOListingsTable/> */}
        <HowItWorksPage/>
        <MarketInsightsPage/>
        <WhatsAppUpdatesPage/>
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      {/* <FloatingTicker /> */}
    </motion.div>
  )
}
