import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"
import type { NotificationChannel } from "@/components/notification-settings"

// Мок-данные для тестирования
const mockChannels: NotificationChannel[] = [
  {
    id: "channel-1",
    type: "email",
    name: "Email оповещения",
    enabled: true,
    config: {
      recipients: "admin@example.com,security@example.com",
      subject: "NicTech Surveillance: Уведомление",
    },
  },
  {
    id: "channel-2",
    type: "telegram",
    name: "Telegram бот",
    enabled: true,
    config: {
      chatId: "-100123456789",
      token: "mock-token-123456",
    },
  },
]

// GET - получение списка каналов оповещений
export async function GET(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.NOTIFICATIONS, "Запрос списка каналов оповещений (мок-режим)")

      return NextResponse.json({
        success: true,
        channels: mockChannels,
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/channels`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка получения списка каналов оповещений", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка получения списка каналов: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.NOTIFICATIONS, "Список каналов оповещений успешно получен")

    return NextResponse.json({
      success: true,
      channels: result.channels || [],
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка получения списка каналов оповещений", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST - создание или обновление канала оповещений
export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем данные из тела запроса
    const channel: NotificationChannel = await request.json()

    // Проверяем наличие необходимых данных
    if (!channel.name || !channel.type) {
      return NextResponse.json({ success: false, message: "Не указаны обязательные поля канала" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(
        LogCategory.NOTIFICATIONS,
        `${channel.id?.startsWith("new-") ? "Создание" : "Обновление"} канала оповещений (мок-режим)`,
        { channelId: channel.id, channelName: channel.name },
      )

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Генерируем ID для нового канала
      if (channel.id?.startsWith("new-")) {
        channel.id = `channel-${Date.now()}`
      }

      return NextResponse.json({
        success: true,
        channel,
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/channels`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(channel),
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка сохранения канала оповещений", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка сохранения канала: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.NOTIFICATIONS, `Канал оповещений "${channel.name}" успешно сохранен`, {
      channelId: result.channel?.id || channel.id,
    })

    return NextResponse.json({
      success: true,
      channel: result.channel || channel,
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка сохранения канала оповещений", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE - удаление канала оповещений
export async function DELETE(request: NextRequest) {
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
      logger.info(LogCategory.NOTIFICATIONS, `Удаление канала оповещений (мок-режим)`, { channelId })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: "Канал успешно удален",
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/notifications/channels/${channelId}`

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
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка удаления канала оповещений", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка удаления канала: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    logger.info(LogCategory.NOTIFICATIONS, `Канал оповещений успешно удален`, { channelId })

    return NextResponse.json({
      success: true,
      message: "Канал успешно удален",
    })
  } catch (error) {
    logger.error(LogCategory.NOTIFICATIONS, "Ошибка удаления канала оповещений", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
