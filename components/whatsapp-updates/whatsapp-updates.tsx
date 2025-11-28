"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MessageCircle, CheckCircle, Users, Clock, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { colors } from "@/lib/colors"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  whatsappOptIn: z.boolean().refine((val) => val === true, {
    message: "Please opt-in to receive WhatsApp updates",
  }),
})

type FormData = z.infer<typeof formSchema>

export default function WhatsAppUpdatesPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mobile: "",
      whatsappOptIn: false,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Form submitted:", data)
    setIsSubmitted(true)
    setIsLoading(false)
  }

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.background.main} 50%, ${colors.secondary.light} 100%)`,
        }}
      >
       
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="rounded-2xl shadow-xl p-8"
              style={{
                backgroundColor: colors.background.main,
                borderColor: colors.primary.light,
                borderWidth: "1px",
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                }}
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text.primary }}>
                Welcome to Our WhatsApp Community! 🎉
              </h1>
              <p className="text-lg mb-6" style={{ color: colors.text.secondary }}>
                You'll receive your first unlisted share price update within the next 24 hours.
              </p>
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.secondary.light} 100%)`,
                }}
              >
                <p className="text-sm font-medium" style={{ color: colors.primary.main }}>
                  📱 Save our number: +91-XXXXX-XXXXX to ensure you receive all updates
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/")}
                className="text-white font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.hover} 0%, ${colors.secondary.hover} 100%)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
                }}
              >
                Explore More Opportunities
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.background.main} 50%, ${colors.secondary.light} 100%)`,
      }}
    >
      

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.secondary.light} 100%)`,
              color: colors.primary.main,
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Free WhatsApp Updates
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: colors.text.primary }}>
            Get Daily{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Unlisted Share Price
            </span>{" "}
            Updates on WhatsApp
          </h1>

          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: colors.text.secondary }}>
            Join 50,000+ investors who receive exclusive unlisted share prices, IPO alerts, and market insights directly
            on WhatsApp - completely free!
          </p>

          {/* Social Proof */}
          
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
                What You'll Receive Daily:
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: <MessageCircle className="w-6 h-6" style={{ color: colors.primary.main }} />,
                    title: "Live Unlisted Share Prices",
                    description: "Real-time pricing updates for 200+ unlisted companies",
                  },
                  {
                    icon: <Clock className="w-6 h-6" style={{ color: colors.primary.main }} />,
                    title: "IPO Launch Alerts",
                    description: "Be the first to know about new IPO announcements and dates",
                  },
                  {
                    icon: <CheckCircle className="w-6 h-6" style={{ color: colors.primary.main }} />,
                    title: "Expert Market Analysis",
                    description: "Daily insights and recommendations from our research team",
                  },
                  {
                    icon: <Shield className="w-6 h-6" style={{ color: colors.primary.main }} />,
                    title: "Exclusive Deal Alerts",
                    description: "Priority access to high-potential investment opportunities",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg shadow-sm"
                    style={{
                      backgroundColor: colors.background.main,
                      borderColor: colors.primary.light,
                      borderWidth: "1px",
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.secondary.light} 100%)`,
                      }}
                    >
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: colors.text.primary }}>
                        {benefit.title}
                      </h3>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            
          </div>

          {/* Form Section */}
          <div
            className="rounded-2xl shadow-xl p-8"
            style={{
              backgroundColor: colors.background.main,
              borderColor: colors.primary.light,
              borderWidth: "1px",
            }}
          >
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                }}
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>
                Start Receiving Updates Today
              </h3>
              <p style={{ color: colors.text.secondary }}>Join thousands of smart investors. It's completely free!</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter 10-digit mobile number" {...field} className="h-12" maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappOptIn"
                  render={({ field }) => (
                    <FormItem
                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4"
                      style={{
                        borderColor: colors.primary.main,
                        borderWidth: "1px",
                        background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.secondary.light} 100%)`,
                      }}
                    >
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          I agree to receive daily unlisted share price updates and market insights on WhatsApp
                        </FormLabel>
                        <p className="text-xs" style={{ color: colors.text.secondary }}>
                          You can unsubscribe anytime by sending "STOP" to our WhatsApp number
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-white font-semibold text-lg"
                  disabled={isLoading}
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                    borderColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.hover} 0%, ${colors.secondary.hover} 100%)`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting Up Your Updates...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Start Receiving Updates
                    </div>
                  )}
                </Button>
              </form>
            </Form>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6" style={{ borderTopColor: colors.neutral.light, borderTopWidth: "1px" }}>
              <div className="flex items-center justify-center gap-4 text-sm" style={{ color: colors.text.secondary }}>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" style={{ color: colors.primary.main }} />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" style={{ color: colors.primary.main }} />
                  <span>No Spam</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" style={{ color: colors.primary.main }} />
                  <span>Free Forever</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: colors.text.primary }}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                question: "Is this service really free?",
                answer: "Yes, absolutely! Our daily WhatsApp updates are completely free with no hidden charges.",
              },
              {
                question: "How often will I receive updates?",
                answer:
                  "You'll receive one comprehensive update every morning with the latest unlisted share prices and market insights.",
              },
              {
                question: "Can I unsubscribe anytime?",
                answer: "Of course! Simply send 'STOP' to our WhatsApp number and you'll be immediately unsubscribed.",
              },
              {
                question: "Is my mobile number safe?",
                answer:
                  "Your privacy is our priority. We never share your number with third parties and use it only for sending updates.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-lg shadow-sm p-6"
                style={{
                  backgroundColor: colors.background.main,
                  borderColor: colors.primary.light,
                  borderWidth: "1px",
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: colors.text.primary }}>
                  {faq.question}
                </h3>
                <p style={{ color: colors.text.secondary }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
