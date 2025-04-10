import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const codec = searchParams.get("codec") // Получаем параметр codec из запроса

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !id) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    try {
      // Проверяем доступность HLS потока на сервере
      // Добавляем параметр codec в запрос, если он указан
      const checkUrl = `${serverUrl}/rsapi/hls/available?id=${id}${codec ? `&codec=${codec}` : ""}`
      const checkResponse = await fetch(checkUrl, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(3000),
      })

      if (!checkResponse.ok) {
        throw new Error("HLS поток недоступен")
      }

      // Получаем URL для HLS потока с учетом кодека
      const hlsUrl = `${serverUrl}/rsapi/hls/stream?id=${id}${codec ? `&codec=${codec}` : ""}`

      return NextResponse.json({
        success: true,
        url: hlsUrl,
        codec: codec || "h264", // Возвращаем информацию о используемом кодеке
      })
    } catch (fetchError) {
      console.error("Ошибка при запросе к серверу NicTech:", fetchError)

      // Возвращаем URL для мок-видео
      return NextResponse.json({
        success: true,
        url: `/api/stream/mock?id=${id}`,
        codec: "h264", // Для мок-видео используем h264 по умолчанию
      })
    }
  } catch (error) {
    console.error("Ошибка получения HLS потока:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}
