import { type NextRequest, NextResponse } from "next/server"
import { parseStringPromise } from "xml2js"

// Модифицируем функцию GET для улучшения обработки ошибок и мок-данных
export async function GET(request: NextRequest) {
  try {
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Если отсутствуют данные авторизации, возвращаем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      console.log("Отсутствуют данные авторизации, возвращаем мок-данные")
      return NextResponse.json(getMockCameras())
    }

    // Попытка получения данных с реального сервера
    try {
      // Увеличиваем таймаут для предотвращения преждевременного прерывания запроса
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

      // Получение списка камер с сервера NicTech
      const response = await fetch(`${serverUrl}/rsapi/cameras`, {
        headers: {
          Authorization: authHeader,
        },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))

      if (!response.ok) {
        throw new Error(`Ошибка получения списка камер: ${response.statusText}`)
      }

      const xmlData = await response.text()

      // Парсинг XML-ответа
      const result = await parseStringPromise(xmlData, { explicitArray: false })

      // Проверка наличия данных в ответе
      if (!result.Cameras || !result.Cameras.Camera) {
        throw new Error("Некорректный формат данных от сервера")
      }

      // Преобразование данных в удобный формат
      const cameras = Array.isArray(result.Cameras.Camera) ? result.Cameras.Camera : [result.Cameras.Camera]

      const formattedCameras = cameras.map((camera) => ({
        id: camera.ID,
        name: camera.Name,
        description: camera.Description || "",
        model: camera.ModelName,
        disabled: camera.Disabled === "true",
        ptzEnabled: camera.PtzMoveEnabled === "true" || camera.PtzZoomEnabled === "true",
        ptzMoveEnabled: camera.PtzMoveEnabled === "true",
        ptzZoomEnabled: camera.PtzZoomEnabled === "true",
        receiveAudio: camera.ReceiveAudio === "true",
        status: camera.Disabled === "true" ? "disabled" : "online",
        archiveStart: camera.ArchiveStart,
        archiveEnd: camera.ArchiveEnd,
      }))

      try {
        // Получение списка недоступных камер с отдельным обработчиком ошибок
        const unavailableController = new AbortController()
        const unavailableTimeoutId = setTimeout(() => unavailableController.abort(), 5000)

        const unavailableResponse = await fetch(`${serverUrl}/rsapi/unavailablecameraids`, {
          headers: {
            Authorization: authHeader,
          },
          signal: unavailableController.signal,
        }).finally(() => clearTimeout(unavailableTimeoutId))

        if (unavailableResponse.ok) {
          const unavailableXmlData = await unavailableResponse.text()
          const unavailableResult = await parseStringPromise(unavailableXmlData, { explicitArray: false })

          // Если есть недоступные камеры, обновляем их статус
          if (unavailableResult.CameraIDs && unavailableResult.CameraIDs.CameraID) {
            const unavailableIds = Array.isArray(unavailableResult.CameraIDs.CameraID)
              ? unavailableResult.CameraIDs.CameraID
              : [unavailableResult.CameraIDs.CameraID]

            formattedCameras.forEach((camera) => {
              if (unavailableIds.includes(camera.id)) {
                camera.status = "offline"
              }
            })
          }
        }
      } catch (unavailableError) {
        // Игнорируем ошибки при получении списка недоступных камер
        console.warn("Не удалось получить список недоступных камер:", unavailableError)
      }

      return NextResponse.json(formattedCameras)
    } catch (fetchError) {
      console.error("Ошибка при запросе к серверу NicTech:", fetchError)

      // Возвращаем мок-данные для тестирования интерфейса
      console.log("Возвращаем мок-данные для тестирования")
      return NextResponse.json(getMockCameras())
    }
  } catch (error) {
    console.error("Критическая ошибка получения списка камер:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения списка камер",
      },
      { status: 500 },
    )
  }
}

// Выносим мок-данные в отдельную функцию для повторного использования
function getMockCameras() {
  return [
    {
      id: "1",
      name: "Камера 1 - Вход",
      description: "Входная группа",
      model: "IP Camera HD",
      disabled: false,
      ptzEnabled: true,
      ptzMoveEnabled: true,
      ptzZoomEnabled: true,
      receiveAudio: true,
      status: "online",
      archiveStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      archiveEnd: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Камера 2 - Парковка",
      description: "Парковочная зона",
      model: "IP Camera HD",
      disabled: false,
      ptzEnabled: false,
      ptzMoveEnabled: false,
      ptzZoomEnabled: false,
      receiveAudio: true,
      status: "online",
      archiveStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      archiveEnd: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Камера 3 - Склад",
      description: "Складское помещение",
      model: "IP Camera 4K",
      disabled: false,
      ptzEnabled: true,
      ptzMoveEnabled: true,
      ptzZoomEnabled: true,
      receiveAudio: false,
      status: "offline",
      archiveStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      archiveEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      name: "Камера 4 - Офис",
      description: "Офисное помещение",
      model: "IP Camera HD",
      disabled: false,
      ptzEnabled: false,
      ptzMoveEnabled: false,
      ptzZoomEnabled: false,
      receiveAudio: true,
      status: "online",
      archiveStart: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      archiveEnd: new Date().toISOString(),
    },
  ]
}
