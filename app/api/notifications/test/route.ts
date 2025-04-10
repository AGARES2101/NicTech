import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"

// POST - отправка тестового оповещения
export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем ID канала из параметров запроса
    const searchParams = request.nextUrl.searchParams
    const channelId = searchParams.get("id")

    // Проверяем наличие необходимых данных
    if (!channelId) {
      return NextResponse.json({ success: false, message: "Не указан идентификатор канала" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.NOTIFICATIONS, `Отправка тестового оповещения (мок-режим)`, { channelId })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return NextResponse.json({
        success: true,
        message: "Тестовое оповещение успешно отправлено",
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/channels/${channelId}/test`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка отправки тестового оповещения", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка отправки тестового оповещения: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    logger.info(LogCategory.NOTIFICATIONS, `Тестовое оповещение успешно отправлено`, { channelId })

    return NextResponse.json({
      success: true,
      message: "Тестовое оповещение успешно отправлено",
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка отправки тестового оповещения", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
