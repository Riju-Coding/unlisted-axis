"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  TrendingUp,
  Users,
  Target,
  Award,
  Building2,
  PieChart,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Briefcase,
} from "lucide-react"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"


interface InvestmentEnquiry {
  name: string
  email: string
  phone: string
  company?: string
  investmentType: "seed" | "series-a" | "series-b" | "strategic" | "other"
  investmentAmount: string
  timeline: string
  message: string
}

export default function FundraisingPage() {
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [formData, setFormData] = useState<InvestmentEnquiry>({
    name: "",
    email: "",
    phone: "",
    company: "",
    investmentType: "seed",
    investmentAmount: "",
    timeline: "",
    message: "",
  })

  const handleSubmitEnquiry = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await addDoc(collection(db, "enquiries"), {
        // Standard enquiry fields matching existing structure
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        createdAt: new Date(),
        status: "pending",

        type: "fundraising",

        shareId: "fundraising-series-b", // Consistent with existing pattern
        shareName: "Unlisted Axis - Series B Funding", // Consistent with existing pattern

        // Additional fundraising details
        company: formData.company || "",
        investmentType: formData.investmentType,
        investmentAmount: formData.investmentAmount,
        timeline: formData.timeline,
      })

      alert("Thank you for your interest! We'll be in touch within 24 hours.")
      setShowEnquiryForm(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        investmentType: "seed",
        investmentAmount: "",
        timeline: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting investment enquiry:", error)
      alert("Error submitting enquiry. Please try again.")
    }
  }

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Started with vision to democratize unlisted stock investments",
    },
    { year: "2021", title: "Platform Launch", description: "Launched trading platform with 50+ unlisted stocks" },
    { year: "2022", title: "Series A", description: "Raised ₹5Cr Series A, expanded to 500+ stocks" },
    { year: "2023", title: "Market Leader", description: "Became India's leading unlisted stock platform" },
    { year: "2024", title: "Growth Phase", description: "Seeking Series B to scale operations nationwide" },
  ]

  const keyMetrics = [
    { label: "Active Users", value: "50,000+", icon: Users, color: colors.primary.main },
    { label: "Monthly Volume", value: "₹100Cr+", icon: TrendingUp, color: colors.success.main },
    { label: "Listed Stocks", value: "1,000+", icon: Building2, color: colors.accent.main },
    { label: "Success Rate", value: "95%", icon: Award, color: colors.accent.main },
  ]

  const investmentHighlights = [
    {
      title: "Market Leadership",
      description: "Leading platform for unlisted stock trading in India",
      icon: Target,
    },
    {
      title: "Proven Growth",
      description: "300% YoY growth in trading volume and user base",
      icon: BarChart3,
    },
    {
      title: "Strong Team",
      description: "Experienced team from top financial institutions",
      icon: Users,
    },
    {
      title: "Technology Edge",
      description: "Proprietary valuation models and trading algorithms",
      icon: PieChart,
    },
  ]

  return (
    <motion.div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.main} 50%, ${colors.background.dark} 100%)`,
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header />

      <main className="py-8">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div
                className="inline-flex items-center px-4 py-2 rounded-full mb-6"
                style={{ backgroundColor: `${colors.success.light}20`, color: colors.success.main }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Seeking Series B Funding - ₹25 Crores
              </div>

              <h1 className="text-6xl md:text-7xl font-black mb-6 text-balance">
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary.main} 50%, ${colors.accent.main} 100%)`,
                  }}
                >
                  Unlisted Axis
                </span>
              </h1>

              <p className="text-2xl mb-8 text-balance" style={{ color: colors.text.secondary }}>
                Democratizing Access to Pre-IPO Investment Opportunities
              </p>

              <p className="text-lg mb-12 max-w-3xl mx-auto text-pretty" style={{ color: colors.text.secondary }}>
                Join us in revolutionizing the unlisted stock market. We're building India's most trusted platform for
                pre-IPO investments, connecting retail investors with high-growth companies before they go public.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowEnquiryForm(true)}
                  className="text-lg px-8 py-4"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                    border: "none",
                  }}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Invest Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 bg-transparent"
                  style={{ borderColor: colors.primary.main, color: colors.primary.main }}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Download Pitch Deck
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {keyMetrics.map((metric, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card
                    className="text-center backdrop-blur-sm border shadow-xl"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardContent className="p-6">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${metric.color}20` }}
                      >
                        <metric.icon className="w-8 h-8" style={{ color: metric.color }} />
                      </div>
                      <div className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                        {metric.value}
                      </div>
                      <div className="text-sm" style={{ color: colors.text.secondary }}>
                        {metric.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Investment Highlights */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Why Invest in Unlisted Axis?
              </h2>
              <p className="text-xl" style={{ color: colors.text.secondary }}>
                Positioned to capture the massive unlisted stock market opportunity
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {investmentHighlights.map((highlight, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card
                    className="backdrop-blur-sm border shadow-xl h-full"
                    style={{
                      backgroundColor: `${colors.background.main}CC`,
                      borderColor: `${colors.primary.light}80`,
                    }}
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${colors.primary.light}40` }}
                        >
                          <highlight.icon className="w-6 h-6" style={{ color: colors.primary.main }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                            {highlight.title}
                          </h3>
                          <p style={{ color: colors.text.secondary }}>{highlight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Company Journey */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Our Journey
              </h2>
              <p className="text-xl" style={{ color: colors.text.secondary }}>
                From startup to market leader in just 4 years
              </p>
            </motion.div>

            <div className="relative">
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full"
                style={{ backgroundColor: `${colors.primary.light}40` }}
              />

              <motion.div className="space-y-12" variants={staggerContainer} initial="initial" animate="animate">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className="w-1/2 px-8">
                      <Card
                        className="backdrop-blur-sm border shadow-xl"
                        style={{
                          backgroundColor: `${colors.background.main}CC`,
                          borderColor: `${colors.primary.light}80`,
                        }}
                      >
                        <CardContent className="p-6">
                          <Badge className="mb-3" style={{ backgroundColor: colors.primary.main, color: "white" }}>
                            {milestone.year}
                          </Badge>
                          <h3 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>
                            {milestone.title}
                          </h3>
                          <p style={{ color: colors.text.secondary }}>{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="relative">
                      <div
                        className="w-4 h-4 rounded-full border-4 border-white"
                        style={{ backgroundColor: colors.primary.main }}
                      />
                    </div>

                    <div className="w-1/2" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Funding Details */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold mb-6" style={{ color: colors.text.primary }}>
                  Series B Funding Round
                </h2>
                <p className="text-lg mb-8" style={{ color: colors.text.secondary }}>
                  We're raising ₹25 Crores to accelerate our growth, expand our technology platform, and capture the
                  massive market opportunity in unlisted stock trading.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.success.light}40` }}
                    >
                      <Target className="w-6 h-6" style={{ color: colors.success.main }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.text.primary }}>
                        Funding Goal: ₹25 Crores
                      </h3>
                      <p style={{ color: colors.text.secondary }}>
                        Series B round for expansion and technology development
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary.light}40` }}
                    >
                      <Calendar className="w-6 h-6" style={{ color: colors.primary.main }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.text.primary }}>
                        Timeline: Q2 2024
                      </h3>
                      <p style={{ color: colors.text.secondary }}>Seeking to close funding by June 2024</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.accent.light}40` }}
                    >
                      <TrendingUp className="w-6 h-6" style={{ color: colors.accent.main }} />
                    </div>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.text.primary }}>
                        Projected ROI: 5-10x
                      </h3>
                      <p style={{ color: colors.text.secondary }}>Based on market growth and expansion plans</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card
                  className="backdrop-blur-sm border shadow-2xl"
                  style={{
                    backgroundColor: `${colors.background.main}CC`,
                    borderColor: `${colors.primary.light}80`,
                  }}
                >
                  <CardHeader>
                    <CardTitle style={{ color: colors.text.primary }}>Use of Funds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span style={{ color: colors.text.secondary }}>Technology & Platform</span>
                      <span style={{ color: colors.text.primary }} className="font-bold">
                        40%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: colors.text.secondary }}>Market Expansion</span>
                      <span style={{ color: colors.text.primary }} className="font-bold">
                        30%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: colors.text.secondary }}>Team & Operations</span>
                      <span style={{ color: colors.text.primary }} className="font-bold">
                        20%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: colors.text.secondary }}>Marketing & Growth</span>
                      <span style={{ color: colors.text.primary }} className="font-bold">
                        10%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6" style={{ color: colors.text.primary }}>
                Ready to Join Our Journey?
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
                Be part of India's unlisted stock revolution. Connect with us to explore investment opportunities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setShowEnquiryForm(true)}
                  className="text-lg px-8 py-4"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                    border: "none",
                  }}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Get in Touch
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 bg-transparent"
                  style={{ borderColor: colors.primary.main, color: colors.primary.main }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule Call
                </Button>
              </div>
            </motion.div>
           
          </div>
        </section>
        
      </main>
 <Footer/>
      {/* Investment Enquiry Form Modal */}
      <AnimatePresence>
        {showEnquiryForm && (
          <Dialog open={true} onOpenChange={() => setShowEnquiryForm(false)}>
            <DialogContent
              className="max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: colors.background.main }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text.primary }}>Investment Enquiry</CardTitle>
                  <p style={{ color: colors.text.secondary }}>
                    Tell us about your investment interests and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                        Email Address *
                      </label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        type="email"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                        Phone Number *
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        type="tel"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                        Company/Organization
                      </label>
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your company name"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                        Investment Type
                      </label>
                      <Select
                        value={formData.investmentType}
                        onValueChange={(value: any) => setFormData({ ...formData, investmentType: value })}
                      >
                        <SelectTrigger
                          style={{
                            backgroundColor: `${colors.background.light}80`,
                            borderColor: colors.primary.light,
                            color: colors.text.primary,
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seed">Seed Funding</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="strategic">Strategic Investment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                        Investment Amount
                      </label>
                      <Input
                        value={formData.investmentAmount}
                        onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                        placeholder="₹1 Crore - ₹10 Crores"
                        style={{
                          backgroundColor: `${colors.background.light}80`,
                          borderColor: colors.primary.light,
                          color: colors.text.primary,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                      Investment Timeline
                    </label>
                    <Input
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      placeholder="e.g., Within 3 months, Q2 2024"
                      style={{
                        backgroundColor: `${colors.background.light}80`,
                        borderColor: colors.primary.light,
                        color: colors.text.primary,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: colors.text.secondary }} className="block text-sm mb-2">
                      Message
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your investment thesis, requirements, or any questions you have..."
                      rows={4}
                      style={{
                        backgroundColor: `${colors.background.light}80`,
                        borderColor: colors.primary.light,
                        color: colors.text.primary,
                      }}
                    />
                  </div>
                </CardContent>
                <div className="flex items-center justify-between p-6 pt-0">
                  <Button
                    variant="outline"
                    onClick={() => setShowEnquiryForm(false)}
                    style={{ borderColor: colors.neutral.main, color: colors.text.secondary }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitEnquiry}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                      opacity: !formData.name || !formData.email || !formData.phone ? 0.5 : 1,
                    }}
                  >
                    Submit Enquiry
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
        
      </AnimatePresence>
      
    </motion.div>
  )
}
