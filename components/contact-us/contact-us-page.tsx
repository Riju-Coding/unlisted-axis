"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"
import { colors } from "@/lib/colors"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addDoc(collection(db, "enquiries"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source: "contact_us",
        createdAt: new Date(),
        status: "pending",
      })

      setSubmitSuccess(true)
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (error) {
      console.error("Error submitting contact form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["online@gfswc.com"],
      description: "Get in touch via email for any inquiries",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91-9999913974", "+91-9169165959"],
      description: "Speak directly with our investment experts",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["SCO-39, 1st Floor, HUDA Market", "Sector-7, Faridabad, Haryana-121006"],
      description: "Meet us at our corporate office",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Sat: 9:00 AM - 6:30 PM"],
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

                    {submitSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.success.main }} />
                        <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                          Message Sent Successfully!
                        </h3>
                        <p style={{ color: colors.text.secondary }}>
                          We'll get back to you soon with more information.
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" style={{ color: colors.text.primary }}>
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              placeholder="Your Name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
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
                              name="email"
                              placeholder="Email Address"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              style={{
                                borderColor: colors.primary.light,
                                backgroundColor: `${colors.background.light}80`,
                                color: colors.text.primary,
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone" style={{ color: colors.text.primary }}>
                              Phone Number *
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              placeholder="Phone Number"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              style={{
                                borderColor: colors.primary.light,
                                backgroundColor: `${colors.background.light}80`,
                                color: colors.text.primary,
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject" style={{ color: colors.text.primary }}>
                              Subject *
                            </Label>
                            <Input
                              id="subject"
                              name="subject"
                              placeholder="Subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              required
                              style={{
                                borderColor: colors.primary.light,
                                backgroundColor: `${colors.background.light}80`,
                                color: colors.text.primary,
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message" style={{ color: colors.text.primary }}>
                            Message *
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            className="min-h-[140px]"
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
                          className="w-full inline-flex items-center justify-center"
                          style={{ backgroundColor: colors.primary.main, color: colors.text.white }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    )}
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
                    <p className="mb-1 font-semibold" style={{ color: colors.text.primary }}>
                      SCO-39, 1st Floor, HUDA Market
                    </p>
                    <p className="mb-4" style={{ color: colors.text.secondary }}>
                      Sector-7, Faridabad, Haryana-121006
                    </p>
                    <p className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
                      Business Hours
                    </p>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      Mon - Sat: 9:00 AM - 6:30 PM
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
              Send us a message and we'll get back within one business day.
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
