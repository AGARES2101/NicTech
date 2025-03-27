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

    // Закрытие сессии архива
    const response = await fetch(`${serverUrl}/rsapi/archive/stop?sessionid=${sessionId}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка закрытия сессии архива: ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка закрытия сессии архива:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка закрытия сессии архива",
      },
      { status: 500 },
    )
  }
}

