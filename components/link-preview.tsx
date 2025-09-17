"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, AlertCircle, Check, ImageIcon, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkPreviewData {
  title?: string
  description?: string
  image?: string
  favicon?: string
  url: string
  valid: boolean
}

interface LinkPreviewProps {
  url: string
  onUrlChange: (url: string) => void
  onImageChange?: (imageUrl: string) => void
  selectedImage?: string
  label?: string
  placeholder?: string
  className?: string
}

const defaultImages = [
  "https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Company+Logo",
  "https://via.placeholder.com/400x200/10B981/FFFFFF?text=Business",
  "https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Enterprise",
  "https://via.placeholder.com/400x200/F59E0B/FFFFFF?text=Startup",
  "https://via.placeholder.com/400x200/EF4444/FFFFFF?text=Innovation",
]

export function LinkPreview({
  url,
  onUrlChange,
  onImageChange,
  selectedImage,
  label = "URL",
  placeholder = "https://example.com",
  className,
}: LinkPreviewProps) {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [showDefaultOptions, setShowDefaultOptions] = useState(false)

  useEffect(() => {
    if (url && isValidUrl(url)) {
      fetchPreview(url)
    } else {
      setPreviewData(null)
      setError(null)
    }
  }, [url])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const fetchPreview = async (targetUrl: string) => {
    setLoading(true)
    setError(null)
    setImageError(false)

    try {
      const response = await fetch("/api/link-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: targetUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch preview")
      }

      const data = await response.json()
      setPreviewData(data)

      // Test the image URL if it exists
      if (data.image) {
        testImageUrl(data.image)
      }
    } catch (err) {
      setError("Failed to load preview. Please check the URL.")
      setPreviewData({ url: targetUrl, valid: false })
    } finally {
      setLoading(false)
    }
  }

  const testImageUrl = (imageUrl: string) => {
    const img = new Image()
    img.onload = () => {
      setImageError(false)
      if (onImageChange && !selectedImage) {
        onImageChange(imageUrl)
      }
    }
    img.onerror = () => {
      setImageError(true)
      setShowDefaultOptions(true)
    }
    img.src = imageUrl
  }

  const handleDefaultImageSelect = (defaultImageUrl: string) => {
    if (onImageChange) {
      onImageChange(defaultImageUrl)
    }
    setShowDefaultOptions(false)
    setImageError(false)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor={`url-${label}`}>{label}</Label>
        <Input
          id={`url-${label}`}
          type="url"
          placeholder={placeholder}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          className={cn(error && "border-red-500", previewData?.valid && "border-green-500")}
        />
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {loading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <Skeleton className="h-16 w-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {previewData && !loading && (
        <Card
          className={cn(
            "transition-colors",
            previewData.valid ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {previewData.image && !imageError ? (
                  <img
                    src={previewData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="h-16 w-16 rounded object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : previewData.favicon ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100">
                    <img
                      src={previewData.favicon || "/placeholder.svg"}
                      alt="Favicon"
                      className="h-8 w-8"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                    <Globe className="h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100">
                    <Globe className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {previewData.valid ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(previewData.url, "_blank")}
                    className="h-6 px-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                {previewData.title && <h4 className="font-medium text-sm truncate mb-1">{previewData.title}</h4>}

                {previewData.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{previewData.description}</p>
                )}

                <p className="text-xs text-muted-foreground mt-1 truncate">{previewData.url}</p>
              </div>
            </div>

            {imageError && onImageChange && (
              <Alert className="mt-4 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  The image from this link couldn't be loaded. Would you like to choose a default image?
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDefaultOptions(!showDefaultOptions)}
                    className="ml-2 h-6"
                  >
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Choose Default
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {showDefaultOptions && (
              <div className="mt-4 space-y-3">
                <Label className="text-sm font-medium">Choose a default image:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {defaultImages.map((defaultImg, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleDefaultImageSelect(defaultImg)}
                      className="h-auto p-2 flex flex-col items-center space-y-1"
                    >
                      <img
                        src={defaultImg || "/placeholder.svg"}
                        alt={`Default ${index + 1}`}
                        className="h-12 w-full rounded object-cover"
                      />
                      <span className="text-xs">Option {index + 1}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
