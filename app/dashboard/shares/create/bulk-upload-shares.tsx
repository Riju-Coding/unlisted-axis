"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ExclamationTriangleIcon, CheckCircledIcon, DownloadIcon, UploadIcon } from "@radix-ui/react-icons"
import { toast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

interface BulkShareData {
  logo: string
  sharesName: string
  price: number
  depository: string
  applicable: string
  minimumLotSize: number
  description: string
  website: string
  blogUrl: string
  sector: string
  category: string
  marketCap: number
  weekHigh52: number
  weekLow52: number
  panNumber: string
  isinNumber: string
  cin: string
  rta: string
  peRatio: number
  pbRatio: number
  debtToEquity: number
  roe: number
  bookValue: number
  faceValue: number
  totalShares: number
}

interface ValidationError {
  row: number
  field: string
  value: any
  message: string
}

const BulkUploadShares: React.FC = () => {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [processedData, setProcessedData] = useState<BulkShareData[]>([])

  const downloadTemplate = () => {
    const sampleData = [
      {
        "S.No": 1,
        Logo: "https://example.com/abc-logo.png",
        "Shares Name": "ABC Private Limited",
        "Current Price": 100.5,
        Depository: "NSDL",
        Applicable: "Yes",
        "Minimum Lot Size": 1,
        Description: "Leading technology company specializing in software solutions",
        Website: "https://abc.com",
        "Blog URL": "https://abc.com/blog",
        Sector: "Technology",
        Category: "Mid Cap",
        "Market Cap": 2225.0,
        "52 Week High": 415.0,
        "52 Week Low": 325.0,
        "PAN Number": "AAKCA9053A",
        "ISIN Number": "INE0OTC01025",
        "CIN Number": "U28999KA2012PLC063439",
        RTA: "Bigshare Services",
        "P/E Ratio": 57.02,
        "P/B Ratio": 4.89,
        "Debt to Equity": 2.34,
        ROE: 8.76,
        "Book Value": 66.46,
        "Face Value": 10,
        "Total Shares": 68465270,
      },
      {
        "S.No": 2,
        Logo: "https://example.com/xyz-logo.png",
        "Shares Name": "XYZ Corporation",
        "Current Price": 250.0,
        Depository: "NSDL & CDSL",
        Applicable: "Yes",
        "Minimum Lot Size": 5,
        Description: "Healthcare company focused on pharmaceutical research",
        Website: "https://xyz.com",
        "Blog URL": "",
        Sector: "Healthcare",
        Category: "Large Cap",
        "Market Cap": 5000.0,
        "52 Week High": 300.0,
        "52 Week Low": 200.0,
        "PAN Number": "BBKCA9054B",
        "ISIN Number": "INE0OTC01026",
        "CIN Number": "U24999MH2010PLC063440",
        RTA: "Link Intime India",
        "P/E Ratio": 25.5,
        "P/B Ratio": 3.2,
        "Debt to Equity": 1.5,
        ROE: 15.25,
        "Book Value": 78.12,
        "Face Value": 10,
        "Total Shares": 20000000,
      },
      {
        "S.No": 3,
        Logo: "",
        "Shares Name": "DEF Industries",
        "Current Price": 75.25,
        Depository: "Physical",
        Applicable: "No",
        "Minimum Lot Size": 10,
        Description: "Manufacturing company in automotive sector",
        Website: "",
        "Blog URL": "",
        Sector: "Manufacturing",
        Category: "Small Cap",
        "Market Cap": 750.0,
        "52 Week High": 90.0,
        "52 Week Low": 60.0,
        "PAN Number": "",
        "ISIN Number": "",
        "CIN Number": "",
        RTA: "",
        "P/E Ratio": 12.5,
        "P/B Ratio": 1.8,
        "Debt to Equity": 0.75,
        ROE: 12.0,
        "Book Value": 41.8,
        "Face Value": 10,
        "Total Shares": 10000000,
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shares Template")

    const colWidths = [
      { wch: 8 }, // S.No
      { wch: 35 }, // Logo
      { wch: 25 }, // Shares Name
      { wch: 12 }, // Current Price
      { wch: 12 }, // Depository
      { wch: 12 }, // Applicable
      { wch: 18 }, // Minimum Lot Size
      { wch: 50 }, // Description
      { wch: 25 }, // Website
      { wch: 25 }, // Blog URL
      { wch: 15 }, // Sector
      { wch: 12 }, // Category
      { wch: 15 }, // Market Cap
      { wch: 12 }, // 52 Week High
      { wch: 12 }, // 52 Week Low
      { wch: 12 }, // PAN Number
      { wch: 15 }, // ISIN Number
      { wch: 20 }, // CIN Number
      { wch: 20 }, // RTA
      { wch: 10 }, // P/E Ratio
      { wch: 10 }, // P/B Ratio
      { wch: 15 }, // Debt to Equity
      { wch: 8 }, // ROE
      { wch: 12 }, // Book Value
      { wch: 10 }, // Face Value
      { wch: 15 }, // Total Shares
    ]
    worksheet["!cols"] = colWidths

    XLSX.writeFile(workbook, "shares_bulk_upload_template.xlsx")

    toast({
      title: "Template Downloaded",
      description: "Complete Excel template with all share fields has been downloaded successfully",
    })
  }

  const normalizeDepository = (value: string): string => {
    if (!value) return ""

    const normalized = value.toString().trim().replace(/&amp;/g, "&").replace(/&/g, "&").toUpperCase()

    if (normalized.includes("NSDL") && normalized.includes("CDSL")) {
      return "NSDL & CDSL"
    }
    if (normalized === "NSDL") return "NSDL"
    if (normalized === "CDSL") return "CDSL"
    if (normalized === "PHYSICAL") return "Physical"
    if (normalized.includes("PHYSICAL")) return "Physical"

    return value.toString().trim()
  }

  const isValidDepository = (value: string): boolean => {
    const validValues = ["NSDL", "CDSL", "Physical", "NSDL & CDSL", "CDSL & NSDL"]
    const normalized = normalizeDepository(value)
    return validValues.includes(normalized)
  }

  const validateRow = (data: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!data["Shares Name"] || typeof data["Shares Name"] !== "string" || !data["Shares Name"].toString().trim()) {
      errors.push({
        row: rowIndex,
        field: "Shares Name",
        value: data["Shares Name"],
        message: "Shares Name is required",
      })
    }

    if (!data["Current Price"] || isNaN(Number(data["Current Price"])) || Number(data["Current Price"]) <= 0) {
      errors.push({
        row: rowIndex,
        field: "Current Price",
        value: data["Current Price"],
        message: "Current Price must be a number greater than 0",
      })
    }

    if (!data["Depository"] || !isValidDepository(data["Depository"])) {
      const originalValue = data["Depository"]
      const normalizedValue = normalizeDepository(data["Depository"])
      errors.push({
        row: rowIndex,
        field: "Depository",
        value: data["Depository"],
        message: `Depository must be NSDL, CDSL, Physical, or NSDL & CDSL. Found: "${originalValue}" (normalized: "${normalizedValue}")`,
      })
    }

    if (!data["Minimum Lot Size"] || isNaN(Number(data["Minimum Lot Size"])) || Number(data["Minimum Lot Size"]) <= 0) {
      errors.push({
        row: rowIndex,
        field: "Minimum Lot Size",
        value: data["Minimum Lot Size"],
        message: "Minimum Lot Size must be a number greater than 0",
      })
    }

    if (data["S.No"] && (isNaN(Number(data["S.No"])) || Number(data["S.No"]) <= 0)) {
      errors.push({
        row: rowIndex,
        field: "S.No",
        value: data["S.No"],
        message: "S.No must be a positive number",
      })
    }

    if (data["Logo"] && data["Logo"].trim()) {
      try {
        new URL(data["Logo"])
      } catch {
        errors.push({
          row: rowIndex,
          field: "Logo",
          value: data["Logo"],
          message: "Logo must be a valid URL",
        })
      }
    }

    if (data["Website"] && data["Website"].trim()) {
      try {
        new URL(data["Website"])
      } catch {
        errors.push({
          row: rowIndex,
          field: "Website",
          value: data["Website"],
          message: "Website must be a valid URL",
        })
      }
    }

    if (data["Blog URL"] && data["Blog URL"].trim()) {
      try {
        new URL(data["Blog URL"])
      } catch {
        errors.push({
          row: rowIndex,
          field: "Blog URL",
          value: data["Blog URL"],
          message: "Blog URL must be a valid URL",
        })
      }
    }

    if (
      data["PAN Number"] &&
      data["PAN Number"].trim() &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data["PAN Number"].trim())
    ) {
      errors.push({
        row: rowIndex,
        field: "PAN Number",
        value: data["PAN Number"],
        message: "PAN number must be in format: AAKCA9053A (5 letters, 4 digits, 1 letter)",
      })
    }

    if (
      data["ISIN Number"] &&
      data["ISIN Number"].trim() &&
      !/^[A-Z]{2}[A-Z0-9]{9}[0-9]{1}$/.test(data["ISIN Number"].trim())
    ) {
      errors.push({
        row: rowIndex,
        field: "ISIN Number",
        value: data["ISIN Number"],
        message: "ISIN number must be 12 characters (2 letters + 9 alphanumeric + 1 digit)",
      })
    }

    const numericFields = [
      "Market Cap",
      "52 Week High",
      "52 Week Low",
      "P/E Ratio",
      "P/B Ratio",
      "Debt to Equity",
      "ROE",
      "Book Value",
      "Face Value",
      "Total Shares",
    ]

    numericFields.forEach((field) => {
      if (data[field] && data[field] !== "" && (isNaN(Number(data[field])) || Number(data[field]) < 0)) {
        errors.push({
          row: rowIndex,
          field: field,
          value: data[field],
          message: `${field} must be a valid number greater than or equal to 0`,
        })
      }
    })

    if (data["ROE"] && data["ROE"] !== "" && (Number(data["ROE"]) < 0 || Number(data["ROE"]) > 100)) {
      errors.push({
        row: rowIndex,
        field: "ROE",
        value: data["ROE"],
        message: "ROE must be between 0 and 100",
      })
    }

    return errors
  }

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result

          let jsonData: any[] = []

          if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
          } else {
            const csvText = data as string
            const lines = csvText.split("\n").filter((line) => line.trim())
            const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))

            jsonData = lines.slice(1).map((line) => {
              const values: string[] = []
              let current = ""
              let inQuotes = false

              for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                  inQuotes = !inQuotes
                } else if (char === "," && !inQuotes) {
                  values.push(current.trim())
                  current = ""
                } else {
                  current += char
                }
              }
              values.push(current.trim())

              const row: any = {}
              headers.forEach((header, index) => {
                row[header] = values[index] || ""
              })
              return row
            })
          }

          resolve(jsonData)
        } catch (error) {
          console.error("Parse error:", error)
          reject(
            new Error(
              `Failed to parse ${file.name.endsWith(".xlsx") || file.name.endsWith(".xls") ? "Excel" : "CSV"} file. Please check the format.`,
            ),
          )
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        reader.readAsArrayBuffer(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const uploadShares = async (shares: BulkShareData[]) => {
    if (!user) throw new Error("User not authenticated")

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < shares.length; i++) {
      try {
        setUploadProgress(((i + 1) / shares.length) * 50)

        const shareData = {
          logo: shares[i].logo,
          sharesName: shares[i].sharesName,
          currentPrice: shares[i].price,
          depository: shares[i].depository,
          minimumLotSize: shares[i].minimumLotSize,
          description: shares[i].description,
          website: shares[i].website,
          blogUrl: shares[i].blogUrl,
          sector: shares[i].sector,
          category: shares[i].category,
          marketCap: shares[i].marketCap,
          weekHigh52: shares[i].weekHigh52,
          weekLow52: shares[i].weekLow52,
          panNumber: shares[i].panNumber,
          isinNumber: shares[i].isinNumber,
          cin: shares[i].cin,
          rta: shares[i].rta,
          peRatio: shares[i].peRatio,
          pbRatio: shares[i].pbRatio,
          debtToEquity: shares[i].debtToEquity,
          roe: shares[i].roe,
          bookValue: shares[i].bookValue,
          faceValue: shares[i].faceValue,
          totalShares: shares[i].totalShares,
          applicable: shares[i].applicable,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          status: "active",
        }

        const shareRef = collection(db, "shares")
        const shareDoc = await addDoc(shareRef, shareData)

        const priceData = {
          shareId: shareDoc.id,
          price: shares[i].price,
          timestamp: serverTimestamp(),
          updatedBy: user.uid,
          changeType: "initial",
        }

        await addDoc(collection(db, "sharePrices"), priceData)

        successCount++
        setUploadProgress(50 + ((i + 1) / shares.length) * 50)
      } catch (error) {
        console.error(`Error creating share ${i + 1}:`, error)
        errorCount++
      }
    }

    return { successCount, errorCount }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV (.csv) or Excel (.xlsx, .xls) file",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      setValidationErrors([])
      setSuccessCount(0)
      setErrorCount(0)
      setUploadProgress(0)
    }
  }

  const handleBulkUpload = async () => {
    if (!file || !user) return

    setIsProcessing(true)
    setUploadProgress(0)
    setValidationErrors([])

    try {
      const shares = await processFile(file)
      setProcessedData(shares)

      const result = await uploadShares(shares)
      setSuccessCount(result.successCount)
      setErrorCount(result.errorCount)
      setUploadProgress(100)

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${result.successCount} shares${result.errorCount > 0 ? `, ${result.errorCount} failed` : ""}`,
      })

      setFile(null)
      const fileInput = document.getElementById("bulk-file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error: any) {
      console.error("Bulk upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const processFile = async (file: File) => {
    return new Promise<BulkShareData[]>((resolve, reject) => {
      parseFile(file)
        .then((jsonData) => {
          try {
            if (jsonData.length === 0) {
              reject(new Error("File is empty"))
              return
            }

            if (jsonData.length > 500) {
              reject(new Error("Maximum 500 rows allowed per upload"))
              return
            }

            const processedShares: BulkShareData[] = []
            const allErrors: ValidationError[] = []

            jsonData.forEach((row: any, index) => {
              const rowErrors = validateRow(row, index + 2)
              allErrors.push(...rowErrors)

              if (rowErrors.length === 0) {
                processedShares.push({
                  logo: (row["Logo"] || "").toString().trim(),
                  sharesName: row["Shares Name"].toString().trim(),
                  price: Number(row["Current Price"]),
                  depository: normalizeDepository(row["Depository"]),
                  applicable: (row["Applicable"] || "").toString().trim(),
                  minimumLotSize: Number(row["Minimum Lot Size"]),
                  description: (row["Description"] || "").toString().trim(),
                  website: (row["Website"] || "").toString().trim(),
                  blogUrl: (row["Blog URL"] || "").toString().trim(),
                  sector: (row["Sector"] || "").toString().trim(),
                  category: (row["Category"] || "").toString().trim(),
                  marketCap: Number(row["Market Cap"]) || 0,
                  weekHigh52: Number(row["52 Week High"]) || 0,
                  weekLow52: Number(row["52 Week Low"]) || 0,
                  panNumber: (row["PAN Number"] || "").toString().trim().toUpperCase(),
                  isinNumber: (row["ISIN Number"] || "").toString().trim().toUpperCase(),
                  cin: (row["CIN Number"] || "").toString().trim().toUpperCase(),
                  rta: (row["RTA"] || "").toString().trim(),
                  peRatio: Number(row["P/E Ratio"]) || 0,
                  pbRatio: Number(row["P/B Ratio"]) || 0,
                  debtToEquity: Number(row["Debt to Equity"]) || 0,
                  roe: Number(row["ROE"]) || 0,
                  bookValue: Number(row["Book Value"]) || 0,
                  faceValue: Number(row["Face Value"]) || 10,
                  totalShares: Number(row["Total Shares"]) || 0,
                })
              }
            })

            setValidationErrors(allErrors)

            if (allErrors.length > 0) {
              reject(new Error(`Validation failed. Found ${allErrors.length} error(s)`))
            } else {
              resolve(processedShares)
            }
          } catch (error) {
            reject(new Error("Failed to process file data. Please check the format."))
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Bulk Upload Shares
          </CardTitle>
          <CardDescription>
            Upload multiple shares at once using an Excel file. Download the template first to ensure proper formatting
            with all share fields.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Step 1: Download Complete Template</h3>
              <p className="text-sm text-blue-700">
                Download the Excel template with all share fields matching the create page structure
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="border-blue-200 bg-transparent">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Step 2: Upload Your Excel or CSV File</h3>
              <div className="flex items-center gap-4">
                <input
                  id="bulk-file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isProcessing}
                />
                <Button onClick={handleBulkUpload} disabled={!file || isProcessing} className="min-w-[120px]">
                  {isProcessing ? "Processing..." : "Upload Shares"}
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {(successCount > 0 || errorCount > 0) && !isProcessing && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircledIcon className="h-4 w-4" />
              <AlertTitle>Upload Complete</AlertTitle>
              <AlertDescription>
                Successfully uploaded {successCount} shares
                {errorCount > 0 && `, ${errorCount} failed`}
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Validation Errors ({validationErrors.length})</AlertTitle>
              <AlertDescription>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <div key={index} className="text-xs">
                      <strong>Row {error.row}:</strong> {error.field} - {error.message}
                      {error.value && <span className="text-gray-600"> (Value: "{error.value}")</span>}
                    </div>
                  ))}
                  {validationErrors.length > 10 && (
                    <div className="text-xs text-gray-600">... and {validationErrors.length - 10} more errors</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Complete Excel Structure (Matching Create Page):</strong>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-xs overflow-x-auto">
                S.No | Logo | Shares Name | Current Price | Depository | Applicable | Minimum Lot Size | Description |
                Website | Blog URL | Sector | Category | Market Cap | 52 Week High | 52 Week Low | PAN Number | ISIN
                Number | CIN Number | RTA | P/E Ratio | P/B Ratio | Debt to Equity | ROE | Book Value | Face Value |
                Total Shares
              </div>
            </div>
            <div>
              <strong>Required Fields:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>
                  <strong>Shares Name</strong> - Company or share name (Required)
                </li>
                <li>
                  <strong>Current Price</strong> - Share price in rupees, must be greater than 0 (Required)
                </li>
                <li>
                  <strong>Depository</strong> - Must be NSDL, CDSL, Physical, or NSDL & CDSL (Required)
                </li>
                <li>
                  <strong>Minimum Lot Size</strong> - Number of shares in minimum lot, must be greater than 0 (Required)
                </li>
              </ul>
            </div>
            <div>
              <strong>Optional Fields with Validation:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>
                  <strong>Logo, Website, Blog URL</strong> - Must be valid URLs if provided
                </li>
                <li>
                  <strong>PAN Number</strong> - Format: AAKCA9053A (5 letters + 4 digits + 1 letter)
                </li>
                <li>
                  <strong>ISIN Number</strong> - 12 character alphanumeric code
                </li>
                <li>
                  <strong>ROE</strong> - Percentage between 0 and 100
                </li>
                <li>
                  <strong>All numeric fields</strong> - Market Cap, ratios, prices must be valid numbers ≥ 0
                </li>
                <li>
                  <strong>Sector</strong> - Technology, Healthcare, Finance, Manufacturing, etc.
                </li>
                <li>
                  <strong>Category</strong> - Large Cap, Mid Cap, Small Cap, etc.
                </li>
              </ul>
            </div>
            <div>
              <strong>File Requirements:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Excel format (.xlsx, .xls) or CSV format (.csv)</li>
                <li>Maximum 500 rows per upload</li>
                <li>Use the provided template for best results</li>
                <li>Do not modify column headers - they must match exactly</li>
                <li>Empty optional fields are allowed</li>
                <li>For CSV: Use commas to separate values, quotes for text containing commas</li>
              </ul>
            </div>
            <div>
              <strong>Data Consistency:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>All fields now match the single share creation form</li>
                <li>Bulk upload creates shares with identical structure to manual creation</li>
                <li>Price history is automatically created for each share</li>
                <li>All validation rules match the create page requirements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BulkUploadShares
