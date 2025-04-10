import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const framerate = searchParams.get("framerate") || "10"
    const streamIndex = searchParams.get("streamIndex") || "0"

    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader) {
      return NextResponse.redirect(`/api/stream/mock?id=${id}&width=640&height=480`)
    }

    // Для потока в формате камеры проксируем запрос к серверу Revisor VMS
    try {
      // Формируем URL для запроса к серверу Revisor VMS
      const revisorUrl = `${serverUrl}/rsapi/stream?id=${id}&framerate=${framerate}&streamIndex=${streamIndex}`

      // Создаем новый запрос к серверу Revisor VMS
      const response = await fetch(revisorUrl, {
        headers: {
          Authorization: authHeader,
        },
      })

      // Если запрос не успешен, возвращаем ошибку
      if (!response.ok) {
        throw new Error(`Ошибка получения видеопотока: ${response.statusText}`)
      }

      // Создаем новый Response объект, который будет проксировать данные от сервера Revisor VMS
      return new Response(response.body, {
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "video/mp4",
          "Transfer-Encoding": "chunked",
        },
      })
    } catch (error) {
      console.error("Ошибка при проксировании видеопотока:", error)
      // В случае ошибки перенаправляем на мок-поток
      return NextResponse.redirect(`/api/stream/mock?id=${id}&width=640&height=480`)
    }
  } catch (error) {
    console.error("Ошибка получения видеопотока:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}
