import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const action = searchParams.get("action")
    const presetNum = searchParams.get("presetNum")

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !id || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    // Формирование URL для управления PTZ
    let ptzUrl = `${serverUrl}/rsapi/ptzcontrol?id=${id}&action=${action}`
    if (presetNum) {
      ptzUrl += `&presetNum=${presetNum}`
    }

    // Отправка команды PTZ на сервер NicTech
    const response = await fetch(ptzUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка управления PTZ: ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка управления PTZ:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка управления PTZ",
      },
      { status: 500 },
    )
  }
}
