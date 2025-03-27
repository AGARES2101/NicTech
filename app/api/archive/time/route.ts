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

    // Получение текущего времени архива
    const response = await fetch(`${serverUrl}/rsapi/archive/time?sessionid=${sessionId}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка получения времени архива: ${response.statusText}`)
    }

    const currentTime = await response.text()

    return NextResponse.json({ currentTime })
  } catch (error) {
    console.error("Ошибка получения времени архива:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения времени архива",
      },
      { status: 500 },
    )
  }
}

