"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Calendar, Maximize2, Minimize2 } from "lucide-react"

const timeRanges = ["1D", "1W", "1M", "3M", "1Y", "5Y"]

// Generate realistic stock data
const generateStockData = (days, startPrice, volatility) => {
  const data = []
  let price = startPrice

  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * volatility
    price = Math.max(price + change, 0.1)

    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Number.parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    })
  }

  return data
}

export default function AdvancedChart({
  symbol = "RELIANCE",
  name = "Reliance Industries",
  currentPrice = 2456.75,
  change = 45.2,
  changePercent = 1.87,
  isPositive = true,
  startPrice = 2400,
  volatility = 50,
}) {
  const [selectedRange, setSelectedRange] = useState("1M")
  const [chartData, setChartData] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      const days =
        selectedRange === "1D"
          ? 1
          : selectedRange === "1W"
            ? 7
            : selectedRange === "1M"
              ? 30
              : selectedRange === "3M"
                ? 90
                : selectedRange === "1Y"
                  ? 365
                  : 1825

      setChartData(generateStockData(days, startPrice, volatility))
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [selectedRange, startPrice, volatility])

  const priceMin = Math.min(...chartData.map((d) => d.price)) * 0.99
  const priceMax = Math.max(...chartData.map((d) => d.price)) * 1.01

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${isExpanded ? "fixed inset-4 z-50" : "relative"}`}
    >
      <Card
        className={`bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-green-100/50 dark:border-green-900/30 shadow-xl relative z-20 ${isExpanded ? "h-full" : ""}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {symbol.charAt(0)}
                </div>
                <CardTitle className="text-xl font-bold">{symbol}</CardTitle>
                <span className="text-sm text-gray-500 dark:text-gray-400">{name}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="text-2xl font-bold">₹{currentPrice.toFixed(2)}</div>
              <div className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">₹{change.toFixed(2)}</span>
                <span>({changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range)}
                className={`${
                  selectedRange === range
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "border-green-200 dark:border-green-900/50"
                }`}
              >
                {range}
              </Button>
            ))}
          </div>

          <div className={`w-full ${isExpanded ? "h-[calc(100vh-240px)]" : "h-[300px]"}`}>
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  price: {
                    label: "Price",
                    color: isPositive ? "hsl(142.1 76.2% 36.3%)" : "hsl(0 84.2% 60.2%)",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                    <YAxis
                      domain={[priceMin, priceMax]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#22c55e" : "#ef4444"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
              Volume:{" "}
              {chartData.length > 0 ? (chartData[chartData.length - 1].volume / 1000000).toFixed(2) + "M" : "N/A"}
            </Badge>

            <div className="flex space-x-2">
              <Badge
                variant={isPositive ? "default" : "destructive"}
                className={isPositive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}
              >
                {isPositive ? "Bullish" : "Bearish"}
              </Badge>
              <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800">
                {selectedRange} Chart
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </motion.div>
  )
}
