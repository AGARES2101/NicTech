import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const time = searchParams.get("time")
    const direction = searchParams.get("direction") || "Forward"

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !id || !time) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    // Инициализация сессии архива
    const response = await fetch(`${serverUrl}/rsapi/archive/start?id=${id}&time=${time}&direction=${direction}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка инициализации архива: ${response.statusText}`)
    }

    const text = await response.text()
    const sessionId = text.replace("sessionid=", "").trim()

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("Ошибка инициализации архива:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка инициализации архива",
      },
      { status: 500 },
    )
  }
}

