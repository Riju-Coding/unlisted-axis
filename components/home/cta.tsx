"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, Award, CheckCircle, Send } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { colors } from "@/lib/colors"

export default function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

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
    <>
      <motion.section
        ref={ref}
        className="py-24 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
          }}
          animate={{
            background: [
              `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
              `linear-gradient(45deg, ${colors.secondary.main}, ${colors.accent.main}, ${colors.primary.main})`,
              `linear-gradient(45deg, ${colors.accent.main}, ${colors.primary.main}, ${colors.secondary.main})`,
              `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main}, ${colors.accent.main})`,
            ],
          }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Overlay with animated patterns */}
        <motion.div
          className="absolute inset-0 bg-black/20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(0,0,0,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,0,0,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(0,0,0,0.1) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(0,0,0,0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.h2
            className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-lg"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Start Trading?
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md"
            style={{ color: colors.accent.light }}
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Join <span className="font-bold text-white">thousands of Indian investors</span> who trust Unlisted Axis for
            their trading needs.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{
                scale: 1.05,
                rotateX: 10,
                rotateY: 10,
              }}
              whileTap={{ scale: 0.95 }}
              style={{ transformStyle: "preserve-3d" }}
              className="inline-block group"
            >
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl border-0 relative overflow-hidden"
                style={{
                  backgroundColor: "white",
                  color: colors.primary.main,
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, ${colors.accent.light}, ${colors.secondary.light})`,
                  }}
                />
                <span className="relative z-10 flex items-center">
                  Create Free Account
                  <motion.div
                    className="ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </span>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 mt-12"
            style={{ color: colors.accent.light }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">SEBI Regulated</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">5L+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="font-medium">Award Winning</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

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
              Provide your details to start trading unlisted shares
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
              <p style={{ color: colors.text.secondary }}>We'll contact you soon to get you started.</p>
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
                    Create Account
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
