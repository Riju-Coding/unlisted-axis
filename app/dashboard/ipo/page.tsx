"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Building2,
  IndianRupee,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"

interface IPO {
  id: string
  companyName: string
  companyLogo: string
  sector: string
  issueSize: number
  priceRange: {
    min: number
    max: number
  }
  lotSize: number
  openDate: string
  closeDate: string
  listingDate: string
  leadManagers: string[]
  registrars: string
  gmp: number // Grey Market Premium
  subscription: number
  status: "upcoming" | "open" | "closed" | "listed" | "withdrawn"
  category: "mainboard" | "sme"
  description: string
  objectives: string[]
  financials: {
    revenue: number
    profit: number
    netWorth: number
  }
  documents: {
    drhp: string
    rhp: string
    prospectus: string
  }
  allotmentDate: string
  refundDate: string
  creditDate: string
  active: boolean
  featured: boolean
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  slug: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export default function IPOManagementPage() {
  const [ipos, setIpos] = useState<IPO[]>([])
  const [filteredIpos, setFilteredIpos] = useState<IPO[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sectorFilter, setSectorFilter] = useState<string>("all")
  const router = useRouter()
  const { toast } = useToast()

  const statusColors = {
    upcoming: "bg-blue-100 text-blue-800",
    open: "bg-green-100 text-green-800",
    closed: "bg-yellow-100 text-yellow-800",
    listed: "bg-purple-100 text-purple-800",
    withdrawn: "bg-red-100 text-red-800",
  }

  const statusIcons = {
    upcoming: Clock,
    open: CheckCircle,
    closed: AlertCircle,
    listed: TrendingUp,
    withdrawn: XCircle,
  }

  useEffect(() => {
    fetchIpos()
  }, [])

  useEffect(() => {
    filterIpos()
  }, [ipos, searchTerm, statusFilter, categoryFilter, sectorFilter])

  const fetchIpos = async () => {
    try {
      const iposQuery = query(collection(db, "ipos"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(iposQuery)
      const iposData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IPO[]
      setIpos(iposData)
    } catch (error) {
      console.error("Error fetching IPOs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch IPOs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterIpos = () => {
    let filtered = ipos

    if (searchTerm) {
      filtered = filtered.filter(
        (ipo) =>
          ipo.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ipo.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ipo.leadManagers.some((manager) => manager.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ipo) => ipo.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((ipo) => ipo.category === categoryFilter)
    }

    if (sectorFilter !== "all") {
      filtered = filtered.filter((ipo) => ipo.sector === sectorFilter)
    }

    setFilteredIpos(filtered)
  }

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, "ipos", id), {
        active: !currentActive,
        updatedAt: new Date().toISOString(),
      })

      setIpos((prev) => prev.map((ipo) => (ipo.id === id ? { ...ipo, active: !currentActive } : ipo)))

      toast({
        title: "Success",
        description: `IPO ${!currentActive ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating IPO:", error)
      toast({
        title: "Error",
        description: "Failed to update IPO status",
        variant: "destructive",
      })
    }
  }

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await updateDoc(doc(db, "ipos", id), {
        featured: !currentFeatured,
        updatedAt: new Date().toISOString(),
      })

      setIpos((prev) => prev.map((ipo) => (ipo.id === id ? { ...ipo, featured: !currentFeatured } : ipo)))

      toast({
        title: "Success",
        description: `IPO ${!currentFeatured ? "featured" : "unfeatured"} successfully`,
      })
    } catch (error) {
      console.error("Error updating IPO:", error)
      toast({
        title: "Error",
        description: "Failed to update IPO featured status",
        variant: "destructive",
      })
    }
  }

  const deleteIPO = async (id: string) => {
    if (!confirm("Are you sure you want to delete this IPO? This action cannot be undone.")) {
      return
    }

    try {
      await deleteDoc(doc(db, "ipos", id))
      setIpos((prev) => prev.filter((ipo) => ipo.id !== id))
      toast({
        title: "Success",
        description: "IPO deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting IPO:", error)
      toast({
        title: "Error",
        description: "Failed to delete IPO",
        variant: "destructive",
      })
    }
  }

  const getUniqueValues = (key: keyof IPO) => {
    return [...new Set(ipos.map((ipo) => ipo[key] as string))].filter(Boolean)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IPO Management</h1>
          <p className="text-muted-foreground">
            Manage upcoming IPOs, track subscriptions, and monitor market performance
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/ipo/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New IPO
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total IPOs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open IPOs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipos.filter((ipo) => ipo.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming IPOs</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipos.filter((ipo) => ipo.status === "upcoming").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured IPOs</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipos.filter((ipo) => ipo.featured).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IPOs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="listed">Listed</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="mainboard">Mainboard</SelectItem>
                <SelectItem value="sme">SME</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {getUniqueValues("sector").map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* IPO List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredIpos.map((ipo) => {
          const StatusIcon = statusIcons[ipo.status]
          return (
            <Card key={ipo.id} className={`${!ipo.active ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={ipo.companyLogo || "/placeholder.svg"}
                      alt={`${ipo.companyName} logo`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <CardTitle className="text-xl">{ipo.companyName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4" />
                        {ipo.sector}
                        <Badge variant="outline" className="ml-2">
                          {ipo.category.toUpperCase()}
                        </Badge>
                        {ipo.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[ipo.status]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {ipo.status.charAt(0).toUpperCase() + ipo.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Issue Size</p>
                      <p className="font-semibold">₹{ipo.issueSize} Cr</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price Range</p>
                      <p className="font-semibold">
                        ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Open Date</p>
                      <p className="font-semibold">{format(new Date(ipo.openDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lot Size</p>
                      <p className="font-semibold">{ipo.lotSize} shares</p>
                    </div>
                  </div>
                </div>

                {ipo.gmp > 0 && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Grey Market Premium:</strong> ₹{ipo.gmp} (
                      {((ipo.gmp / ipo.priceRange.max) * 100).toFixed(1)}%)
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Active:</span>
                      <Switch checked={ipo.active} onCheckedChange={() => toggleActive(ipo.id, ipo.active)} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Featured:</span>
                      <Switch checked={ipo.featured} onCheckedChange={() => toggleFeatured(ipo.id, ipo.featured)} />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/ipo/${ipo.id}/preview`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/ipo/${ipo.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteIPO(ipo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredIpos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No IPOs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all" || sectorFilter !== "all"
                ? "No IPOs match your current filters."
                : "Get started by creating your first IPO listing."}
            </p>
            <Button onClick={() => router.push("/dashboard/ipo/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Add New IPO
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
