import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { serverUrl, authHeader } = await request.json()

    if (!serverUrl) {
      return NextResponse.json({ success: false, message: "URL сервера не указан" }, { status: 400 })
    }

    // Проверяем соединение с сервером
    try {
      // Пробуем выполнить запрос к API аутентификации
      const response = await fetch(`${serverUrl}/rsapi/auth`, {
        headers: {
          Authorization: authHeader || "",
        },
      })

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: "Соединение с сервером установлено успешно",
          status: response.status,
        })
      } else {
        return NextResponse.json({
          success: false,
          message: `Ошибка соединения с сервером: ${response.status} ${response.statusText}`,
          status: response.status,
        })
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: `Не удалось подключиться к серверу: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Ошибка обработки запроса",
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    })
  }
}

