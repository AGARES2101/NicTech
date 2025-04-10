import { type NextRequest, NextResponse } from "next/server"
import { parseStringPromise } from "xml2js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !id) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    // Получение состояния камеры
    const response = await fetch(`${serverUrl}/rsapi/camerastate?id=${id}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка получения состояния камеры: ${response.statusText}`)
    }

    const xmlData = await response.text()

    // Парсинг XML-ответа
    const result = await parseStringPromise(xmlData, { explicitArray: false })

    // Преобразование данных в удобный формат
    const cameraState = {
      id: result.CameraStateInfo.ID,
      name: result.CameraStateInfo.Name,
      fullGroupName: result.CameraStateInfo.FullGroupName,
      state: result.CameraStateInfo.State,
    }

    return NextResponse.json(cameraState)
  } catch (error) {
    console.error("Ошибка получения состояния камеры:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения состояния камеры",
      },
      { status: 500 },
    )
  }
}
