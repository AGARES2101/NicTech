import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const framerate = searchParams.get("framerate") || "10"
    const viewSize = searchParams.get("viewSize") || ""

    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader) {
      return NextResponse.redirect(`/api/stream/mock?id=${id}&width=640&height=480`)
    }

    // Для MJPEG потока проксируем запрос к серверу Revisor VMS
    try {
      // Формируем URL для запроса к серверу Revisor VMS
      let revisorUrl = `${serverUrl}/rsapi/mjpeg?id=${id}&framerate=${framerate}`
      if (viewSize) {
        revisorUrl += `&viewSize=${viewSize}`
      }

      // Создаем новый запрос к серверу Revisor VMS
      const response = await fetch(revisorUrl, {
        headers: {
          Authorization: authHeader,
        },
      })

      // Если запрос не успешен, возвращаем ошибку
      if (!response.ok) {
        throw new Error(`Ошибка получения MJPEG потока: ${response.statusText}`)
      }

      // Создаем новый Response объект, который будет проксировать данные от сервера Revisor VMS
      return new Response(response.body, {
        headers: {
          "Content-Type": "multipart/x-mixed-replace;boundary=myboundary",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          Pragma: "no-cache",
        },
      })
    } catch (error) {
      console.error("Ошибка при проксировании MJPEG потока:", error)
      // В случае ошибки перенаправляем на мок-поток
      return NextResponse.redirect(`/api/stream/mock?id=${id}&width=640&height=480`)
    }
  } catch (error) {
    console.error("Ошибка получения MJPEG потока:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}
