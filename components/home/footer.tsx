"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import { TrendingUp, Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
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

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/unlistedaxis",
    icon: Facebook,
    color: "#1877F2",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/unlistedaxis/",
    icon: Instagram,
    color: "#E4405F",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/unlisted-axis/",
    icon: Linkedin,
    color: "#0A66C2",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/UnlistedA26813",
    icon: Twitter,
    color: "#000000",
  },
]

// Custom Pinterest Icon Component
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
)

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
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    backgroundColor: colors.neutral.dark,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = social.color
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.neutral.dark
                  }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
              <motion.a
                href="https://in.pinterest.com/unlistedaxis23/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                style={{
                  backgroundColor: colors.neutral.dark,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E60023"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral.dark
                }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <PinterestIcon className="w-4 h-4" />
              </motion.a>
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