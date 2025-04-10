import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"
import type { NotificationRule } from "@/components/notification-settings"

// Мок-данные для тестирования
const mockRules: NotificationRule[] = [
  {
    id: "rule-1",
    name: "Обнаружение движения",
    eventTypes: ["motion"],
    severity: "medium",
    channels: ["channel-1", "channel-2"],
    enabled: true,
    schedule: {
      allDay: true,
      timeRanges: [{ start: "00:00", end: "23:59" }],
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    },
  },
  {
    id: "rule-2",
    name: "Критические ошибки",
    eventTypes: ["system_error", "camera_offline"],
    severity: "critical",
    channels: ["channel-1"],
    enabled: true,
    schedule: {
      allDay: false,
      timeRanges: [{ start: "09:00", end: "18:00" }],
      weekdays: [1, 2, 3, 4, 5],
    },
  },
]

// GET - получение списка правил оповещений
export async function GET(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.NOTIFICATIONS, "Запрос списка правил оповещений (мок-режим)")

      return NextResponse.json({
        success: true,
        rules: mockRules,
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/rules`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка получения списка правил оповещений", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка получения списка правил: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.NOTIFICATIONS, "Список правил оповещений успешно получен")

    return NextResponse.json({
      success: true,
      rules: result.rules || [],
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка получения списка правил оповещений", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST - создание или обновление правила оповещений
export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем данные из тела запроса
    const rule: NotificationRule = await request.json()

    // Проверяем наличие необходимых данных
    if (!rule.name || !rule.eventTypes || !rule.channels) {
      return NextResponse.json({ success: false, message: "Не указаны обязательные поля правила" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(
        LogCategory.NOTIFICATIONS,
        `${rule.id?.startsWith("new-") ? "Создание" : "Обновление"} правила оповещений (мок-режим)`,
        { ruleId: rule.id, ruleName: rule.name },
      )

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Генерируем ID для нового правила
      if (rule.id?.startsWith("new-")) {
        rule.id = `rule-${Date.now()}`
      }

      return NextResponse.json({
        success: true,
        rule,
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/rules`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(rule),
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка сохранения правила оповещений", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка сохранения правила: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.NOTIFICATIONS, `Правило оповещений "${rule.name}" успешно сохранено`, {
      ruleId: result.rule?.id || rule.id,
    })

    return NextResponse.json({
      success: true,
      rule: result.rule || rule,
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка сохранения правила оповещений", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE - удаление правила оповещений
export async function DELETE(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем ID правила из параметров запроса
    const searchParams = request.nextUrl.searchParams
    const ruleId = searchParams.get("id")

    // Проверяем наличие необходимых данных
    if (!ruleId) {
      return NextResponse.json({ success: false, message: "Не указан идентификатор правила" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.NOTIFICATIONS, `Удаление правила оповещений (мок-режим)`, { ruleId })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: "Правило успешно удалено",
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/rules/${ruleId}`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка удаления правила оповещений", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка удаления правила: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    logger.info(LogCategory.NOTIFICATIONS, `Правило оповещений успешно удалено`, { ruleId })

    return NextResponse.json({
      success: true,
      message: "Правило успешно удалено",
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка удаления правила оповещений", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
