"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Link, X, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void
  selectedImage?: string
}

export function ImageUploader({ onImageSelect, selectedImage }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(selectedImage || null)

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      setError("Please enter an image URL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Validate if the URL is a valid image
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        setPreviewUrl(imageUrl)
        onImageSelect(imageUrl)
        setIsLoading(false)
        setError(null)
      }

      img.onerror = () => {
        setError("Invalid image URL or image cannot be loaded")
        setIsLoading(false)
      }

      img.src = imageUrl
    } catch (err) {
      setError("Failed to load image")
      setIsLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setImageUrl("")
    onImageSelect("")
    setError(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleUrlSubmit()
    }
  }

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Add Featured Image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter an image URL to add a featured image to your post
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button onClick={handleUrlSubmit} disabled={isLoading || !imageUrl.trim()}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Featured image preview"
              className="w-full h-48 object-cover rounded-lg border"
              onError={() => {
                setError("Failed to load image")
                setPreviewUrl(null)
              }}
            />
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Featured image selected</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changeImageUrl">Change Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="changeImageUrl"
                type="url"
                placeholder="https://example.com/new-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button onClick={handleUrlSubmit} disabled={isLoading || !imageUrl.trim()}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Link className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
