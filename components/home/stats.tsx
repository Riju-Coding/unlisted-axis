"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { staggerContainer, statsVariants } from "@/lib/animations"
import type { Stat } from "@/types/stats"

const stats: Stat[] = [
  { value: "₹2.5L Cr+", label: "Assets Under Management" },
  { value: "5L+", label: "Active Traders" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "24/7", label: "Customer Support" },
]

/**
 * Statistics section with animated counters
 * Features hover effects and staggered animations
 */
export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          className="grid md:grid-cols-4 gap-8 text-center"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={statsVariants}
              className="group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
