import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("sessionId")

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

    // Получение статуса экспорта
    const response = await fetch(`${serverUrl}/rsapi/archive/export/status?sessionId=${sessionId}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка получения статуса экспорта: ${response.statusText}`)
    }

    const statusText = await response.text()

    // Парсинг статуса
    const statusMatch = statusText.match(/status=([^;]+)/)
    const percentMatch = statusText.match(/percent=(\d+)/)

    const status = statusMatch ? statusMatch[1] : "Unknown"
    const percent = percentMatch ? Number.parseInt(percentMatch[1]) : 0

    return NextResponse.json({ status, percent })
  } catch (error) {
    console.error("Ошибка получения статуса экспорта:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения статуса экспорта",
      },
      { status: 500 },
    )
  }
}

