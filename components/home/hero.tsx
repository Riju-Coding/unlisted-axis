"use client"

import type React from "react"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Award } from "lucide-react"
import { colors } from "@/lib/colors"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CheckCircle, Send } from "lucide-react"

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

const createPath = (points: any[]) => {
  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }
    return `${path} L ${point.x} ${point.y}`
  }, "")
}

export default function UnlistedHero() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleEnquiryChange = (field: string, value: string) => {
    setEnquiryForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "enquiries"), {
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        source: "home page query",
        createdAt: new Date(),
        status: "pending",
      })
      setSubmitSuccess(true)
      setEnquiryForm({ name: "", email: "", phone: "" })
      setTimeout(() => {
        setSubmitSuccess(false)
        setIsModalOpen(false)
      }, 2000)
    } catch (error) {
      console.error("Error submitting enquiry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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

            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="group">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
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
                  Invest Now
                  <motion.div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Calendar className="w-4 h-4" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          style={{
            backgroundColor: `${colors.background.main}CC`,
            borderColor: `${colors.primary.light}80`,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: colors.text.primary }}>Get Started with Unlisted Axis</DialogTitle>
            <DialogDescription style={{ color: colors.text.secondary }}>
              Provide your details to start investing in exclusive unlisted shares
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.success.main }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                Thank You!
              </h3>
              <p style={{ color: colors.text.secondary }}>We'll contact you soon with investment opportunities.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleEnquirySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" style={{ color: colors.text.primary }}>
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={enquiryForm.name}
                  onChange={(e) => handleEnquiryChange("name", e.target.value)}
                  required
                  placeholder="Enter your full name"
                  style={{
                    borderColor: colors.primary.light,
                    backgroundColor: `${colors.background.light}80`,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: colors.text.primary }}>
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={enquiryForm.email}
                  onChange={(e) => handleEnquiryChange("email", e.target.value)}
                  required
                  placeholder="Enter your email address"
                  style={{
                    borderColor: colors.primary.light,
                    backgroundColor: `${colors.background.light}80`,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" style={{ color: colors.text.primary }}>
                  Mobile Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={enquiryForm.phone}
                  onChange={(e) => handleEnquiryChange("phone", e.target.value)}
                  required
                  placeholder="Enter your mobile number"
                  style={{
                    borderColor: colors.primary.light,
                    backgroundColor: `${colors.background.light}80`,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                style={{
                  backgroundColor: colors.primary.main,
                  borderColor: colors.primary.main,
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
