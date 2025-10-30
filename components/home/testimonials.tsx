"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import { staggerContainer, cardVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"
import type { Testimonial } from "@/types/testimonials"

const testimonials: Testimonial[] = [
  {
    name: "Rajesh Kumar",
    role: "Day Trader",
    content:
      "StockFlow has revolutionized my trading experience. The speed and accuracy are unmatched in the Indian market.",
    avatar: "R",
  },
  {
    name: "Priya Sharma",
    role: "Investment Advisor",
    content: "The analytics and research tools are incredibly powerful. My clients love the detailed insights.",
    avatar: "P",
  },
  {
    name: "Amit Patel",
    role: "Long-term Investor",
    content: "Zero commission trading and excellent customer support. StockFlow is the future of investing in India.",
    avatar: "A",
  },
]

/**
 * Testimonials section with user reviews
 * Features animated cards with hover effects
 */
export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      className="py-20 px-4 dark:from-gray-800 dark:to-gray-900"
      style={{
        background: `linear-gradient(to right, ${colors.background.light}, ${colors.background.lighter})`,
      }}
      ref={ref}
    >
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text.primary }}>
            Trusted by Traders
          </h2>
          <p className="text-xl" style={{ color: colors.text.secondary }}>
            See what our users say about StockFlow
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.name} variants={cardVariants}>
              <Card
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-500 h-full"
                style={{
                  borderColor: colors.neutral.light,
                  backgroundColor: colors.background.card,
                }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                      }}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <div className="font-semibold" style={{ color: colors.text.primary }}>
                        {testimonial.name}
                      </div>
                      <div className="text-sm" style={{ color: colors.text.secondary }}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <CardDescription style={{ color: colors.text.secondary }}>"{testimonial.content}"</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
