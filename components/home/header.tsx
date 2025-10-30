"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { headerVariants, mobileMenuVariants } from "@/lib/animations"
import { themeColors, colorClasses } from "@/lib/colors"
import type { NavigationItem } from "@/types/navigation"

const navigationItems: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Unlisted Shares" },
  { href: "/ipos", label: " IPOs / SME IPOs" },
  { href: "/screener-tool", label: " Screener Tool" },
  // { href: "/knowledge-centre", label: " Knowledge Centre" },
  // { href: "/about-us", label: " About Us" },
  // { href: "/contact-us", label: " Contact Us" },

  { href: "/blog", label: "Blogs" },
   { href: "/fundraising", label: "Fund Raising" },
]

/**
 * Header component with responsive navigation and mobile menu
 * Includes theme toggle and accessibility features
 * Enhanced with scroll-based sticky behavior
 * Now uses centralized color theming system
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Enhanced scroll detection for better sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") closeMobileMenu()
    }
    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <motion.header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
          ${
            isScrolled
              ? `bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-[${themeColors.primaryLight}]/20 dark:shadow-gray-900/30 border-b border-[${themeColors.primaryLight}]/50 dark:border-gray-700/50`
              : `bg-white dark:bg-gray-900 shadow-sm border-b border-[${themeColors.primaryLight}]/50 dark:border-gray-700/50`
          }
        `}
        variants={headerVariants}
        initial="initial"
        animate="animate"
        role="banner"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group" aria-label="Unlisted Axis Home">
            <motion.div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
                boxShadow: `0 4px 14px 0 ${themeColors.primary}40`,
              }}
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                boxShadow: `0 20px 25px -5px ${themeColors.primary}66, 0 10px 10px -5px ${themeColors.primary}11`,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TrendingUp className="w-6 h-6 text-white drop-shadow-sm" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            </motion.div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Unlisted Axis
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 text-gray-600 dark:text-gray-300 ${colorClasses.hoverTextPrimary} dark:hover:text-[${themeColors.accent}] transition-all duration-300 rounded-lg group overflow-hidden`}
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primaryLight}, ${themeColors.accentLight})`,
                    }}
                    layoutId="navbar-hover"
                  />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <div className="p-1 rounded-lg bg-gray-100/50 dark:bg-gray-800/50">
              <ThemeToggle />
            </div>
            {/* <Link href="/login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  className={`text-gray-600 dark:text-gray-300 ${colorClasses.hoverTextPrimary} dark:hover:text-[${themeColors.accent}] transition-all duration-300 font-medium`}
                  style={
                    {
                      "--hover-bg": `${themeColors.primaryLight}33`,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColors.primaryLight}33`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                >
                  Login
                </Button>
              </motion.div>
            </Link> */}
            <Link href="/markets">
              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="text-white shadow-lg transition-all duration-300 font-medium border-0 relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
                    boxShadow: `0 4px 14px 0 ${themeColors.primary}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.primaryHover}, ${themeColors.secondaryHover}, ${themeColors.accentHover})`
                    e.currentTarget.style.boxShadow = `0 8px 25px 0 ${themeColors.primary}50`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`
                    e.currentTarget.style.boxShadow = `0 4px 14px 0 ${themeColors.primary}40`
                  }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Get Started</span>
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2"
              style={
                {
                  "--hover-bg": `${themeColors.primaryLight}66`,
                  "--focus-ring": themeColors.primary,
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${themeColors.primaryLight}66`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${themeColors.primary}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none"
              }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40"
            style={{ top: "73px" }}
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeMobileMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="absolute right-0 top-0 h-full w-80 max-w-[80vw] shadow-xl bg-white dark:bg-gray-900"
              style={{
                borderLeft: `1px solid ${themeColors.primaryLight}66`,
              }}
              variants={mobileMenuVariants}
            >
              <div className="p-6 space-y-6 bg-white dark:bg-gray-900 min-h-full">
                <nav className="space-y-4" role="navigation" aria-label="Mobile navigation">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        className={`block text-lg font-medium text-gray-700 dark:text-gray-300 ${colorClasses.hoverTextPrimary} dark:hover:text-[${themeColors.accent}] transition-colors py-2 focus:outline-none focus:ring-2 rounded-md`}
                        style={
                          {
                            borderBottom: `1px solid ${themeColors.primaryLight}66`,
                            "--focus-ring": themeColors.primary,
                          } as React.CSSProperties
                        }
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${themeColors.primary}`
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = "none"
                        }}
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  className="space-y-4 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/login" onClick={closeMobileMenu}>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      style={
                        {
                          borderColor: `${themeColors.primary}66`,
                          color: themeColors.primary,
                          "--hover-bg": `${themeColors.primaryLight}33`,
                        } as React.CSSProperties
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${themeColors.primaryLight}33`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={closeMobileMenu}>
                    <Button
                      className="w-full text-white"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.primaryHover}, ${themeColors.secondaryHover})`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`
                      }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  className="pt-6"
                  style={{
                    borderTop: `1px solid ${themeColors.primaryLight}66`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Market Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">NIFTY 50</span>
                      <span className="font-semibold" style={{ color: themeColors.success }}>
                        ₹19,674.25 (+1.2%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">SENSEX</span>
                      <span className="font-semibold" style={{ color: themeColors.success }}>
                        ₹66,527.67 (+0.67%)
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
