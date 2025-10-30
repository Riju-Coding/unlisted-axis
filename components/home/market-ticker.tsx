"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import type { MarketData } from "@/types/market"

const marketData: MarketData[] = [
  { symbol: "NIFTY 50", price: "₹19,674.25", change: "+234.50", percentage: "+1.2%", isPositive: true },
  { symbol: "SENSEX", price: "₹66,527.67", change: "+445.23", percentage: "+0.67%", isPositive: true },
  { symbol: "BANKNIFTY", price: "₹44,234.80", change: "-123.45", percentage: "-0.28%", isPositive: false },
  { symbol: "NIFTY IT", price: "₹31,456.90", change: "+89.12", percentage: "+0.29%", isPositive: true },
  { symbol: "NIFTY BANK", price: "₹48,123.45", change: "-67.89", percentage: "-0.14%", isPositive: false },
]

/**
 * Animated market ticker showing live market data
 * Implements continuous scrolling with pause on hover
 */
export default function MarketTicker() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.section
      ref={ref}
      className="py-6 bg-gradient-to-r from-white/80 via-green-50/30 to-white/80 dark:from-gray-800/80 dark:via-green-900/10 dark:to-gray-800/80 border-y border-green-100/50 dark:border-gray-700/50 backdrop-blur-sm shadow-inner"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      role="region"
      aria-label="Live market data"
    >
      <div className="container mx-auto overflow-hidden">
        <motion.div
          className="flex items-center space-x-12 whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {[...marketData, ...marketData, ...marketData].map((item, index) => (
            <motion.div
              key={`${item.symbol}-${index}`}
              className="flex items-center space-x-3 min-w-max px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-green-100/30 dark:border-gray-700/30 shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  className={`w-2 h-2 rounded-full ${item.isPositive ? "bg-green-500" : "bg-red-500"}`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.2,
                  }}
                />
                <span className="font-bold text-gray-900 dark:text-white text-sm">{item.symbol}</span>
              </div>
              <span
                className={`font-bold text-lg ${item.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {item.price}
              </span>
              <motion.span
                className={`text-sm font-semibold px-2 py-1 rounded-md ${
                  item.isPositive
                    ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                    : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
                }`}
                animate={
                  item.isPositive
                    ? {
                        backgroundColor: ["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0.1)"],
                      }
                    : {
                        backgroundColor: ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.1)"],
                      }
                }
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                {item.change} ({item.percentage})
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
