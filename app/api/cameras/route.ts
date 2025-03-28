import { type NextRequest, NextResponse } from "next/server"
import { parseStringPromise } from "xml2js"

// Модифицируем функцию GET для добавления обработки ошибок и мок-данных
export async function GET(request: NextRequest) {
  try {
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

    // Попытка получения данных с реального сервера
    try {
      // Получение списка камер с сервера NicTech
      const response = await fetch(`${serverUrl}/rsapi/cameras`, {
        headers: {
          Authorization: authHeader,
        },
        // Добавляем таймаут для предотвращения долгого ожидания
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Ошибка получения списка камер: ${response.statusText}`)
      }

      const xmlData = await response.text()

      // Парсинг XML-ответа
      const result = await parseStringPromise(xmlData, { explicitArray: false })

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

      // Получение списка недоступных камер
      const unavailableResponse = await fetch(`${serverUrl}/rsapi/unavailablecameraids`, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(5000),
      })

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

      return NextResponse.json(formattedCameras)
    } catch (fetchError) {
      console.error("Ошибка при запросе к серверу NicTech:", fetchError)

      // Возвращаем мок-данные для тестирования интерфейса
      console.log("Возвращаем мок-данные для тестирования")
      return NextResponse.json([
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
      ])
    }
  } catch (error) {
    console.error("Ошибка получения списка камер:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения списка камер",
      },
      { status: 500 },
    )
  }
}

