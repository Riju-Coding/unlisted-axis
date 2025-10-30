"use client"
import { motion } from "framer-motion"
import { colors } from "@/lib/colors"
import { pageVariants, staggerContainer, cardVariants } from "@/lib/animations"
import { Users, Target, TrendingUp, Shield, Award, Globe } from "lucide-react"
import Header from "@/components/home/header"
import Footer from "@/components/home/footer"

const AboutUsPage = () => {
  const stats = [
    { label: "Happy Investors", value: "10,000+", icon: Users },
    { label: "Unlisted Shares", value: "500+", icon: TrendingUp },
    { label: "Years Experience", value: "8+", icon: Award },
    { label: "Success Rate", value: "95%", icon: Target },
  ]

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description:
        "We believe in complete transparency in all our dealings, ensuring our investors have full visibility into their investments.",
    },
    {
      icon: TrendingUp,
      title: "Growth Focused",
      description:
        "Our focus is on identifying high-growth potential unlisted companies that can deliver exceptional returns to our investors.",
    },
    {
      icon: Globe,
      title: "Market Expertise",
      description:
        "With deep market knowledge and extensive research capabilities, we provide insights that matter for investment decisions.",
    },
    {
      icon: Users,
      title: "Client First",
      description:
        "Every decision we make is centered around our clients' success and their long-term wealth creation goals.",
    },
  ]

  const team = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      experience: "12+ years in Investment Banking",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Priya Sharma",
      role: "Head of Research",
      experience: "10+ years in Equity Research",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Amit Patel",
      role: "VP Operations",
      experience: "8+ years in Financial Operations",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <motion.div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.main} 50%, ${colors.background.dark} 100%)`,
      }}
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
              About Unlisted Axis
            </motion.h1>

            <motion.p
              variants={cardVariants}
              className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              Empowering investors to access high-growth unlisted companies and build wealth through strategic pre-IPO
              investments.
            </motion.p>

            <motion.div
              variants={cardVariants}
              className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
              }}
            >
              <TrendingUp className="mr-3 h-6 w-6" />
              Trusted by 10,000+ Investors
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="text-center p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: colors.background.white,
                    border: `1px solid ${colors.neutral.light}`,
                  }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})` }}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2" style={{ color: colors.primary.main }}>
                    {stat.value}
                  </h3>
                  <p style={{ color: colors.text.secondary }}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <motion.div variants={cardVariants}>
                <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: colors.primary.main }}>
                  Our Story
                </h2>
                <div className="space-y-6 text-lg leading-relaxed" style={{ color: colors.text.secondary }}>
                  <p>
                    Founded in 2016, Unlisted Axis emerged from a simple yet powerful vision: to democratize access to
                    high-growth unlisted companies for retail investors across India.
                  </p>
                  <p>
                    What started as a small team of passionate financial experts has grown into India's leading platform
                    for unlisted share investments, serving over 10,000 satisfied investors.
                  </p>
                  <p>
                    We recognized that the most exciting investment opportunities often exist in the unlisted space -
                    companies on the verge of going public, with tremendous growth potential but limited accessibility
                    for individual investors.
                  </p>
                  <p>
                    Today, we continue to bridge this gap, providing retail investors with carefully curated investment
                    opportunities in India's most promising unlisted companies.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={cardVariants} className="relative">
                <div
                  className="rounded-3xl p-8 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                  }}
                >
                  <div className="text-white">
                    <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
                    <p className="text-lg leading-relaxed mb-6">
                      To empower every Indian investor with access to high-quality unlisted investment opportunities,
                      backed by thorough research and transparent processes.
                    </p>
                    <div className="flex items-center">
                      <Target className="h-8 w-8 mr-3" />
                      <span className="text-xl font-semibold">Building Wealth, Creating Futures</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section
          className="py-20 px-4 sm:px-6 lg:px-8"
          style={{
            background: `linear-gradient(135deg, ${colors.background.light} 0%, ${colors.background.white} 100%)`,
          }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2
                variants={cardVariants}
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: colors.primary.main }}
              >
                Our Values
              </motion.h2>
              <motion.p
                variants={cardVariants}
                className="text-xl max-w-3xl mx-auto"
                style={{ color: colors.text.secondary }}
              >
                The principles that guide everything we do at Unlisted Axis
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: colors.background.white,
                    border: `1px solid ${colors.neutral.light}`,
                  }}
                >
                  <div
                    className="w-16 h-16 mb-6 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})` }}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: colors.primary.main }}>
                    {value.title}
                  </h3>
                  <p className="text-lg leading-relaxed" style={{ color: colors.text.secondary }}>
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2
                variants={cardVariants}
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{ color: colors.primary.main }}
              >
                Meet Our Team
              </motion.h2>
              <motion.p
                variants={cardVariants}
                className="text-xl max-w-3xl mx-auto"
                style={{ color: colors.text.secondary }}
              >
                Experienced professionals dedicated to your investment success
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="text-center p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: colors.background.white,
                    border: `1px solid ${colors.neutral.light}`,
                  }}
                >
                  <div className="relative mb-6">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-32 h-32 mx-auto rounded-full object-cover shadow-lg"
                    />
                    <div
                      className="absolute inset-0 w-32 h-32 mx-auto rounded-full opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                      }}
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary.main }}>
                    {member.name}
                  </h3>
                  <p className="text-lg font-semibold mb-3" style={{ color: colors.secondary.main }}>
                    {member.role}
                  </p>
                  <p style={{ color: colors.text.secondary }}>{member.experience}</p>
                </motion.div>
              ))}
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
              Ready to Start Your Investment Journey?
            </motion.h2>
            <motion.p variants={cardVariants} className="text-xl mb-8 opacity-90">
              Join thousands of investors who trust Unlisted Axis for their pre-IPO investment needs.
            </motion.p>
            <motion.button
              variants={cardVariants}
              className="inline-flex items-center px-8 py-4 bg-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ color: colors.primary.main }}
            >
              <TrendingUp className="mr-3 h-6 w-6" />
              Get Started Today
            </motion.button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </motion.div>
  )
}

export default AboutUsPage
