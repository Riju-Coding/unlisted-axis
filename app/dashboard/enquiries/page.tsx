"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Mail, Phone, Calendar, Building2, FileText, TrendingUp, Home } from "lucide-react"
import * as XLSX from "xlsx"

interface HomeEnquiry {
  id: string
  name: string
  email: string
  phone: string
  createdAt: any
  source: string
  type: "home"
}

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

interface ContactUsEnquiry {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: any
  source: string
  type: "contact_us"
}

type Enquiry = ShareEnquiry | IPOEnquiry | HomeEnquiry | ContactUsEnquiry

export default function EnquiriesClient() {
  const [shareEnquiries, setShareEnquiries] = useState<ShareEnquiry[]>([])
  const [ipoEnquiries, setIpoEnquiries] = useState<IPOEnquiry[]>([])
  const [homeEnquiries, setHomeEnquiries] = useState<HomeEnquiry[]>([])
  const [contactUsEnquiries, setContactUsEnquiries] = useState<ContactUsEnquiry[]>([])
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

      const homeEnquiriesRef = collection(db, "enquiries")
      console.log("[v0] Created home enquiries collection reference")

      let homeQuerySnapshot
      try {
        const homeQuery = query(
          homeEnquiriesRef,
          where("source", "==", "home page query"),
          orderBy("createdAt", "desc"),
        )
        homeQuerySnapshot = await getDocs(homeQuery)
        console.log("[v0] Home enquiries query with where and orderBy executed successfully")
      } catch (orderError) {
        console.log("[v0] Home enquiries orderBy query failed, trying simple query:", orderError)
        const simpleHomeQuery = query(homeEnquiriesRef, where("source", "==", "home page query"))
        homeQuerySnapshot = await getDocs(simpleHomeQuery)
        console.log("[v0] Home enquiries simple query executed successfully")
      }

      console.log("[v0] Home enquiries found:", homeQuerySnapshot.size)

      const homeEnquiriesData = homeQuerySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          type: "home" as const,
        }
      }) as HomeEnquiry[]

      let contactUsQuerySnapshot
      try {
        const contactUsQuery = query(
          homeEnquiriesRef,
          where("source", "==", "contact_us"),
          orderBy("createdAt", "desc"),
        )
        contactUsQuerySnapshot = await getDocs(contactUsQuery)
        console.log("[v0] Contact Us enquiries query executed successfully")
      } catch (orderError) {
        console.log("[v0] Contact Us enquiries orderBy query failed, trying simple query:", orderError)
        const simpleContactUsQuery = query(homeEnquiriesRef, where("source", "==", "contact_us"))
        contactUsQuerySnapshot = await getDocs(simpleContactUsQuery)
        console.log("[v0] Contact Us enquiries simple query executed successfully")
      }

      console.log("[v0] Contact Us enquiries found:", contactUsQuerySnapshot.size)

      const contactUsEnquiriesData = contactUsQuerySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          type: "contact_us" as const,
        }
      }) as ContactUsEnquiry[]

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

      const shareEnquiriesData = shareQuerySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            timestamp: data.createdAt || data.timestamp,
            type: "share" as const,
          }
        })
        .filter((doc) => !doc.shareId || doc.shareId) as ShareEnquiry[]

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
      const combined = [...homeEnquiriesData, ...contactUsEnquiriesData, ...shareEnquiriesData, ...ipoEnquiriesData]
      combined.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.() ||
          (a as any).timestamp?.toDate?.() ||
          new Date(a.createdAt || (a as any).timestamp || 0)
        const bTime =
          b.createdAt?.toDate?.() ||
          (b as any).timestamp?.toDate?.() ||
          new Date(b.createdAt || (b as any).timestamp || 0)
        return bTime.getTime() - aTime.getTime()
      })

      console.log("[v0] Total enquiries processed:", combined.length)
      console.log("[v0] Home enquiries:", homeEnquiriesData.length)
      console.log("[v0] Contact Us enquiries:", contactUsEnquiriesData.length)
      console.log("[v0] Share enquiries:", shareEnquiriesData.length)
      console.log("[v0] IPO enquiries:", ipoEnquiriesData.length)

      setHomeEnquiries(homeEnquiriesData)
      setContactUsEnquiries(contactUsEnquiriesData)
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
        Date: formatDate(enquiry.createdAt || (enquiry as any).timestamp),
        "Customer Name": enquiry.name,
        Email: enquiry.email,
        Phone: enquiry.phone,
      }

      if (enquiry.type === "home") {
        return {
          ...baseData,
          Type: "Home Page",
        }
      } else if (enquiry.type === "contact_us") {
        return {
          ...baseData,
          Type: "Contact Us",
          Subject: (enquiry as ContactUsEnquiry).subject,
          Message: (enquiry as ContactUsEnquiry).message,
        }
      } else if (enquiry.type === "share") {
        return {
          ...baseData,
          Type: "Share",
          "Share Name": (enquiry as ShareEnquiry).shareName,
          "Share ID": (enquiry as ShareEnquiry).shareId,
          Message: (enquiry as ShareEnquiry).message,
        }
      } else {
        return {
          ...baseData,
          Type: "IPO",
          "IPO Name": (enquiry as IPOEnquiry).ipoName,
          "IPO ID": (enquiry as IPOEnquiry).ipoId,
          Message: (enquiry as IPOEnquiry).message,
        }
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries")

    const colWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Type
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
        const enquiryDate = e.createdAt?.toDate
          ? e.createdAt.toDate()
          : (e as any).timestamp?.toDate
            ? (e as any).timestamp.toDate()
            : new Date(e.createdAt || (e as any).timestamp || 0)
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
            <p className="text-muted-foreground">Manage enquiries from potential investors</p>
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

  const renderHomeEnquiriesTable = (enquiries: HomeEnquiry[]) => (
    <>
      {enquiries.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No home page enquiries yet</h3>
          <p className="text-muted-foreground">Enquiries from the home page banner will appear here.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{formatDate(enquiry.createdAt)}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )

  const renderContactUsEnquiriesTable = (enquiries: ContactUsEnquiry[]) => (
    <>
      {enquiries.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No contact us enquiries yet</h3>
          <p className="text-muted-foreground">Enquiries from the contact us page will appear here.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell className="font-medium">{formatDate(enquiry.createdAt)}</TableCell>
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
                  <TableCell className="max-w-xs">
                    <p className="text-sm font-medium truncate">{enquiry.subject}</p>
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
              {enquiries.map(
                (enquiry) =>
                  enquiry.type !== "home" &&
                  enquiry.type !== "contact_us" && (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-medium">{formatDate((enquiry as any).timestamp)}</TableCell>
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
                            {enquiry.type === "share"
                              ? (enquiry as ShareEnquiry).shareName
                              : (enquiry as IPOEnquiry).ipoName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ID:{" "}
                            {enquiry.type === "share"
                              ? (enquiry as ShareEnquiry).shareId
                              : (enquiry as IPOEnquiry).ipoId}
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
                        <p className="text-sm text-muted-foreground truncate">
                          {enquiry.type === "share"
                            ? (enquiry as ShareEnquiry).message
                            : (enquiry as IPOEnquiry).message}
                        </p>
                      </TableCell>
                    </TableRow>
                  ),
              )}
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
          <p className="text-muted-foreground">Manage enquiries from potential investors</p>
        </div>
        <Button
          onClick={() => {
            if (activeTab === "all") {
              downloadExcel(allEnquiries, "all_enquiries")
            } else if (activeTab === "home") {
              downloadExcel(homeEnquiries, "home_page_enquiries")
            } else if (activeTab === "contact") {
              downloadExcel(contactUsEnquiries, "contact_us_enquiries")
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

      <div className="grid gap-4 md:grid-cols-6">
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
            <CardTitle className="text-sm font-medium">Home Page</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homeEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">Banner enquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Us</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactUsEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">Contact form submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Share Enquiries</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shareEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Set(shareEnquiries.map((e) => e.shareId)).size} unique shares
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPO Enquiries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipoEnquiries.length}</div>
            <p className="text-xs text-muted-foreground">
              {new Set(ipoEnquiries.map((e) => e.ipoId)).size} unique IPOs
            </p>
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
          <CardDescription>Complete list of enquiries received</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({allEnquiries.length})</TabsTrigger>
              <TabsTrigger value="home">Home Page ({homeEnquiries.length})</TabsTrigger>
              <TabsTrigger value="contact">Contact Us ({contactUsEnquiries.length})</TabsTrigger>
              <TabsTrigger value="shares">Shares ({shareEnquiries.length})</TabsTrigger>
              <TabsTrigger value="ipos">IPOs ({ipoEnquiries.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderEnquiriesTable(allEnquiries)}</TabsContent>
            <TabsContent value="home">{renderHomeEnquiriesTable(homeEnquiries)}</TabsContent>
            <TabsContent value="contact">{renderContactUsEnquiriesTable(contactUsEnquiries)}</TabsContent>
            <TabsContent value="shares">{renderEnquiriesTable(shareEnquiries)}</TabsContent>
            <TabsContent value="ipos">{renderEnquiriesTable(ipoEnquiries)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
