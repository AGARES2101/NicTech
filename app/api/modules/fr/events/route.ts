import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "plain"

    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют данные авторизации",
        },
        { status: 401 },
      )
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/events?format=${format}`

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка получения событий распознавания лиц: ${response.statusText}`)
    }

    // Определяем тип контента в зависимости от формата
    const contentType = format === "json" ? "application/json" : "text/plain"

    // Создаем новый Response объект, который будет проксировать данные от сервера Revisor VMS
    return new Response(response.body, {
      headers: {
        "Content-Type": `multipart/x-mixed-replace;boundary=--myboundary`,
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        Pragma: "no-cache",
      },
    })
  } catch (error) {
    console.error("Ошибка получения событий распознавания лиц:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения событий распознавания лиц",
      },
      { status: 500 },
    )
  }
}
