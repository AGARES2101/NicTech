import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"

// PATCH - установка макета по умолчанию
export async function PATCH(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем ID макета из параметров запроса
    const searchParams = request.nextUrl.searchParams
    const layoutId = searchParams.get("id")

    // Проверяем наличие необходимых данных
    if (!layoutId) {
      return NextResponse.json({ success: false, message: "Не указан идентификатор макета" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.API, `Установка макета по умолчанию (мок-режим)`, { layoutId })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: "Макет успешно установлен по умолчанию",
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/layouts/${layoutId}/default`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "PATCH",
      headers: {
        Authorization: authHeader,
      },
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.API, "Ошибка установки макета по умолчанию", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка установки макета по умолчанию: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    logger.info(LogCategory.API, `Макет камер успешно установлен по умолчанию`, { layoutId })

    return NextResponse.json({
      success: true,
      message: "Макет успешно установлен по умолчанию",
    })
  } catch (error) {
    logger.error(LogCategory.API, "Ошибка установки макета по умолчанию", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
