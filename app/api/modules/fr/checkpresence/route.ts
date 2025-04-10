import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют данные авторизации",
        },
        { status: 401 },
      )
    }

    // Получаем данные из тела запроса
    const formData = await request.text()

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/checkpresence`

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка проверки присутствия лица: ${response.statusText}`)
    }

    // Получаем ответ от сервера
    const responseData = await response.text()

    // Возвращаем ответ клиенту
    return new Response(responseData, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Ошибка проверки присутствия лица:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка проверки присутствия лица",
      },
      { status: 500 },
    )
  }
}
