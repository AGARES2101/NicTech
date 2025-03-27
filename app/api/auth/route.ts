import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serverUrl, username, password } = body

    // Проверка авторизации через API NicTech
    const response = await fetch(`${serverUrl}/rsapi/auth`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
      },
    })

    if (response.ok) {
      return NextResponse.json({
        success: true,
        serverUrl,
        username,
        password,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Неверное имя пользователя или пароль",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Ошибка авторизации:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка подключения к серверу",
      },
      { status: 500 },
    )
  }
}

