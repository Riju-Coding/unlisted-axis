"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, Award } from "lucide-react"
import { colors } from "@/lib/colors"

/**
 * Call-to-action section with animated background
 * Features 3D button hover effects and gradient animations
 */
export default function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
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
          <Link href="/signup">
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
          </Link>
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
  )
}
