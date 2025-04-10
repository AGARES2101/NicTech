import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("sessionId")
    const speed = searchParams.get("speed") || "0"
    const viewSize = searchParams.get("viewSize")

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    try {
      // Формирование URL для получения кадра архива
      let snapshotUrl = `${serverUrl}/rsapi/archive/snapshot?sessionid=${sessionId}&speed=${speed}`
      if (viewSize) {
        snapshotUrl += `&viewSize=${viewSize}`
      }

      // Получение кадра архива
      const response = await fetch(snapshotUrl, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения кадра архива: ${response.statusText}`)
      }

      // Получаем изображение как ArrayBuffer
      const imageBuffer = await response.arrayBuffer()

      // Возвращаем изображение с правильным Content-Type
      return new Response(imageBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
        },
      })
    } catch (fetchError) {
      console.error("Ошибка при запросе к серверу NicTech:", fetchError)

      // Возвращаем заглушку изображения для тестирования
      const width = viewSize ? Number.parseInt(viewSize.split("x")[0]) : 1280
      const height = viewSize ? Number.parseInt(viewSize.split("x")[1]) : 720

      // Перенаправляем на placeholder.svg с нужными размерами
      return NextResponse.redirect(`/placeholder.svg?height=${height}&width=${width}`)
    }
  } catch (error) {
    console.error("Ошибка получения кадра архива:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения кадра архива",
      },
      { status: 500 },
    )
  }
}
