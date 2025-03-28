import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const viewSize = searchParams.get("viewSize")

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
      // Формирование URL для получения снимка
      let snapshotUrl = `${serverUrl}/rsapi/snapshot?id=${id}`
      if (viewSize) {
        snapshotUrl += `&viewSize=${viewSize}`
      }

      // Получение снимка с сервера NicTech
      const response = await fetch(snapshotUrl, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения снимка: ${response.statusText}`)
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
      // Создаем простое изображение с текстом "NicTech Camera Preview"
      const width = viewSize ? Number.parseInt(viewSize.split("x")[0]) : 640
      const height = viewSize ? Number.parseInt(viewSize.split("x")[1]) : 480

      // Перенаправляем на placeholder.svg с нужными размерами
      return NextResponse.redirect(`/placeholder.svg?height=${height}&width=${width}`)
    }
  } catch (error) {
    console.error("Ошибка получения снимка:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения снимка",
      },
      { status: 500 },
    )
  }
}

