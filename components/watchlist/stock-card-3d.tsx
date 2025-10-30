"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Bell, Star } from "lucide-react"

export default function StockCard3D({ stock }) {
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateXValue = (y - centerY) / 20
    const rotateYValue = (centerX - x) / 20

    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const resetRotation = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetRotation}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease",
      }}
    >
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-green-100/50 dark:border-green-900/30 shadow-xl h-full">
        <CardContent className="p-6 relative overflow-hidden">
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              stock.isPositive
                ? "from-green-500/5 via-emerald-500/5 to-green-500/10"
                : "from-red-500/5 via-red-500/5 to-red-500/10"
            } opacity-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : ""}`}
          />

          {/* Shine effect */}
          <div
            className="absolute inset-0 opacity-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.2 : 0,
              transform: `translateX(${rotateY * -10}px) translateY(${rotateX * -10}px)`,
              transition: "transform 0.1s ease, opacity 0.3s ease",
            }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-12 h-12 bg-gradient-to-br ${
                  stock.isPositive ? "from-green-500 to-emerald-600" : "from-red-500 to-red-600"
                } rounded-lg flex items-center justify-center text-white font-bold`}
                style={{
                  transform: `translateZ(${isHovered ? 20 : 0}px)`,
                  transition: "transform 0.2s ease",
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {stock.symbol.charAt(0)}
              </motion.div>
              <div
                style={{
                  transform: `translateZ(${isHovered ? 15 : 0}px)`,
                  transition: "transform 0.2s ease",
                }}
              >
                <h3 className="font-bold text-gray-900 dark:text-white">{stock.symbol}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
              </div>
            </div>

            <div
              className="flex space-x-1"
              style={{
                transform: `translateZ(${isHovered ? 10 : 0}px)`,
                transition: "transform 0.2s ease",
              }}
            >
              <Button size="sm" variant="ghost" className="hover:bg-green-50 dark:hover:bg-green-900/20 p-1">
                <Bell className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-green-50 dark:hover:bg-green-900/20 p-1">
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            className="flex items-center justify-between mb-4"
            style={{
              transform: `translateZ(${isHovered ? 25 : 0}px)`,
              transition: "transform 0.2s ease",
            }}
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{stock.price}</div>
            <div className={`flex items-center space-x-1 ${stock.isPositive ? "text-green-600" : "text-red-600"}`}>
              {stock.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold">{stock.change}</span>
              <span className="text-sm">({stock.percentage})</span>
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-4 text-sm mb-4"
            style={{
              transform: `translateZ(${isHovered ? 15 : 0}px)`,
              transition: "transform 0.2s ease",
            }}
          >
            <div>
              <div className="text-gray-600 dark:text-gray-400">Day High</div>
              <div className="font-semibold text-gray-900 dark:text-white">₹{stock.dayHigh}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Day Low</div>
              <div className="font-semibold text-gray-900 dark:text-white">₹{stock.dayLow}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Volume</div>
              <div className="font-semibold text-gray-900 dark:text-white">{stock.volume}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Alert Price</div>
              <div className="font-semibold text-green-600 dark:text-green-400">₹{stock.alertPrice}</div>
            </div>
          </div>

          <motion.div
            className="w-full h-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
            style={{
              transform: `translateZ(${isHovered ? 5 : 0}px)`,
              transition: "transform 0.2s ease",
            }}
          >
            <motion.div
              className={`h-full ${stock.isPositive ? "bg-green-500" : "bg-red-500"}`}
              initial={{ width: "0%" }}
              animate={{ width: `${stock.isPositive ? 70 : 30}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.div>

          <div
            className="flex space-x-2"
            style={{
              transform: `translateZ(${isHovered ? 20 : 0}px)`,
              transition: "transform 0.2s ease",
            }}
          >
            <Button
              className={`flex-1 ${
                stock.isPositive
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              } text-white`}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
