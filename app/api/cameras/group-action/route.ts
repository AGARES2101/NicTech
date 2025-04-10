import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем данные из тела запроса
    const { cameraIds, action } = await request.json()

    // Проверяем наличие необходимых данных
    if (!cameraIds || !Array.isArray(cameraIds) || cameraIds.length === 0) {
      return NextResponse.json({ success: false, message: "Не указаны идентификаторы камер" }, { status: 400 })
    }

    if (!action || !["restart", "enable", "disable", "delete"].includes(action)) {
      return NextResponse.json({ success: false, message: "Указано некорректное действие" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.API, `Групповая операция ${action} для ${cameraIds.length} камер (мок-режим)`, {
        cameraIds,
      })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: `Операция ${action} успешно выполнена для ${cameraIds.length} камер`,
        results: cameraIds.map((id) => ({ id, success: true })),
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    let apiEndpoint = ""
    switch (action) {
      case "restart":
        apiEndpoint = "/rsapi/cameras/restart"
        break
      case "enable":
        apiEndpoint = "/rsapi/cameras/enable"
        break
      case "disable":
        apiEndpoint = "/rsapi/cameras/disable"
        break
      case "delete":
        apiEndpoint = "/rsapi/cameras/delete"
        break
    }

    const revisorUrl = `${serverUrl}${apiEndpoint}`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ cameraIds }),
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.API, `Ошибка выполнения групповой операции ${action}`, {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка выполнения операции: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.API, `Групповая операция ${action} успешно выполнена для ${cameraIds.length} камер`, {
      result,
    })

    return NextResponse.json({
      success: true,
      message: `Операция ${action} успешно выполнена для ${cameraIds.length} камер`,
      results: result,
    })
  } catch (error) {
    logger.error(LogCategory.API, "Ошибка выполнения групповой операции с камерами", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
