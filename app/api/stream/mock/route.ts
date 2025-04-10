import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const streamIndex = searchParams.get("streamIndex") || "0"

    // Вместо перенаправления на SVG, возвращаем статический видеофайл
    // Используем разные видеофайлы для основного и дополнительного потоков
    const videoNumber = (Number.parseInt(id?.slice(-1) || "1", 10) % 3) + 1
    const videoPath =
      streamIndex === "1" ? `/videos/mock-stream-${videoNumber}.mp4` : `/videos/mock-stream-${videoNumber}.mp4`

    logger.debug(LogCategory.VIDEO, `Запрос мок-видео: ${videoPath} для камеры ${id} (поток ${streamIndex})`)

    // Перенаправляем на статический видеофайл
    const baseUrl = new URL(request.url).origin
    const videoUrl = new URL(videoPath, baseUrl)

    return NextResponse.redirect(videoUrl.toString(), { status: 307 })
  } catch (error) {
    logger.error(LogCategory.VIDEO, "Ошибка получения мок-видеопотока:", error)

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
