"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Award } from "lucide-react"
import { colors } from "@/lib/colors"

const heroVariants = {
  badge: {
    initial: { opacity: 0, y: -20, scale: 0.8 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  title: {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
    },
  },
  subtitle: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.4, ease: "easeOut" },
    },
  },
  buttons: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.6, ease: "easeOut" },
    },
  },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Mock stock chart data points
const chartPoints = [
  { x: 10, y: 80 },
  { x: 25, y: 65 },
  { x: 40, y: 75 },
  { x: 55, y: 45 },
  { x: 70, y: 60 },
  { x: 85, y: 35 },
  { x: 100, y: 25 },
  { x: 115, y: 40 },
  { x: 130, y: 20 },
  { x: 145, y: 30 },
]

const createPath = (points) => {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    return `${path} L ${point.x} ${point.y}`
  }, "")
}

// Company logos data
const companyLogos = [
  {
    name: "OYO",
    position: { top: "15%", left: "8%" },
    gradient: `linear-gradient(to bottom right, ${colors.primary.main}, ${colors.primary.dark})`,
  },
  {
    name: "HDFC",
    position: { top: "25%", right: "12%" },
    gradient: `linear-gradient(to bottom right, ${colors.secondary.main}, ${colors.secondary.dark})`,
  },
  {
    name: "BYJU'S",
    position: { top: "60%", left: "15%" },
    gradient: `linear-gradient(to bottom right, ${colors.accent.main}, ${colors.accent.dark})`,
  },
  {
    name: "Zomato",
    position: { top: "70%", right: "20%" },
    gradient: `linear-gradient(to bottom right, ${colors.success.main}, ${colors.success.dark})`,
  },
  {
    name: "Paytm",
    position: { top: "40%", left: "5%" },
    gradient: `linear-gradient(to bottom right, ${colors.secondary.light}, ${colors.secondary.main})`,
  },
  {
    name: "Swiggy",
    position: { top: "55%", right: "8%" },
    gradient: `linear-gradient(to bottom right, ${colors.primary.light}, ${colors.primary.main})`,
  },
]

export default function UnlistedHero() {
  return (
    <section className="py-24 px-4 relative overflow-hidden min-h-screen flex items-center" role="banner">
      <div className="container mx-auto text-center relative z-10">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8">
          {/* Badge */}
          <motion.div
            variants={heroVariants.badge}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold shadow-lg backdrop-blur-sm border rounded-full"
            style={{
              background: `linear-gradient(to right, ${colors.success.light}20, ${colors.success.main}10, ${colors.success.light}20)`,
              color: colors.success.dark,
              borderColor: `${colors.success.main}50`,
              boxShadow: `0 10px 25px ${colors.success.main}20`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Award className="w-4 h-4 mr-2" />
            </motion.div>
            Welcome To Unlisted Axis
            <motion.div
              className="ml-2 w-2 h-2 bg-amber-500 rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>

          {/* Main Headline */}
          <motion.h1 variants={heroVariants.title} className="text-5xl md:text-7xl font-black leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Invest in Exclusive
            </span>
            <br />
            <motion.span
              className="bg-clip-text text-transparent relative"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
                backgroundSize: "200% 200%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              Unlisted & Pre-IPO
              <motion.div
                className="absolute -inset-1 blur-xl -z-10"
                style={{
                  background: `linear-gradient(to right, ${colors.primary.main}20, ${colors.secondary.main}20, ${colors.accent.main}20)`,
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Opportunities
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={heroVariants.subtitle}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Handpicked{" "}
            <span className="font-semibold" style={{ color: colors.primary.main }}>
              high-growth companies
            </span>{" "}
            before they list on exchanges. Get early access to India's most promising startups and unicorns.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={heroVariants.buttons}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/markets">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateX: 5,
                  rotateY: 5,
                }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: "preserve-3d" }}
                className="group"
              >
                <Button
                  size="lg"
                  className="text-white px-10 py-6 text-lg font-semibold shadow-2xl transition-all duration-500 border-0 relative overflow-hidden rounded-xl"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
                    boxShadow: `0 25px 50px ${colors.primary.main}25`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary.dark}, ${colors.secondary.dark}, ${colors.accent.dark})`
                    e.currentTarget.style.boxShadow = `0 25px 50px ${colors.primary.main}40`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`
                    e.currentTarget.style.boxShadow = `0 25px 50px ${colors.primary.main}25`
                  }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center">
                    Browse Unlisted Shares
                    <motion.div
                      className="ml-3"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            </Link>

            <Link href="/ipos">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="group">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 text-lg font-semibold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl border-2"
                  style={{
                    borderColor: colors.secondary.light,
                    color: colors.secondary.dark,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.secondary.main}10`
                    e.currentTarget.style.borderColor = colors.secondary.main
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.5)"
                    e.currentTarget.style.borderColor = colors.secondary.light
                  }}
                >
                  <span className="flex items-center">
                    View IPO Calendar
                    <motion.div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Calendar className="w-4 h-4" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.primary.main }} />
              <span>SEBI Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.secondary.main }} />
              <span>Verified Companies</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success.main }} />
              <span>50+ Unlisted Stocks</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Clean Stock Chart Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <svg
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full"
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.primary.main} stopOpacity="0.1" />
              <stop offset="50%" stopColor={colors.secondary.main} stopOpacity="0.15" />
              <stop offset="100%" stopColor={colors.accent.main} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <motion.path
            d={createPath(chartPoints)}
            stroke="url(#chartGradient)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
          />

          {/* Chart points */}
          {chartPoints.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="0.8"
              fill={colors.secondary.main}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
            />
          ))}
        </svg>
      </div>

      {/* Floating Company Logos */}
      {/* {companyLogos.map((company, index) => (
        <motion.div
          key={company.name}
          className="absolute hidden lg:block"
          style={company.position}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
          transition={{ delay: 1.5 + index * 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="w-16 h-16 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-sm"
            style={{
              background: company.gradient,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {company.name}
          </motion.div>
        </motion.div>
      ))} */}

      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: `linear-gradient(to bottom right, ${colors.primary.main}10, ${colors.secondary.main}10)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `linear-gradient(to bottom right, ${colors.secondary.main}10, ${colors.accent.main}10)`,
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </section>
  )
}
