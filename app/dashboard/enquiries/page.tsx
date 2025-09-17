"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, Phone, Calendar, Building2, FileText } from "lucide-react"
import * as XLSX from "xlsx"

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  shareId: string
  shareName: string
  timestamp: any
}

export default function EnquiriesClient() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      console.log("[v0] Starting fetchEnquiries function")
      console.log("[v0] Firebase db object:", db)

      const enquiriesRef = collection(db, "enquiries")
      console.log("[v0] Created collection reference:", enquiriesRef)

      let querySnapshot
      try {
        const q = query(enquiriesRef, orderBy("createdAt", "desc"))
        console.log("[v0] Trying query with orderBy createdAt desc:", q)
        querySnapshot = await getDocs(q)
        console.log("[v0] Query with orderBy executed successfully")
      } catch (orderError) {
        console.log("[v0] OrderBy query failed, trying simple query:", orderError)
        // Fallback to simple query without orderBy if index is missing
        querySnapshot = await getDocs(enquiriesRef)
        console.log("[v0] Simple query executed successfully")
      }

      console.log("[v0] Query executed successfully. Snapshot:", querySnapshot)
      console.log("[v0] Number of documents found:", querySnapshot.size)
      console.log("[v0] Query empty?", querySnapshot.empty)

      const enquiriesData = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        console.log("[v0] Document ID:", doc.id, "Data:", data)
        return {
          id: doc.id,
          ...data,
          timestamp: data.createdAt || data.timestamp,
        }
      }) as Enquiry[]

      enquiriesData.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp || 0)
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp || 0)
        return bTime.getTime() - aTime.getTime()
      })

      console.log("[v0] Final enquiries data:", enquiriesData)
      console.log("[v0] Total enquiries processed:", enquiriesData.length)

      setEnquiries(enquiriesData)
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

  const downloadExcel = () => {
    const excelData = enquiries.map((enquiry) => ({
      Date: formatDate(enquiry.timestamp),
      "Share Name": enquiry.shareName,
      "Customer Name": enquiry.name,
      Email: enquiry.email,
      Phone: enquiry.phone,
      Message: enquiry.message,
      "Share ID": enquiry.shareId,
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries")

    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 20 }, // Share Name
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 40 }, // Message
      { wch: 15 }, // Share ID
    ]
    worksheet["!cols"] = colWidths

    XLSX.writeFile(workbook, `enquiries_${new Date().toISOString().split("T")[0]}.xlsx`)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
            <p className="text-muted-foreground">Manage share enquiries from potential investors</p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground">Manage share enquiries from potential investors</p>
        </div>
        <Button onClick={downloadExcel} className="gap-2">
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Shares</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(enquiries.map((e) => e.shareId)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                enquiries.filter((e) => {
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enquiries</CardTitle>
          <CardDescription>Complete list of enquiries received for shares</CardDescription>
        </CardHeader>
        <CardContent>
          {enquiries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No enquiries yet</h3>
              <p className="text-muted-foreground">
                Enquiries will appear here when users submit them from share detail pages.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Share</TableHead>
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
                        <div className="flex flex-col">
                          <span className="font-medium">{enquiry.shareName}</span>
                          <span className="text-sm text-muted-foreground">ID: {enquiry.shareId}</span>
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
        </CardContent>
      </Card>
    </div>
  )
}
