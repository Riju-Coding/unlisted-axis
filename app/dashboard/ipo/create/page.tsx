"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ImageUploader } from "@/components/image-uploader"
import dynamic from "next/dynamic"


const QuillEditor = dynamic(() => import("@/components/rich-text-editor"), {
  ssr: false,
});

import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Building2,
  IndianRupee,
  Calendar,
  FileText,
  Users,
  Globe,
  Target,
} from "lucide-react"

const sectors = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Energy",
  "Telecommunications",
  "Automotive",
  "Pharmaceuticals",
  "FMCG",
  "Infrastructure",
  "Textiles",
  "Chemicals",
  "Media & Entertainment",
]

const leadManagers = [
  "ICICI Securities",
  "Kotak Mahindra Capital",
  "Axis Capital",
  "SBI Capital Markets",
  "HDFC Bank",
  "JM Financial",
  "Edelweiss Financial Services",
  "IIFL Securities",
  "Motilal Oswal",
  "YES Securities",
  "BOB Capital Markets",
  "Anand Rathi",
]

const registrars = [
  "KFin Technologies",
  "Link Intime India",
  "Bigshare Services",
  "Skyline Financial Services",
  "Cameo Corporate Services",
  "Alankit Assignments",
  "Maheshwari Datamatics",
  "Beetal Financial",
]

