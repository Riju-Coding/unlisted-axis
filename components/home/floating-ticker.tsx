"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"

const tickerData = [
  { symbol: "NIFTY", price: "19,674.25", change: "+1.2%", isPositive: true },
  { symbol: "SENSEX", price: "66,527.67", change: "+0.67%", isPositive: true },
  { symbol: "BANKNIFTY", price: "44,234.80", change: "-0.28%", isPositive: false },
  { symbol: "INFY", price: "1,456.20", change: "+0.62%", isPositive: true },
  { symbol: "RELIANCE", price: "2,456.75", change: "+1.87%", isPositive: true },
  { symbol: "TCS", price: "3,789.30", change: "-0.61%", isPositive: false },
  { symbol: "HDFCBANK", price: "1,678.90", change: "+0.74%", isPositive: true },
  { symbol: "ICICIBANK", price: "987.65", change: "-0.55%", isPositive: false },
  { symbol: "HINDUNILVR", price: "2,234.80", change: "+0.85%", isPositive: true },
]

export default function FloatingTicker() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    } else {
      controls.start("hidden")
    }
  }, [controls, isInView])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        },
        hidden: {
          opacity: 0,
          y: 20,
          transition: { duration: 0.5 },
        },
      }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-5xl w-full px-4"
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-green-100/50 dark:border-green-900/30 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center h-12">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 h-full flex items-center font-bold">
            LIVE
          </div>

          <div className="overflow-hidden flex-1 px-2">
            <motion.div
              className="flex space-x-8 whitespace-nowrap"
              animate={{
                x: [0, -2000],
              }}
              transition={{
                x: {
                  duration: 30,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
              }}
            >
              {[...tickerData, ...tickerData].map((item, index) => (
                <div key={`${item.symbol}-${index}`} className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.symbol}</span>
                  <span className="text-gray-700 dark:text-gray-300">{item.price}</span>
                  <div className={`flex items-center ${item.isPositive ? "text-green-600" : "text-red-600"}`}>
                    {item.isPositive ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    <span>{item.change}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
