import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sendPhotos = searchParams.get("sendphotos") === "1"
    const personId = searchParams.get("id") || ""

    // Получаем данные авторизации из заголовков
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

    // Формируем URL для запроса к серверу Revisor VMS
    let revisorUrl = `${serverUrl}/rsapi/modules/fr/persons`
    if (personId) {
      revisorUrl += `/${personId}`
    }
    if (sendPhotos) {
      revisorUrl += `?sendphotos=1`
    }

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка получения данных о лицах: ${response.statusText}`)
    }

    // Получаем XML-ответ от сервера
    const xmlData = await response.text()

    // Возвращаем XML-ответ клиенту
    return new Response(xmlData, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Ошибка получения данных о лицах:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения данных о лицах",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
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

    // Получаем XML-данные из тела запроса
    const xmlData = await request.text()

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/persons`

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "text/xml; charset=utf-8",
      },
      body: xmlData,
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка добавления данных о лице: ${response.statusText}`)
    }

    // Получаем ответ от сервера
    const responseData = await response.text()

    // Возвращаем ответ клиенту
    return new Response(responseData, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Ошибка добавления данных о лице:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка добавления данных о лице",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
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

    // Получаем XML-данные из тела запроса
    const xmlData = await request.text()

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/persons`

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "Content-Type": "text/xml; charset=utf-8",
      },
      body: xmlData,
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка обновления данных о лице: ${response.statusText}`)
    }

    // Получаем ответ от сервера
    const responseData = await response.text()

    // Возвращаем ответ клиенту
    return new Response(responseData, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Ошибка обновления данных о лице:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка обновления данных о лице",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем ID из URL или из тела запроса
    const url = new URL(request.url)
    const pathParts = url.pathname.split("/")
    let personId = pathParts[pathParts.length - 1]

    if (personId === "persons") {
      // ID не указан в URL, пытаемся получить из тела запроса
      const xmlData = await request.text()
      // Простой парсинг XML для извлечения ID
      const match = xmlData.match(/<FRPersonId>(.*?)<\/FRPersonId>/)
      if (match && match[1]) {
        personId = match[1]
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Не указан идентификатор лица для удаления",
          },
          { status: 400 },
        )
      }
    }

    if (!serverUrl || !authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствуют данные авторизации",
        },
        { status: 401 },
      )
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/persons/${personId}`

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка удаления данных о лице: ${response.statusText}`)
    }

    // Получаем ответ от сервера
    const responseData = await response.text()

    // Возвращаем ответ клиенту
    return new Response(responseData, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Ошибка удаления данных о лице:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка удаления данных о лице",
      },
      { status: 500 },
    )
  }
}

