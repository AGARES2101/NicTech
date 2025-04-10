import { type NextRequest, NextResponse } from "next/server"
import { parseStringPromise } from "xml2js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lastMinutes = searchParams.get("lastMinutes") || "30"
    const levels = searchParams.get("levels") || "0,1,2" // 0=notification, 1=alarm, 2=error

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

    // Получение событий с сервера NicTech
    const response = await fetch(`${serverUrl}/rsapi/searchevents?lastminutes=${lastMinutes}&levels=${levels}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка получения событий: ${response.statusText}`)
    }

    const xmlData = await response.text()

    // Парсинг XML-ответа
    const result = await parseStringPromise(xmlData, { explicitArray: false })

    // Проверка наличия событий
    if (!result.EventInfos || !result.EventInfos.EventInfo) {
      return NextResponse.json([])
    }

    // Преобразование данных в удобный формат
    const events = Array.isArray(result.EventInfos.EventInfo)
      ? result.EventInfos.EventInfo
      : [result.EventInfos.EventInfo]

    const formattedEvents = events.map((event) => ({
      id: event.ID,
      type: event.Type,
      typeDescription: event.TypeDescription,
      level: event.Level.toLowerCase(),
      time: event.Time,
      cameraId: event.CameraID,
      cameraName: event.CameraName,
      description: event.LongDescription || event.ShortDescription,
      shortDescription: event.ShortDescription,
      isFrameAttached: event.IsFrameAttached === "true",
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error("Ошибка получения событий:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения событий",
      },
      { status: 500 },
    )
  }
}
