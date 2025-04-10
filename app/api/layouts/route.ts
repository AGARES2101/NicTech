import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"

// Интерфейс макета камер
interface CameraLayout {
  id: string
  name: string
  description?: string
  grid: string // "1x1", "2x2", "3x3", "4x4", "custom"
  cameras: string[] // массив ID камер
  isDefault?: boolean
}

// Мок-данные для тестирования
const mockLayouts: CameraLayout[] = [
  {
    id: "layout-1",
    name: "Основной макет",
    description: "Макет для основного мониторинга",
    grid: "2x2",
    cameras: ["camera-1", "camera-2", "camera-3", "camera-4"],
    isDefault: true,
  },
  {
    id: "layout-2",
    name: "Входы",
    description: "Камеры на входах в здание",
    grid: "3x3",
    cameras: ["camera-5", "camera-6", "camera-7", "camera-8", "camera-9"],
    isDefault: false,
  },
]

// GET - получение списка макетов
export async function GET(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.API, "Запрос списка макетов камер (мок-режим)")

      return NextResponse.json({
        success: true,
        layouts: mockLayouts,
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/layouts`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.API, "Ошибка получения списка макетов камер", {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка получения списка макетов: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.API, "Список макетов камер успешно получен")

    return NextResponse.json({
      success: true,
      layouts: result.layouts || [],
    })
  } catch (error) {
    logger.error(LogCategory.API, "Ошибка получения списка макетов камер", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST - создание или обновление макета
export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем данные из тела запроса
    const layout: CameraLayout = await request.json()

    // Проверяем наличие необходимых данных
    if (!layout.name || !layout.grid || !layout.cameras) {
      return NextResponse.json({ success: false, message: "Не указаны обязательные поля макета" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(
        LogCategory.API,
        `${layout.id?.startsWith("new-") ? "Создание" : "Обновление"} макета камер (мок-режим)`,
        { layoutId: layout.id, layoutName: layout.name },
      )

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Генерируем ID для нового макета
      if (layout.id?.startsWith("new-")) {
        layout.id = `layout-${Date.now()}`
      }

      return NextResponse.json({
        success: true,
        layout,
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/layouts`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(layout),
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.API, "Ошибка сохранения макета камер", { status: response.status, error: errorText })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка сохранения макета: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.API, `Макет камер "${layout.name}" успешно сохранен`, {
      layoutId: result.layout?.id || layout.id,
    })

    return NextResponse.json({
      success: true,
      layout: result.layout || layout,
    })
  } catch (error) {
    logger.error(LogCategory.API, "Ошибка сохранения макета камер", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE - удаление макета
export async function DELETE(request: NextRequest) {
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
      logger.info(LogCategory.API, `Удаление макета камер (мок-режим)`, { layoutId })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: "Макет успешно удален",
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/layouts/${layoutId}`

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
      logger.error(LogCategory.API, "Ошибка удаления макета камер", { status: response.status, error: errorText })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка удаления макета: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    logger.info(LogCategory.API, `Макет камер успешно удален`, { layoutId })

    return NextResponse.json({
      success: true,
      message: "Макет успешно удален",
    })
  } catch (error) {
    logger.error(LogCategory.API, "Ошибка удаления макета камер", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
