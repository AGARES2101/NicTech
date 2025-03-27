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

