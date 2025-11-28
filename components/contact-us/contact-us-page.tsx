"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { colors } from "@/lib/colors"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@unlistedaxis.com", "support@unlistedaxis.com"],
      description: "Get in touch via email for any inquiries",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 98765 43210", "+91 87654 32109"],
      description: "Speak directly with our investment experts",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Financial District", "Mumbai, Maharashtra 400001"],
      description: "Meet us at our corporate office",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
      description: "We're here when you need us",
    },
  ]

  return (
    <motion.div
     className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative"
      
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header />
      <main className="py-8 mt-10">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})` }}
            />
            <div
              className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
              style={{ background: `linear-gradient(135deg, ${colors.accent.main}, ${colors.success.main})` }}
            />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="relative max-w-7xl mx-auto text-center"
          >
            <motion.h1
              variants={cardVariants}
              className="text-5xl md:text-7xl font-bold mb-6"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Contact Unlisted Axis
            </motion.h1>

            <motion.p
              variants={cardVariants}
              className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              We're here to help you with any questions about unlisted shares, IPOs, or your investment journey.
            </motion.p>

            <motion.div
              variants={cardVariants}
              className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
              }}
            >
              Get in Touch Today
            </motion.div>
          </motion.div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: colors.background.white,
                    border: `1px solid ${colors.neutral.light}`,
                  }}
                >
                  <div
                    className="w-14 h-14 mb-4 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})` }}
                  >
                    <info.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.primary.main }}>
                    {info.title}
                  </h3>
                  <p className="mb-3" style={{ color: colors.text.secondary }}>
                    {info.description}
                  </p>
                  <div className="space-y-1">
                    {info.details.map((d, i) => (
                      <div key={i} className="text-sm" style={{ color: colors.text.primary }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}>
              <motion.div variants={cardVariants} className="grid md:grid-cols-2 gap-8 items-start">
                <Card
                  className="shadow-lg"
                  style={{ background: colors.background.white, border: `1px solid ${colors.neutral.light}` }}
                >
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: colors.primary.main }}>
                      Send us a message
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          name="name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          style={{ color: colors.text.primary }}
                        />
                        <Input
                          name="email"
                          placeholder="Email Address"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          style={{ color: colors.text.primary }}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          name="phone"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleInputChange}
                          style={{ color: colors.text.primary }}
                        />
                        <Input
                          name="subject"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          style={{ color: colors.text.primary }}
                        />
                      </div>
                      <Textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="min-h-[140px]"
                        style={{ color: colors.text.primary }}
                      />
                      <Button
                        type="submit"
                        className="w-full inline-flex items-center justify-center"
                        style={{ backgroundColor: colors.primary.main, color: colors.text.white }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <div
                    className="rounded-2xl p-6 shadow-lg"
                    style={{ background: colors.background.white, border: `1px solid ${colors.neutral.light}` }}
                  >
                    <h3 className="text-2xl font-bold mb-4" style={{ color: colors.primary.main }}>
                      Why reach out?
                    </h3>
                    <ul className="space-y-3" style={{ color: colors.text.secondary }}>
                      <li>• Learn about unlisted shares and upcoming IPOs</li>
                      <li>• Get guidance tailored to your portfolio</li>
                      <li>• Resolve account or transaction queries</li>
                      <li>• Partner with us for institutional deals</li>
                    </ul>
                  </div>
                  <div
                    className="rounded-2xl p-6 shadow-lg"
                    style={{ background: colors.background.white, border: `1px solid ${colors.neutral.light}` }}
                  >
                    <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary.main }}>
                      Office Address
                    </h3>
                    <p className="mb-1" style={{ color: colors.text.primary }}>
                      123 Financial District
                    </p>
                    <p className="mb-4" style={{ color: colors.text.secondary }}>
                      Mumbai, Maharashtra 400001
                    </p>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      Mon - Fri: 9:00 AM - 6:00 PM • Sat: 10:00 AM - 4:00 PM
                    </p>
        </div>
      </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})` }}
        >
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <motion.h2 variants={cardVariants} className="text-4xl md:text-5xl font-bold mb-6">
              Ready to talk to our team?
            </motion.h2>
            <motion.p variants={cardVariants} className="text-xl mb-8 opacity-90">
              Send us a message and we’ll get back within one business day.
            </motion.p>
            <motion.button
              variants={cardVariants}
              className="inline-flex items-center px-8 py-4 bg-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ color: colors.primary.main }}
            >
              Contact Support
            </motion.button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </motion.div>
  )
}
