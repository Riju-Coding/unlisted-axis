"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { TrendingUp, Globe, Users } from "lucide-react"
import { staggerContainer, footerVariants } from "@/lib/animations"
import { colors } from "@/lib/colors"
import type { FooterSection } from "@/types/footer"

const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { href: "/markets", label: "Markets" },
     
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about-us", label: "About" },
     
      { href: "/contact-us", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help Center" },
      
      { href: "/privacy", label: "Privacy" },
    ],
  },
]

/**
 * Footer component with company information and links
 * Features animated sections and social media icons
 */
export default function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <footer
      className="text-white py-12 px-4"
      style={{ backgroundColor: colors.background.dark }}
      ref={ref}
      role="contentinfo"
    >
      <div className="container mx-auto">
        <motion.div
          className="grid md:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
        >
          {/* Brand Section */}
          <motion.div variants={footerVariants}>
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                }}
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold">Unlisted Axis</span>
            </div>
            <p style={{ color: colors.text.muted }} className="mb-4">
              The future of stock trading in India.
            </p>
            <div className="flex space-x-4">
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{
                  backgroundColor: colors.neutral.dark,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary.main
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral.dark
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Globe className="w-4 h-4" />
              </motion.div>
              <motion.div
                className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{
                  backgroundColor: colors.neutral.dark,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary.main
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral.dark
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Users className="w-4 h-4" />
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <motion.div key={section.title} variants={footerVariants}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2" style={{ color: colors.text.muted }}>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md"
                      style={
                        {
                          "--hover-color": colors.accent.main,
                          "--focus-ring-color": colors.primary.main,
                          "--focus-ring-offset-color": colors.background.dark,
                        } as React.CSSProperties
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.accent.main
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.text.muted
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-8 pt-8 text-center"
          style={{
            borderTop: `1px solid ${colors.neutral.dark}`,
            color: colors.text.muted,
          }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p>&copy; 2024 Unlisted Axis. All rights reserved. | SEBI Reg: INZ000123456 | Designed & Developed By Placregen Infosoft Pvt Ltd</p>
        </motion.div>
      </div>
    </footer>
  )
}
