"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Search, MessageCircle, Shield, CheckCircle, Users, Star } from "lucide-react"
import Link from "next/link"
import { colors } from "@/lib/colors"

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Browse Opportunities",
      subtitle: "Verified deals",
      description:
        "Explore our curated selection of upcoming IPOs. All opportunities are thoroughly vetted by our expert team to ensure quality and compliance.",
      features: [
        "Pre-verified IPO opportunities",
        "Detailed company analysis",
        "Real-time pricing updates",
        "Expert recommendations",
      ],
      icon: Search,
      gradient: `from-[${colors.primary.main}] to-[${colors.secondary.main}]`,
      bgGradient: `from-[${colors.primary.light}] to-[${colors.secondary.light}]`,
      linkHref: "/ipos",
      linkText: "Browse IPOs",
    },
    {
      number: 2,
      title: "Enquire",
      subtitle: "Form/WhatsApp",
      description:
        "Get in touch with our investment specialists through our secure enquiry form or directly via WhatsApp for instant support.",
      features: ["Quick enquiry form", "WhatsApp support", "Expert consultation", "Personalized guidance"],
      icon: MessageCircle,
      gradient: `from-[${colors.secondary.main}] to-[${colors.accent.main}]`,
      bgGradient: `from-[${colors.secondary.light}] to-[${colors.accent.light}]`,
      linkHref: "/contact-us",
      linkText: "Start Enquiry",
    },
    {
      number: 3,
      title: "Invest Securely",
      subtitle: "With compliance",
      description:
        "Complete your investment through our secure, fully compliant platform with end-to-end encryption and regulatory oversight.",
      features: ["Bank-grade security", "Full regulatory compliance", "Transparent pricing", "Investment tracking"],
      icon: Shield,
      gradient: `from-[${colors.accent.main}] to-[${colors.primary.main}]`,
      bgGradient: `from-[${colors.accent.light}] to-[${colors.primary.light}]`,
      linkHref: "/markets",
      linkText: "Start Investing",
    },
  ]

  return (
    <div
      className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      style={{
        background: `linear-gradient(to bottom right, ${colors.primary.light}, ${colors.background.main}, ${colors.secondary.light})`,
      }}
    >
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge
              variant="secondary"
              className="mb-6 border-0"
              style={{
                background: `linear-gradient(to right, ${colors.primary.light}, ${colors.secondary.light})`,
                color: colors.primary.main,
              }}
            >
              <Star className="w-4 h-4 mr-2" />
              Simple 3-Step Process
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
                }}
              >
                How It Works
              </span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: colors.text.secondary }}>
              Start your IPO investment journey in just 3 simple steps. Our streamlined process ensures security,
              compliance, and expert guidance every step of the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress Stepper */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="flex items-center justify-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4 md:space-x-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle */}
                  <motion.div
                    className="relative w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main})`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>{step.number}</span>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    />
                  </motion.div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className="hidden md:block w-16 lg:w-24 h-1 mx-4"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary.light}, ${colors.secondary.light})`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div key={step.number} variants={cardVariants} whileHover="hover">
                <Card
                  className="relative overflow-hidden border-0 shadow-2xl dark:from-gray-800 dark:to-gray-900"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.background.main}, ${colors.neutral.light})`,
                  }}
                >
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-2 gap-0 items-center min-h-[400px]">
                      {/* Content */}
                      <div className={`p-8 lg:p-12 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl"
                            style={{
                              background: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main})`,
                            }}
                          >
                            <step.icon className="w-10 h-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className="text-sm font-semibold px-3 py-1 rounded-full"
                                style={{
                                  color: colors.primary.main,
                                  backgroundColor: colors.primary.light,
                                }}
                              >
                                STEP {step.number}
                              </span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: colors.text.primary }}>
                              {step.title}
                            </h2>
                            <p className="text-lg font-medium" style={{ color: colors.primary.main }}>
                              {step.subtitle}
                            </p>
                          </div>
                        </div>

                        <p className="text-lg mb-8 leading-relaxed" style={{ color: colors.text.secondary }}>
                          {step.description}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-3 mb-8">
                          {step.features.map((feature, featureIndex) => (
                            <motion.div
                              key={featureIndex}
                              className="flex items-center gap-3 backdrop-blur-sm rounded-lg p-3"
                              style={{
                                backgroundColor: `${colors.background.main}60`,
                              }}
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.success.main }} />
                              <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                                {feature}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Step-specific CTA */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            asChild
                            size="lg"
                            className="border-0 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 text-white hover:shadow-xl"
                            style={{
                              background: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main})`,
                            }}
                          >
                            <Link href={step.linkHref}>
                              {step.linkText}
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                          </Button>
                        </motion.div>
                      </div>

                      {/* Visual */}
                      <div
                        className={`relative p-8 lg:p-12 flex items-center justify-center ${index % 2 === 1 ? "lg:order-1" : ""}`}
                      >
                        <motion.div
                          className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full flex items-center justify-center shadow-2xl"
                          style={{
                            background: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main})`,
                          }}
                          animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <step.icon className="w-24 h-24 lg:w-32 lg:h-32 text-white" />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 to-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section
        className="py-20 px-4 backdrop-blur-sm"
        style={{
          backgroundColor: `${colors.background.main}60`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main})`,
                }}
              >
                Why Choose Our Platform?
              </span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
              Trusted by thousands of investors for secure and compliant IPO investments
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Expert Team",
                desc: "Experienced professionals guiding your investment decisions",
              },
              { icon: Shield, title: "Secure Platform", desc: "Bank-grade security with full regulatory compliance" },
              {
                icon: CheckCircle,
                title: "Verified Deals",
                desc: "All IPO opportunities are thoroughly vetted and verified",
              },
            ].map((item, index) => (
              <motion.div key={index} variants={cardVariants} whileHover="hover">
                <Card
                  className="text-center p-8 shadow-lg border-0"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.background.main}, ${colors.neutral.light})`,
                    borderColor: `${colors.primary.light}50`,
                  }}
                >
                  <CardContent className="p-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary.main}, ${colors.secondary.main})`,
                      }}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: colors.text.primary }}>
                      {item.title}
                    </h3>
                    <p style={{ color: colors.text.secondary }}>{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
    
    </div>
  )
}
