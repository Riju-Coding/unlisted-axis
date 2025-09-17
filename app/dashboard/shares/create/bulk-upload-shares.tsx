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
import * as XLSX from 'xlsx'

interface BulkShareData {
  logo: string
  sharesName: string
  price: number
  depository: string
  applicable: string
  minimumLotSize: number
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

  // Generate and download sample Excel template
  const downloadTemplate = () => {
    const sampleData = [
      {
        "S.No": 1,
        "Logo": "https://example.com/abc-logo.png",
        "Shares Name": "ABC Private Limited",
        "Price": 100.50,
        "Depository": "NSDL",
        "Applicable": "Yes",
        "Minimum Lot Size": 1
      },
      {
        "S.No": 2,
        "Logo": "https://example.com/xyz-logo.png", 
        "Shares Name": "XYZ Corporation",
        "Price": 250.00,
        "Depository": "NSDL & CDSL",
        "Applicable": "Yes",
        "Minimum Lot Size": 5
      },
      {
        "S.No": 3,
        "Logo": "",
        "Shares Name": "DEF Industries",
        "Price": 75.25,
        "Depository": "Physical",
        "Applicable": "No",
        "Minimum Lot Size": 10
      }
    ]

    // Create Excel workbook
    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shares Template")

    // Auto-fit columns
    const colWidths = [
      { wch: 8 },   // S.No
      { wch: 35 },  // Logo
      { wch: 25 },  // Shares Name
      { wch: 12 },  // Price
      { wch: 12 },  // Depository
      { wch: 12 },  // Applicable
      { wch: 18 }   // Minimum Lot Size
    ]
    worksheet['!cols'] = colWidths

    // Generate and download Excel file
    XLSX.writeFile(workbook, 'shares_bulk_upload_template.xlsx')
    
    toast({
      title: "Template Downloaded",
      description: "Sample Excel template has been downloaded successfully",
    })
  }

  // Helper function to normalize depository values
  const normalizeDepository = (value: string): string => {
    if (!value) return ""
    
    // Convert HTML entities and normalize the string
    const normalized = value
      .toString()
      .trim()
      .replace(/&amp;/g, "&")
      .replace(/&/g, "&")
      .toUpperCase()
    
    // Handle common variations
    if (normalized.includes("NSDL") && normalized.includes("CDSL")) {
      return "NSDL & CDSL"
    }
    if (normalized === "NSDL") return "NSDL"
    if (normalized === "CDSL") return "CDSL"
    if (normalized === "PHYSICAL") return "Physical"
    if (normalized.includes("PHYSICAL")) return "Physical"
    
    return value.toString().trim() // Return original if no match
  }

  // Check if depository value is valid
  const isValidDepository = (value: string): boolean => {
    const validValues = ["NSDL", "CDSL", "Physical", "NSDL & CDSL", "CDSL & NSDL"]
    const normalized = normalizeDepository(value)
    return validValues.includes(normalized)
  }

  // Validate individual row data
  const validateRow = (data: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = []

    // Required field validations
    if (!data["Shares Name"] || typeof data["Shares Name"] !== "string" || !data["Shares Name"].toString().trim()) {
      errors.push({
        row: rowIndex,
        field: "Shares Name",
        value: data["Shares Name"],
        message: "Shares Name is required"
      })
    }

    if (!data["Price"] || isNaN(Number(data["Price"])) || Number(data["Price"]) <= 0) {
      errors.push({
        row: rowIndex,
        field: "Price",
        value: data["Price"],
        message: "Price must be a number greater than 0"
      })
    }

    if (!data["Depository"] || !isValidDepository(data["Depository"])) {
      const originalValue = data["Depository"]
      const normalizedValue = normalizeDepository(data["Depository"])
      errors.push({
        row: rowIndex,
        field: "Depository",
        value: data["Depository"],
        message: `Depository must be NSDL, CDSL, Physical, or NSDL & CDSL. Found: "${originalValue}" (normalized: "${normalizedValue}")`
      })
    }

    if (!data["Minimum Lot Size"] || isNaN(Number(data["Minimum Lot Size"])) || Number(data["Minimum Lot Size"]) <= 0) {
      errors.push({
        row: rowIndex,
        field: "Minimum Lot Size",
        value: data["Minimum Lot Size"],
        message: "Minimum Lot Size must be a number greater than 0"
      })
    }

    // Optional validations
    if (data["S.No"] && (isNaN(Number(data["S.No"])) || Number(data["S.No"]) <= 0)) {
      errors.push({
        row: rowIndex,
        field: "S.No",
        value: data["S.No"],
        message: "S.No must be a positive number"
      })
    }

    // Validate URL format for Logo if provided
    if (data["Logo"] && data["Logo"].trim()) {
      try {
        new URL(data["Logo"])
      } catch {
        errors.push({
          row: rowIndex,
          field: "Logo",
          value: data["Logo"],
          message: "Logo must be a valid URL"
        })
      }
    }

    return errors
  }

  // Parse Excel or CSV file
  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result

          let jsonData: any[] = []

