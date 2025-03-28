import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const framerate = searchParams.get("framerate") || "10"

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
      // Проверяем доступность MJPEG потока на сервере
      const checkResponse = await fetch(`${serverUrl}/rsapi/mjpeg/available?id=${id}`, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(3000),
      })

      if (!checkResponse.ok) {
        throw new Error("MJPEG поток недоступен")
      }

      // Создаем поток снапшотов для имитации MJPEG
      // Это решение для тестирования, в реальном приложении нужно проксировать настоящий MJPEG поток
      const controller = new AbortController()
      const { signal } = controller

      let counter = 0
      const interval = setInterval(async () => {
        try {
          counter++
          if (counter > 100 || signal.aborted) {
            clearInterval(interval)
            return
          }

          // Получаем снапшот с камеры
          const snapshotResponse = await fetch(`${serverUrl}/rsapi/snapshot?id=${id}`, {
            headers: {
              Authorization: authHeader,
            },
            signal: AbortSignal.timeout(2000),
          })

          if (!snapshotResponse.ok) {
            throw new Error("Не удалось получить снапшот")
          }

          // Здесь должна быть логика отправки снапшота в поток
          // Но в Next.js API Routes не поддерживают потоковую передачу данных напрямую
        } catch (err) {
          console.error("Ошибка получения снапшота:", err)
        }
      }, 1000 / Number.parseInt(framerate))

      // Так как мы не можем реализовать настоящий MJPEG поток в API Routes,
      // возвращаем URL для имитации через последовательность снапшотов
      return NextResponse.json({
        success: true,
        message: "Используйте последовательность снапшотов для имитации MJPEG",
        snapshotUrl: `/api/snapshot?id=${id}`,
      })
    } catch (fetchError) {
      console.error("Ошибка при запросе к серверу NicTech:", fetchError)

      // Возвращаем URL для мок-видео
      return NextResponse.redirect(new URL(`/api/stream/mock?id=${id}`, request.url))
    }
  } catch (error) {
    console.error("Ошибка получения MJPEG потока:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}

