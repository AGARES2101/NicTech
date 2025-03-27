import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !id || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    // Инициализация экспорта архива
    const response = await fetch(
      `${serverUrl}/rsapi/archive/export/start?id=${id}&startTime=${startTime}&endTime=${endTime}`,
      {
        headers: {
          Authorization: authHeader,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Ошибка инициализации экспорта: ${response.statusText}`)
    }

    const text = await response.text()
    const sessionId = text.replace("sessionId=", "").trim()

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("Ошибка инициализации экспорта:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка инициализации экспорта",
      },
      { status: 500 },
    )
  }
}