          if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Parse Excel file
            const workbook = XLSX.read(data, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" })
          } else {
            // Parse CSV file
            const csvText = data as string
            const lines = csvText.split('\n').filter(line => line.trim())
            const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
            
            jsonData = lines.slice(1).map(line => {
              const values: string[] = []
              let current = ''
              let inQuotes = false
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i]
                if (char === '"') {
                  inQuotes = !inQuotes
                } else if (char === ',' && !inQuotes) {
                  values.push(current.trim())
                  current = ''
                } else {
                  current += char
                }
              }
              values.push(current.trim())
              
              const row: any = {}
              headers.forEach((header, index) => {
                row[header] = values[index] || ''
              })
              return row
            })
          }

          resolve(jsonData)
        } catch (error) {
          console.error('Parse error:', error)
          reject(new Error(`Failed to parse ${file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'Excel' : 'CSV'} file. Please check the format.`))
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))

      // Read file based on type
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  // Process uploaded file
  const processFile = async (file: File) => {
    return new Promise<BulkShareData[]>((resolve, reject) => {
      parseFile(file).then(jsonData => {
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
            const rowErrors = validateRow(row, index + 2) // +2 because rows start from 1 and we have header
            allErrors.push(...rowErrors)

            if (rowErrors.length === 0) {
              processedShares.push({
                logo: (row["Logo"] || "").toString().trim(),
                sharesName: row["Shares Name"].toString().trim(),
                price: Number(row["Price"]),
                depository: normalizeDepository(row["Depository"]),
                applicable: (row["Applicable"] || "").toString().trim(),
                minimumLotSize: Number(row["Minimum Lot Size"]),
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
      }).catch(error => {
        reject(error)
      })
    })
  }

  // Upload shares to Firebase
  const uploadShares = async (shares: BulkShareData[]) => {
    if (!user) throw new Error("User not authenticated")

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < shares.length; i++) {
      try {
        setUploadProgress(((i + 1) / shares.length) * 50) // First 50% for share creation
        
        const shareData = {
          logo: shares[i].logo,
          sharesName: shares[i].sharesName,
          depository: shares[i].depository,
          minimumLotSize: shares[i].minimumLotSize,
          description: "", // Empty as per your structure
          website: "", // Empty as per your structure
          blogUrl: "", // Empty as per your structure
          sector: "", // Empty as per your structure
          category: "", // Empty as per your structure
          marketCap: 0, // Empty as per your structure
          applicable: shares[i].applicable,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          status: "active",
        }

        const shareRef = collection(db, "shares")
        const shareDoc = await addDoc(shareRef, shareData)
        
        // Create initial price record
        const priceData = {
          shareId: shareDoc.id,
          price: shares[i].price,
          timestamp: serverTimestamp(),
          updatedBy: user.uid,
          changeType: "initial",
        }

        await addDoc(collection(db, "sharePrices"), priceData)
        
        successCount++
        setUploadProgress(50 + ((i + 1) / shares.length) * 50) // Next 50% for completion
      } catch (error) {
        console.error(`Error creating share ${i + 1}:`, error)
        errorCount++
      }
    }

    return { successCount, errorCount }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV (.csv) or Excel (.xlsx, .xls) file",
          variant: "destructive"
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

  // Handle bulk upload process
  const handleBulkUpload = async () => {
    if (!file || !user) return

    setIsProcessing(true)
    setUploadProgress(0)
    setValidationErrors([])

    try {
      // Process and validate file
      const shares = await processFile(file)
      setProcessedData(shares)

      // Upload to Firebase
      const result = await uploadShares(shares)
      setSuccessCount(result.successCount)
      setErrorCount(result.errorCount)
      setUploadProgress(100)

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${result.successCount} shares${result.errorCount > 0 ? `, ${result.errorCount} failed` : ""}`,
      })

      // Reset file input
      setFile(null)
      const fileInput = document.getElementById('bulk-file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ""

    } catch (error: any) {
      console.error("Bulk upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
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
            Upload multiple shares at once using a CSV file. Download the template first to ensure proper formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Step 1: Download Template</h3>
              <p className="text-sm text-blue-700">
                Download the CSV template with your existing Excel structure
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="border-blue-200">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
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
                <Button 
                  onClick={handleBulkUpload}
                  disabled={!file || isProcessing}
                  className="min-w-[120px]"
                >
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

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Results */}
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

          {/* Validation Errors */}
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
                    <div className="text-xs text-gray-600">
                      ... and {validationErrors.length - 10} more errors
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Excel Structure (Your Format):</strong>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-xs">
                S.No | Logo | Shares Name | Price | Depository | Applicable | Minimum Lot Size
              </div>
            </div>
            <div>
              <strong>Required Fields:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li><strong>Shares Name</strong> - Company or share name (Required)</li>
                <li><strong>Price</strong> - Share price in rupees, must be greater than 0 (Required)</li>
                <li><strong>Depository</strong> - Must be NSDL, CDSL, Physical, or NSDL & CDSL (Required)</li>
                <li><strong>Minimum Lot Size</strong> - Number of shares in minimum lot, must be greater than 0 (Required)</li>
              </ul>
            </div>
            <div>
              <strong>Optional Fields:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li><strong>S.No</strong> - Serial number (for your reference)</li>
                <li><strong>Logo</strong> - Company logo URL (must be a valid URL if provided)</li>
                <li><strong>Applicable</strong> - Any applicable notes (Yes/No or custom text)</li>
              </ul>
            </div>
            <div>
              <strong>File Requirements:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>Excel format (.xlsx, .xls) or CSV format (.csv)</li>
                <li>Maximum 500 rows per upload</li>
                <li>Use the provided template for best results</li>
                <li>Do not modify column headers</li>
                <li>For CSV: Use commas to separate values, quotes for text containing commas</li>
              </ul>
            </div>
            <div>
              <strong>Using Your Existing Excel:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>You can directly upload your existing .xlsx Excel file</li>
                <li>Or save your Excel as CSV and upload the .csv file</li>
                <li>Make sure your column headers match exactly: S.No, Logo, Shares Name, Price, Depository, Applicable, Minimum Lot Size</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BulkUploadShares