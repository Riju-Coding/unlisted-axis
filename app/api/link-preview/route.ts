import { type NextRequest, NextResponse } from "next/server"

interface LinkPreviewData {
  title?: string
  description?: string
  image?: string
  favicon?: string
  url: string
  valid: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({
        url,
        valid: false,
        title: "Invalid URL",
        description: "The provided URL is not valid",
      })
    }

    // Fetch the webpage
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(validUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json({
          url,
          valid: false,
          title: `Error ${response.status}`,
          description: `Failed to fetch content: ${response.statusText}`,
        })
      }

      const html = await response.text()
      const previewData = extractMetadata(html, validUrl)

      return NextResponse.json({
        ...previewData,
        url,
        valid: true,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({
          url,
          valid: false,
          title: "Request Timeout",
          description: "The request took too long to complete",
        })
      }

      return NextResponse.json({
        url,
        valid: false,
        title: "Connection Error",
        description: "Unable to connect to the website",
      })
    }
  } catch (error) {
    console.error("Link preview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function extractMetadata(html: string, baseUrl: URL): Partial<LinkPreviewData> {
  const metadata: Partial<LinkPreviewData> = {}

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    metadata.title = titleMatch[1].trim()
  }

  // Extract Open Graph title (preferred)
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  if (ogTitleMatch) {
    metadata.title = ogTitleMatch[1].trim()
  }

  // Extract description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  if (descMatch) {
    metadata.description = descMatch[1].trim()
  }

  // Extract Open Graph description (preferred)
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  if (ogDescMatch) {
    metadata.description = ogDescMatch[1].trim()
  }

  // Extract Open Graph image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
  if (ogImageMatch) {
    const imageUrl = ogImageMatch[1].trim()
    metadata.image = resolveUrl(imageUrl, baseUrl)
  }

  // Extract favicon
  const faviconMatch = html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i)
  if (faviconMatch) {
    const faviconUrl = faviconMatch[1].trim()
    metadata.favicon = resolveUrl(faviconUrl, baseUrl)
  } else {
    // Default favicon location
    metadata.favicon = `${baseUrl.protocol}//${baseUrl.host}/favicon.ico`
  }

  return metadata
}

function resolveUrl(url: string, baseUrl: URL): string {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    if (url.startsWith("//")) {
      return `${baseUrl.protocol}${url}`
    }
    if (url.startsWith("/")) {
      return `${baseUrl.protocol}//${baseUrl.host}${url}`
    }
    return `${baseUrl.protocol}//${baseUrl.host}/${url}`
  } catch {
    return url
  }
}
