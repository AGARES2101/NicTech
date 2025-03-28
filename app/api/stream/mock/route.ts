import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const width = searchParams.get("width") || "640"
    const height = searchParams.get("height") || "480"
    const streamIndex = searchParams.get("streamIndex") || "0"

    // Получаем базовый URL для создания абсолютного URL
    const baseUrl = new URL(request.url).origin

    // Создаем абсолютный URL для перенаправления
    // Для разных потоков используем разные заполнители
    const placeholderUrl = new URL("/placeholder.svg", baseUrl)
    placeholderUrl.searchParams.set("height", height)
    placeholderUrl.searchParams.set("width", width)

    // Для основного и дополнительного потоков разные тексты
    if (streamIndex === "1") {
      placeholderUrl.searchParams.set("text", `Camera ${id || "Mock"} (Secondary)`)
    } else {
      placeholderUrl.searchParams.set("text", `Camera ${id || "Mock"} (Main)`)
    }

    // Возвращаем абсолютный URL для перенаправления
    return NextResponse.redirect(placeholderUrl.toString())
  } catch (error) {
    console.error("Ошибка получения мок-видеопотока:", error)

    // В случае ошибки возвращаем JSON с сообщением об ошибке
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка сервера",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

