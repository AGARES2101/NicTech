import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    // Since we don't have actual video files, redirect to a placeholder image
    // This is a more reliable fallback than trying to serve non-existent video files
    const width = 640
    const height = 480

    // Return a placeholder image with camera ID
    return NextResponse.redirect(`/placeholder.svg?height=${height}&width=${width}&text=Camera+${id || "Mock"}`)
  } catch (error) {
    console.error("Ошибка получения мок-видеопотока:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}

