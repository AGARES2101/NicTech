import { type NextRequest, NextResponse } from "next/server"
import { parseStringPromise } from "xml2js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const date = searchParams.get("date")

    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    if (!serverUrl || !authHeader || !id || !date) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют необходимые параметры",
        },
        { status: 400 },
      )
    }

    // Получение списка записей за дату
    const response = await fetch(`${serverUrl}/rsapi/archive/sequences?id=${id}&date=${date}`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      throw new Error(`Ошибка получения записей архива: ${response.statusText}`)
    }

    const xmlData = await response.text()

    // Парсинг XML-ответа
    const result = await parseStringPromise(xmlData, { explicitArray: false })

    // Проверка наличия записей
    if (!result.Sequences || !result.Sequences.Sequence) {
      return NextResponse.json([])
    }

    // Преобразование данных в удобный формат
    const sequences = Array.isArray(result.Sequences.Sequence) ? result.Sequences.Sequence : [result.Sequences.Sequence]

    const formattedSequences = sequences.map((sequence) => ({
      start: sequence.RecordStart,
      end: sequence.RecordEnd,
      diskId: sequence.DiskID,
      reason: sequence.Reason,
      isFinished: sequence.IsFinished === "true",
    }))

    return NextResponse.json(formattedSequences)
  } catch (error) {
    console.error("Ошибка получения записей архива:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения записей архива",
      },
      { status: 500 },
    )
  }
}

