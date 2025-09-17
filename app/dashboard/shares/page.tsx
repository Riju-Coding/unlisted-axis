"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, DollarSign, ExternalLink, FileText } from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AdvancedTableFilters, type ColumnFilter, type ActiveFilter } from "@/components/advanced-table-filters"
import { toast } from "@/hooks/use-toast"

interface Share {
  id: string
  logo: string
  sharesName: string
  depository: string
  minimumLotSize: number
  description: string
  status: string
  createdAt: any
  currentPrice?: number
  website?: string
  blogUrl?: string
  category?: string
  sector?: string
  marketCap?: number
  lastUpdated?: any
}

export default function ManageSharesPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [shares, setShares] = useState<Share[]>([])
  const [loadingShares, setLoadingShares] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push(user ? "/dashboard" : "/login")
    }
  }, [loading, user, role, router])

  useEffect(() => {
    if (user && role === "admin") {
      fetchShares()
    }
  }, [user, role])

  const fetchShares = async () => {
    try {
      setLoadingShares(true)

      // Fetch shares
      const sharesQuery = query(collection(db, "shares"), orderBy("createdAt", "desc"))
      const sharesSnapshot = await getDocs(sharesQuery)

      const sharesData = await Promise.all(
        sharesSnapshot.docs.map(async (doc) => {
          const shareData = { id: doc.id, ...doc.data() } as Share

          // Fetch latest price for each share
          try {
            const pricesQuery = query(
              collection(db, "sharePrices"),
              where("shareId", "==", doc.id),
              orderBy("timestamp", "desc"),
              limit(1),
            )
            const pricesSnapshot = await getDocs(pricesQuery)

            if (!pricesSnapshot.empty) {
              shareData.currentPrice = pricesSnapshot.docs[0].data().price
              shareData.lastUpdated = pricesSnapshot.docs[0].data().timestamp
            }
          } catch (error) {
            console.error("Error fetching price for share:", doc.id, error)
          }

          return shareData
        }),
      )

      setShares(sharesData)
    } catch (error) {
      console.error("Error fetching shares:", error)
      toast({
        title: "Error",
        description: "Failed to fetch shares",
        variant: "destructive",
      })
    } finally {
      setLoadingShares(false)
    }
  }

  const toggleShareStatus = async (shareId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await updateDoc(doc(db, "shares", shareId), {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: user.uid,
      })

      // Update local state
      setShares((prev) => prev.map((share) => (share.id === shareId ? { ...share, status: newStatus } : share)))

      toast({
        title: "Success",
        description: `Share ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating share status:", error)
      toast({
        title: "Error",
        description: "Failed to update share status",
        variant: "destructive",
      })
    }
  }

  // Generate filter options dynamically from data
  const filterColumns: ColumnFilter[] = useMemo(() => {
    const depositoryOptions = [...new Set(shares.map((s) => s.depository))].map((dep) => ({
      value: dep,
      label: dep,
      count: shares.filter((s) => s.depository === dep).length,
    }))

    const statusOptions = [...new Set(shares.map((s) => s.status))].map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      count: shares.filter((s) => s.status === status).length,
    }))

    const sectorOptions = [...new Set(shares.map((s) => s.sector).filter(Boolean))].map((sector) => ({
      value: sector!,
      label: sector!,
      count: shares.filter((s) => s.sector === sector).length,
    }))

    return [
      {
        key: "sharesName",
        label: "Share Name",
        type: "text",
        placeholder: "Search by share name...",
      },
      {
        key: "depository",
        label: "Depository",
        type: "select",
        options: depositoryOptions,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: statusOptions,
      },
      {
        key: "sector",
        label: "Sector",
        type: "select",
        options: sectorOptions,
      },
      {
        key: "currentPrice",
        label: "Price Range",
        type: "number",
        placeholder: "Min price...",
      },
      {
        key: "minimumLotSize",
        label: "Lot Size",
        type: "number",
        placeholder: "Min lot size...",
      },
      {
        key: "website",
        label: "Has Website",
        type: "boolean",
      },
      {
        key: "blogUrl",
        label: "Has Blog",
        type: "boolean",
      },
    ]
  }, [shares])

  // Advanced filtering logic
  const filteredShares = useMemo(() => {
    let filtered = shares

    // Apply search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (share) =>
          share.sharesName.toLowerCase().includes(search) ||
          share.depository.toLowerCase().includes(search) ||
          share.description.toLowerCase().includes(search) ||
          share.sector?.toLowerCase().includes(search) ||
          share.status.toLowerCase().includes(search),
      )
    }

    // Apply column filters
    activeFilters.forEach((filter) => {
      switch (filter.column) {
        case "sharesName":
          filtered = filtered.filter((share) => share.sharesName.toLowerCase().includes(filter.value.toLowerCase()))
          break
        case "depository":
          filtered = filtered.filter((share) => share.depository === filter.value)
          break
        case "status":
          filtered = filtered.filter((share) => share.status === filter.value)
          break
        case "sector":
          filtered = filtered.filter((share) => share.sector === filter.value)
          break
        case "currentPrice":
          const minPrice = Number.parseFloat(filter.value)
          filtered = filtered.filter((share) => share.currentPrice && share.currentPrice >= minPrice)
          break
        case "minimumLotSize":
          const minLot = Number.parseInt(filter.value)
          filtered = filtered.filter((share) => share.minimumLotSize >= minLot)
          break
        case "website":
          const hasWebsite = filter.value === "true"
          filtered = filtered.filter((share) => (hasWebsite ? !!share.website : !share.website))
          break
        case "blogUrl":
          const hasBlog = filter.value === "true"
          filtered = filtered.filter((share) => (hasBlog ? !!share.blogUrl : !share.blogUrl))
          break
      }
    })

    return filtered
  }, [shares, searchTerm, activeFilters])

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    )
  }

  if (!user || role !== "admin") {
    return (
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
        <Button onClick={() => signOut(auth)} className="mt-4">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Shares</h2>
          <p className="text-muted-foreground">Manage unlisted share listings and prices</p>
        </div>
        <Link href="/dashboard/shares/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Share
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share Listings</CardTitle>
          <CardDescription>All unlisted shares in the system with advanced filtering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Advanced Filters */}
          <AdvancedTableFilters
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            columns={filterColumns}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            totalResults={shares.length}
            filteredResults={filteredShares.length}
          />

          {/* Table */}
          {loadingShares ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredShares.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {shares.length === 0 ? "No shares found" : "No shares match your filters"}
              </p>
              {(searchTerm || activeFilters.length > 0) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("")
                    setActiveFilters([])
                  }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Share Name</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Depository</TableHead>
                    <TableHead>Min. Lot Size</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShares.map((share, index) => (
                    <TableRow key={share.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {share.logo ? (
                          <img
                            src={share.logo || "/placeholder.svg"}
                            alt={share.sharesName}
                            className="w-8 h-8 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                            {share.sharesName.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/dashboard/shares/${share.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {share.sharesName}
                          </Link>
                          {share.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{share.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {share.currentPrice ? `₹${share.currentPrice.toFixed(2)}` : "N/A"}
                          </span>
                          {share.lastUpdated && (
                            <p className="text-xs text-muted-foreground">
                              Updated: {share.lastUpdated?.toDate?.()?.toLocaleDateString() || "Unknown"}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{share.depository}</Badge>
                      </TableCell>
                      <TableCell>{share.minimumLotSize.toLocaleString()}</TableCell>
                      <TableCell>
                        {share.sector ? (
                          <Badge variant="secondary">{share.sector}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShareStatus(share.id, share.status)}
                          className="p-0"
                        >
                          <Badge variant={share.status === "active" ? "default" : "secondary"}>{share.status}</Badge>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {share.website && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={share.website} target="_blank" rel="noopener noreferrer" title="Visit Website">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          {share.blogUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={share.blogUrl} target="_blank" rel="noopener noreferrer" title="Visit Blog">
                                <FileText className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                          {!share.website && !share.blogUrl && (
                            <span className="text-muted-foreground text-xs">No links</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/shares/${share.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/shares/${share.id}/update-price`}>
                            <Button variant="outline" size="sm">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