export default function CreateIPOPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    sector: "",
    issueSize: "",
    priceRangeMin: "",
    priceRangeMax: "",
    lotSize: "",
    openDate: "",
    closeDate: "",
    listingDate: "",
    leadManagers: [] as string[],
    registrars: "",
    gmp: "",
    subscription: "",
    status: "upcoming" as "upcoming" | "open" | "closed" | "listed" | "withdrawn",
    category: "mainboard" as "mainboard" | "sme",
    description: "",
    objectives: [] as string[],
    revenueFinancials: "",
    profitFinancials: "",
    netWorthFinancials: "",
    drhpDocument: "",
    rhpDocument: "",
    prospectusDocument: "",
    allotmentDate: "",
    refundDate: "",
    creditDate: "",
    companyWebsite: "",
    active: true,
    featured: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],
    slug: "",
  })

  const [newObjective, setNewObjective] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [newLeadManager, setNewLeadManager] = useState("")

  const generateSlug = (companyName: string) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-generate slug from company name
    if (field === "companyName") {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
        seoTitle: value ? `${value} IPO - Latest Updates, Price, Dates & Review` : "",
      }))
    }
  }

  const addObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }))
      setNewObjective("")
    }
  }

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }))
  }

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData((prev) => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, newKeyword.trim()],
      }))
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((_, i) => i !== index),
    }))
  }

  const addLeadManager = () => {
    if (newLeadManager.trim() && !formData.leadManagers.includes(newLeadManager.trim())) {
      setFormData((prev) => ({
        ...prev,
        leadManagers: [...prev.leadManagers, newLeadManager.trim()],
      }))
      setNewLeadManager("")
    }
  }

  const removeLeadManager = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      leadManagers: prev.leadManagers.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.companyName || !formData.sector || !formData.issueSize) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const ipoData = {
        companyName: formData.companyName,
        companyLogo: formData.companyLogo,
        sector: formData.sector,
        issueSize: Number.parseFloat(formData.issueSize),
        priceRange: {
          min: Number.parseFloat(formData.priceRangeMin),
          max: Number.parseFloat(formData.priceRangeMax),
        },
        lotSize: Number.parseInt(formData.lotSize),
        openDate: formData.openDate,
        closeDate: formData.closeDate,
        listingDate: formData.listingDate,
        leadManagers: formData.leadManagers,
        registrars: formData.registrars,
        gmp: Number.parseFloat(formData.gmp) || 0,
        subscription: Number.parseFloat(formData.subscription) || 0,
        status: formData.status,
        category: formData.category,
        description: formData.description,
        objectives: formData.objectives,
        financials: {
          revenue: Number.parseFloat(formData.revenueFinancials) || 0,
          profit: Number.parseFloat(formData.profitFinancials) || 0,
          netWorth: Number.parseFloat(formData.netWorthFinancials) || 0,
        },
        documents: {
          drhp: formData.drhpDocument,
          rhp: formData.rhpDocument,
          prospectus: formData.prospectusDocument,
        },
        allotmentDate: formData.allotmentDate,
        refundDate: formData.refundDate,
        creditDate: formData.creditDate,
        companyWebsite: formData.companyWebsite,
        active: formData.active,
        featured: formData.featured,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        seoKeywords: formData.seoKeywords,
        slug: formData.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.uid || "",
      }

      await addDoc(collection(db, "ipos"), ipoData)

      toast({
        title: "Success",
        description: "IPO created successfully",
      })

      router.push("/dashboard/ipo")
    } catch (error) {
      console.error("Error creating IPO:", error)
      toast({
        title: "Error",
        description: "Failed to create IPO",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New IPO</h1>
            <p className="text-muted-foreground">
              Add a new IPO listing with comprehensive details and SEO optimization
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter the basic details about the IPO and company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector *</Label>
                <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange("category", value as "mainboard" | "sme")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainboard">Mainboard</SelectItem>
                    <SelectItem value="sme">SME</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="listed">Listed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                type="url"
                value={formData.companyWebsite}
                onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                placeholder="https://company.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <ImageUploader
                onImageSelect={(url) => handleInputChange("companyLogo", url)}
                selectedImage={formData.companyLogo}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <QuillEditor />
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IndianRupee className="mr-2 h-5 w-5" />
              Financial Details
            </CardTitle>
            <CardDescription>Enter the financial information about the IPO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueSize">Issue Size (₹ Crores) *</Label>
                <Input
                  id="issueSize"
                  type="number"
                  value={formData.issueSize}
                  onChange={(e) => handleInputChange("issueSize", e.target.value)}
                  placeholder="1000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRangeMin">Min Price (₹)</Label>
                <Input
                  id="priceRangeMin"
                  type="number"
                  value={formData.priceRangeMin}
                  onChange={(e) => handleInputChange("priceRangeMin", e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceRangeMax">Max Price (₹)</Label>
                <Input
                  id="priceRangeMax"
                  type="number"
                  value={formData.priceRangeMax}
                  onChange={(e) => handleInputChange("priceRangeMax", e.target.value)}
                  placeholder="120"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotSize">Lot Size (Shares)</Label>
                <Input
                  id="lotSize"
                  type="number"
                  value={formData.lotSize}
                  onChange={(e) => handleInputChange("lotSize", e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gmp">Grey Market Premium (₹)</Label>
                <Input
                  id="gmp"
                  type="number"
                  value={formData.gmp}
                  onChange={(e) => handleInputChange("gmp", e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription">Subscription (Times)</Label>
                <Input
                  id="subscription"
                  type="number"
                  step="0.1"
                  value={formData.subscription}
                  onChange={(e) => handleInputChange("subscription", e.target.value)}
                  placeholder="2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenueFinancials">Revenue (₹ Crores)</Label>
                <Input
                  id="revenueFinancials"
                  type="number"
                  value={formData.revenueFinancials}
                  onChange={(e) => handleInputChange("revenueFinancials", e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profitFinancials">Profit (₹ Crores)</Label>
                <Input
                  id="profitFinancials"
                  type="number"
                  value={formData.profitFinancials}
                  onChange={(e) => handleInputChange("profitFinancials", e.target.value)}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="netWorthFinancials">Net Worth (₹ Crores)</Label>
                <Input
                  id="netWorthFinancials"
                  type="number"
                  value={formData.netWorthFinancials}
                  onChange={(e) => handleInputChange("netWorthFinancials", e.target.value)}
                  placeholder="2000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Important Dates
            </CardTitle>
            <CardDescription>Set the timeline for the IPO process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openDate">Open Date</Label>
                <Input
                  id="openDate"
                  type="date"
                  value={formData.openDate}
                  onChange={(e) => handleInputChange("openDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeDate">Close Date</Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={formData.closeDate}
                  onChange={(e) => handleInputChange("closeDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listingDate">Listing Date</Label>
                <Input
                  id="listingDate"
                  type="date"
                  value={formData.listingDate}
                  onChange={(e) => handleInputChange("listingDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allotmentDate">Allotment Date</Label>
                <Input
                  id="allotmentDate"
                  type="date"
                  value={formData.allotmentDate}
                  onChange={(e) => handleInputChange("allotmentDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundDate">Refund Date</Label>
                <Input
                  id="refundDate"
                  type="date"
                  value={formData.refundDate}
                  onChange={(e) => handleInputChange("refundDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditDate">Credit Date</Label>
                <Input
                  id="creditDate"
                  type="date"
                  value={formData.creditDate}
                  onChange={(e) => handleInputChange("creditDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intermediaries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Intermediaries
            </CardTitle>
            <CardDescription>Add lead managers and registrars for the IPO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lead Managers</Label>
              <div className="flex gap-2">
                <Select value={newLeadManager} onValueChange={setNewLeadManager}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select lead manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadManagers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addLeadManager}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.leadManagers.map((manager, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {manager}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeLeadManager(index)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrars">Registrar</Label>
              <Select value={formData.registrars} onValueChange={(value) => handleInputChange("registrars", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select registrar" />
                </SelectTrigger>
                <SelectContent>
                  {registrars.map((registrar) => (
                    <SelectItem key={registrar} value={registrar}>
                      {registrar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Objects of the Issue
            </CardTitle>
            <CardDescription>Add the main objectives for raising funds through this IPO</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                placeholder="Enter objective"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
              />
              <Button type="button" onClick={addObjective}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{objective}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeObjective(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>Add links to important IPO documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drhpDocument">DRHP Document URL</Label>
                <Input
                  id="drhpDocument"
                  type="url"
                  value={formData.drhpDocument}
                  onChange={(e) => handleInputChange("drhpDocument", e.target.value)}
                  placeholder="https://example.com/drhp.pdf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rhpDocument">RHP Document URL</Label>
                <Input
                  id="rhpDocument"
                  type="url"
                  value={formData.rhpDocument}
                  onChange={(e) => handleInputChange("rhpDocument", e.target.value)}
                  placeholder="https://example.com/rhp.pdf"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prospectusDocument">Prospectus URL</Label>
                <Input
                  id="prospectusDocument"
                  type="url"
                  value={formData.prospectusDocument}
                  onChange={(e) => handleInputChange("prospectusDocument", e.target.value)}
                  placeholder="https://example.com/prospectus.pdf"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              SEO Settings
            </CardTitle>
            <CardDescription>Optimize the IPO page for search engines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="company-name-ipo"
              />
              <p className="text-sm text-muted-foreground">URL will be: /ipo/{formData.slug}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                placeholder="Company Name IPO - Latest Updates, Price, Dates & Review"
                maxLength={60}
              />
              <p className="text-sm text-muted-foreground">{formData.seoTitle.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => handleInputChange("seoDescription", e.target.value)}
                placeholder="Get complete details about Company Name IPO including price band, dates, subscription status, grey market premium, and expert review."
                maxLength={160}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">{formData.seoDescription.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label>SEO Keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter keyword"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                />
                <Button type="button" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.seoKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {keyword}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(index)} />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure visibility and featured status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Make this IPO visible to users</p>
              </div>
              <Switch checked={formData.active} onCheckedChange={(checked) => handleInputChange("active", checked)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">Show this IPO in featured section</p>
              </div>
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange("featured", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create IPO
          </Button>
        </div>
      </form>
    </div>
  )
}
