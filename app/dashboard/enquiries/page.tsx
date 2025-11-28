"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Mail, Phone, Calendar, Building2, FileText, TrendingUp } from "lucide-react"
import * as XLSX from "xlsx"

interface ShareEnquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  shareId: string
  shareName: string
  timestamp: any
  type: "share"
}

interface IPOEnquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  ipoId: string
  ipoName: string
  timestamp: any
  type: "ipo"
}

type Enquiry = ShareEnquiry | IPOEnquiry

export default function EnquiriesClient() {
  const [shareEnquiries, setShareEnquiries] = useState<ShareEnquiry[]>([])
  const [ipoEnquiries, setIpoEnquiries] = useState<IPOEnquiry[]>([])
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      console.log("[v0] Starting fetchEnquiries function")
      console.log("[v0] Firebase db object:", db)

      // Fetch Share Enquiries
      const shareEnquiriesRef = collection(db, "enquiries")
      console.log("[v0] Created share enquiries collection reference")

      let shareQuerySnapshot
      try {
        const shareQuery = query(shareEnquiriesRef, orderBy("createdAt", "desc"))
        shareQuerySnapshot = await getDocs(shareQuery)
        console.log("[v0] Share enquiries query with orderBy executed successfully")
      } catch (orderError) {
        console.log("[v0] Share enquiries orderBy query failed, trying simple query:", orderError)
        shareQuerySnapshot = await getDocs(shareEnquiriesRef)
        console.log("[v0] Share enquiries simple query executed successfully")
      }

      console.log("[v0] Share enquiries found:", shareQuerySnapshot.size)

      const shareEnquiriesData = shareQuerySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.createdAt || data.timestamp,
          type: "share" as const,
        }
      }) as ShareEnquiry[]

      // Fetch IPO Enquiries
      const ipoEnquiriesRef = collection(db, "ipo-enquiries")
      console.log("[v0] Created IPO enquiries collection reference")

      let ipoQuerySnapshot
      try {
        const ipoQuery = query(ipoEnquiriesRef, orderBy("createdAt", "desc"))
        ipoQuerySnapshot = await getDocs(ipoQuery)
        console.log("[v0] IPO enquiries query with orderBy executed successfully")
      } catch (orderError) {
        console.log("[v0] IPO enquiries orderBy query failed, trying simple query:", orderError)
        ipoQuerySnapshot = await getDocs(ipoEnquiriesRef)
        console.log("[v0] IPO enquiries simple query executed successfully")
      }

      console.log("[v0] IPO enquiries found:", ipoQuerySnapshot.size)

      const ipoEnquiriesData = ipoQuerySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.createdAt || data.timestamp,
          type: "ipo" as const,
        }
      }) as IPOEnquiry[]

      // Combine and sort all enquiries
      const combined = [...shareEnquiriesData, ...ipoEnquiriesData]
      combined.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0)
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0)
        return bTime.getTime() - aTime.getTime()
      })

      console.log("[v0] Total enquiries processed:", combined.length)
      console.log("[v0] Share enquiries:", shareEnquiriesData.length)
      console.log("[v0] IPO enquiries:", ipoEnquiriesData.length)

      setShareEnquiries(shareEnquiriesData)
      setIpoEnquiries(ipoEnquiriesData)
      setAllEnquiries(combined)
    } catch (error) {
      console.error("[v0] Error fetching enquiries:", error)
      console.error("[v0] Error details:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      })

      if (error?.code === "failed-precondition") {
        console.error("[v0] This error usually means a Firestore index is required")
        console.error("[v0] Check the Firebase console for index creation links")
      }
    } finally {
      console.log("[v0] Setting loading to false")
      setLoading(false)
    }
  }

  const downloadExcel = (enquiriesToDownload: Enquiry[], filename: string) => {
    const excelData = enquiriesToDownload.map((enquiry) => {
      const baseData = {
        Date: formatDate(enquiry.timestamp),
        Type: enquiry.type === "share" ? "Share" : "IPO",
        "Customer Name": enquiry.name,
        Email: enquiry.email,
        Phone: enquiry.phone,
        Message: enquiry.message,
      }

      if (enquiry.type === "share") {
        return {
          ...baseData,
          "Share Name": enquiry.shareName,
          "Share ID": enquiry.shareId,
        }
      } else {
        return {
          ...baseData,
          "IPO Name": enquiry.ipoName,
          "IPO ID": enquiry.ipoId,
        }
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries")

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 40 }, // Message
      { wch: 20 }, // Share/IPO Name
      { wch: 15 }, // Share/IPO ID
    ]
    worksheet["!cols"] = colWidths

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("[v0] Error formatting date:", error, timestamp)
      return "Invalid Date"
    }
  }

  const getThisMonthCount = (enquiries: Enquiry[]) => {
    return enquiries.filter((e) => {
      try {
        const enquiryDate = e.timestamp?.toDate ? e.timestamp.toDate() : new Date(e.timestamp || 0)
        const now = new Date()
        return enquiryDate.getMonth() === now.getMonth() && enquiryDate.getFullYear() === now.getFullYear()
      } catch (error) {
        console.error("[v0] Error filtering monthly enquiries:", error)
        return false
      }
    }).length
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
            <p className="text-muted-foreground">Manage share and IPO enquiries from potential investors</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderEnquiriesTable = (enquiries: Enquiry[]) => (
    <>
      {enquiries.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No enquiries yet</h3>
          <p className="text-muted-foreground">
            Enquiries will appear here when users submit them from share or IPO detail pages.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Share/IPO</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{formatDate(enquiry.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant={enquiry.type === "share" ? "default" : "secondary"}>
                      {enquiry.type === "share" ? (
                        <>
                          <Building2 className="h-3 w-3 mr-1" />
                          Share
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          IPO
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {enquiry.type === "share" ? enquiry.shareName : enquiry.ipoName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ID: {enquiry.type === "share" ? enquiry.shareId : enquiry.ipoId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{enquiry.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          {enquiry.email}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      {enquiry.phone}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">{enquiry.message}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground">Manage share and IPO enquiries from potential investors</p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "all") {
              downloadExcel(allEnquiries, "all_enquiries")
            } else if (activeTab === "shares") {
              downloadExcel(shareEnquiries, "share_enquiries")
            } else {
              downloadExcel(ipoEnquiries, "ipo_enquiries")
            }
          }}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Share Enquiries</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shareEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">{new Set(shareEnquiries.map((e) => e.shareId)).size} unique shares</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPO Enquiries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipoEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">{new Set(ipoEnquiries.map((e) => e.ipoId)).size} unique IPOs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getThisMonthCount(allEnquiries)}</div>
            <p className="text-xs text-muted-foreground">Combined total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enquiries</CardTitle>
          <CardDescription>Complete list of enquiries received for shares and IPOs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({allEnquiries.length})
              </TabsTrigger>
              <TabsTrigger value="shares">
                Shares ({shareEnquiries.length})
              </TabsTrigger>
              <TabsTrigger value="ipos">
                IPOs ({ipoEnquiries.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {renderEnquiriesTable(allEnquiries)}
            </TabsContent>
            <TabsContent value="shares">
              {renderEnquiriesTable(shareEnquiries)}
            </TabsContent>
            <TabsContent value="ipos">
              {renderEnquiriesTable(ipoEnquiries)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}