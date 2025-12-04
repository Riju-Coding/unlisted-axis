"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, FileText, ExternalLink, Star, Clock } from "lucide-react"
import { format } from "date-fns"
import { colors } from "@/lib/colors"

type IPO = {
  id: string
  companyLogo?: string
  companyName?: string
  sector?: string
  category?: string
  status?: string
  priceRange?: { min?: number; max?: number }
  issueSize?: number
  lotSize?: number
  gmp?: number
  subscription?: number
  openDate?: string
  closeDate?: string
  listingDate?: string
  allotmentDate?: string
  refundDate?: string
  creditDate?: string
  companyWebsite?: string
  description?: string
  leadManagers?: string[]
  registrars?: string
  objectives?: string[]
  financials?: {
    revenue?: number
    profit?: number
    netWorth?: number
  }
  documents?: {
    drhp?: string
    rhp?: string
    prospectus?: string
  }
  featured?: boolean
  active?: boolean
  slug?: string
}

export default function IpoPreviewPageClient() {
  const params = useParams() as { id?: string }
  const id = params?.id
  const router = useRouter()
  const [ipo, setIpo] = useState<IPO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError("No IPO id provided in URL.")
      setLoading(false)
      return
    }

    const fetchIpo = async () => {
      try {
        setLoading(true)
        const docRef = doc(db, "ipos", id)
        const snap = await getDoc(docRef)
        if (!snap.exists()) {
          setError("IPO not found.")
          setIpo(null)
        } else {
          setIpo({ id: snap.id, ...(snap.data() as object) } as IPO)
        }
      } catch (err) {
        console.error("Error fetching IPO:", err)
        setError("Failed to load IPO.")
      } finally {
        setLoading(false)
      }
    }

    fetchIpo()
  }, [id])

  // Basic sanitizer: remove <script> tags, on* attributes and javascript: hrefs
  const sanitizeHtml = (unsafeHtml?: string) => {
    if (!unsafeHtml) return ""

    // remove script/style tags and their content
    let cleaned = unsafeHtml.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    cleaned = cleaned.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")

    // remove on* attributes like onclick="..."
    cleaned = cleaned.replace(/\son\w+="[^"]*"/gi, "")
    cleaned = cleaned.replace(/\son\w+='[^']*'/gi, "")

    // remove javascript: in href/src
    cleaned = cleaned.replace(/(href|src)\s*=\s*"(javascript:[^"]*)"/gi, '$1="#"')
    cleaned = cleaned.replace(/(href|src)\s*=\s*'(javascript:[^']*)'/gi, "$1='#'")

    return cleaned
  }

  const formatDateSafe = (d?: string) => {
    if (!d) return "—"
    try {
      return format(new Date(d), "MMM dd, yyyy")
    } catch {
      return d
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: `${colors.primary.main} transparent transparent transparent` }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">Error</h3>
            <p className="text-sm text-red-600 mt-2">{error}</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!ipo) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">IPO not found</h3>
            <div className="mt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {ipo.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ipo.companyLogo} alt={ipo.companyName} className="w-full h-full object-cover" />
            ) : (
              <div className="text-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {ipo.companyName?.charAt(0) ?? "?"}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{ipo.companyName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">{ipo.sector}</span>
              {ipo.category && <Badge variant="outline">{ipo.category.toUpperCase()}</Badge>}
              {ipo.featured && <Badge style={{ backgroundColor: colors.accent.light, color: colors.accent.main }}>Featured</Badge>}
              {!ipo.active && <Badge style={{ backgroundColor: colors.neutral.light }}>Inactive</Badge>}
            </div>
            {ipo.companyWebsite && (
              <div className="mt-2">
                <a href={ipo.companyWebsite} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm" style={{ color: colors.primary.main }}>
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button onClick={() => router.push(`/dashboard/ipo/${ipo.id}/edit`)}>Edit</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Key info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price Range</p>
                  <p className="font-semibold">₹{ipo.priceRange?.min ?? "—"} - ₹{ipo.priceRange?.max ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issue Size</p>
                  <p className="font-semibold">₹{ipo.issueSize ?? "—"} Cr</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                  <p className="font-semibold">{ipo.lotSize ?? "—"} shares</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <p className="font-semibold">{ipo.subscription ?? "—"}x</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GMP</p>
                  <p className="font-semibold">₹{ipo.gmp ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registrars</p>
                  <p className="font-semibold">{ipo.registrars ?? "TBA"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground"><Calendar className="w-3 h-3 inline-block mr-2" /> Open Date</p>
                  <p className="font-medium">{formatDateSafe(ipo.openDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground"><Clock className="w-3 h-3 inline-block mr-2" /> Close Date</p>
                  <p className="font-medium">{formatDateSafe(ipo.closeDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground"><TrendingUp className="w-3 h-3 inline-block mr-2" /> Listing Date</p>
                  <p className="font-medium">{formatDateSafe(ipo.listingDate)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Allotment Date</p>
                  <p className="font-medium">{formatDateSafe(ipo.allotmentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Refund Date</p>
                  <p className="font-medium">{formatDateSafe(ipo.refundDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credit Date</p>
                  <p className="font-medium">{formatDateSafe(ipo.creditDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {ipo.description && (
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  // sanitized HTML
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(ipo.description) }}
                />
              </CardContent>
            </Card>
          )}

          {ipo.objectives && ipo.objectives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Objects of the Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {ipo.objectives.map((o, idx) => (
                    <li key={idx} className="text-sm">{o}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {ipo.financials && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-semibold">₹{ipo.financials.revenue ?? "—"} Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit</p>
                    <p className="font-semibold">₹{ipo.financials.profit ?? "—"} Cr</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Worth</p>
                    <p className="font-semibold">₹{ipo.financials.netWorth ?? "—"} Cr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Side panel */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-2">
                    <Badge style={{ backgroundColor: ipo.status === "open" ? colors.success.light : colors.primary.light, color: ipo.status === "open" ? colors.success.dark : colors.primary.dark }}>
                      {ipo.status?.toUpperCase() ?? "—"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mt-3">Subscription</p>
                  <p className="font-semibold">{ipo.subscription ?? "—"}x</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mt-3">GMP</p>
                  <p className="font-semibold">₹{ipo.gmp ?? "—"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mt-3">Lead Managers</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ipo.leadManagers?.length ? ipo.leadManagers.map((lm, i) => <Badge key={i} variant="outline">{lm}</Badge>) : <span className="text-sm text-muted-foreground">TBA</span>}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mt-3">Documents</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {ipo.documents?.drhp && (
                      <a className="inline-flex items-center gap-2 text-sm" href={ipo.documents.drhp} target="_blank" rel="noreferrer">
                        <FileText className="w-4 h-4" /> DRHP
                      </a>
                    )}
                    {ipo.documents?.rhp && (
                      <a className="inline-flex items-center gap-2 text-sm" href={ipo.documents.rhp} target="_blank" rel="noreferrer">
                        <FileText className="w-4 h-4" /> RHP
                      </a>
                    )}
                    {ipo.documents?.prospectus && (
                      <a className="inline-flex items-center gap-2 text-sm" href={ipo.documents.prospectus} target="_blank" rel="noreferrer">
                        <FileText className="w-4 h-4" /> Prospectus
                      </a>
                    )}
                    {!ipo.documents?.drhp && !ipo.documents?.rhp && !ipo.documents?.prospectus && <span className="text-sm text-muted-foreground">No documents</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
