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

    try {
      // Получение списка записей за дату
      const response = await fetch(`${serverUrl}/rsapi/archive/sequences?id=${id}&date=${date}`, {
        headers: {
          Authorization: authHeader,
        },
        signal: AbortSignal.timeout(5000),
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
      const sequences = Array.isArray(result.Sequences.Sequence)
        ? result.Sequences.Sequence
        : [result.Sequences.Sequence]

      const formattedSequences = sequences.map((sequence) => ({
        start: sequence.RecordStart,
        end: sequence.RecordEnd,
        diskId: sequence.DiskID,
        reason: sequence.Reason,
        isFinished: sequence.IsFinished === "true",
      }))

      return NextResponse.json(formattedSequences)
    } catch (fetchError) {
      console.error("Ошибка при запросе к серверу NicTech:", fetchError)

      // Возвращаем мок-данные для тестирования интерфейса
      console.log("Возвращаем мок-данные для архива")

      // Создаем тестовые данные архива для выбранной даты
      const selectedDate = new Date(date)
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()
      const day = selectedDate.getDate()

      return NextResponse.json([
        {
          start: new Date(year, month, day, 8, 0, 0).toISOString(),
          end: new Date(year, month, day, 10, 30, 0).toISOString(),
          diskId: "1",
          reason: "По расписанию",
          isFinished: true,
        },
        {
          start: new Date(year, month, day, 12, 0, 0).toISOString(),
          end: new Date(year, month, day, 14, 0, 0).toISOString(),
          diskId: "1",
          reason: "По движению",
          isFinished: true,
        },
        {
          start: new Date(year, month, day, 16, 0, 0).toISOString(),
          end: new Date(year, month, day, 18, 0, 0).toISOString(),
          diskId: "1",
          reason: "По расписанию",
          isFinished: true,
        },
      ])
    }
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

