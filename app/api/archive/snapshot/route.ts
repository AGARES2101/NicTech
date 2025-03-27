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

