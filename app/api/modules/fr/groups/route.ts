import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Получаем ID группы из URL, если он есть
    const url = new URL(request.url)
    const pathParts = url.pathname.split("/")
    const groupId = pathParts[pathParts.length - 1] !== "groups" ? pathParts[pathParts.length - 1] : null

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
    let revisorUrl = `${serverUrl}/rsapi/modules/fr/groups`
    if (groupId) {
      revisorUrl += `/${groupId}`
    }

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      headers: {
        Authorization: authHeader,
      },
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка получения групп: ${response.statusText}`)
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
    console.error("Ошибка получения групп:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка получения групп",
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
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/groups`

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
      throw new Error(`Ошибка добавления группы: ${response.statusText}`)
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
    console.error("Ошибка добавления группы:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка добавления группы",
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
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/groups`

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
      throw new Error(`Ошибка обновления группы: ${response.statusText}`)
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
    console.error("Ошибка обновления группы:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка обновления группы",
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
    let groupId = pathParts[pathParts.length - 1]

    if (groupId === "groups") {
      // ID не указан в URL, пытаемся получить из тела запроса
      const xmlData = await request.text()
      // Простой парсинг XML для извлечения ID
      const match = xmlData.match(/<FRGroupId>(.*?)<\/FRGroupId>/)
      if (match && match[1]) {
        groupId = match[1]
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Не указан идентификатор группы для удаления",
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
    const revisorUrl = `${serverUrl}/rsapi/modules/fr/groups/${groupId}`

    // Создаем новый запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    })

    // Если запрос не успешен, возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Ошибка удаления группы: ${response.statusText}`)
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
    console.error("Ошибка удаления группы:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка удаления группы",
      },
      { status: 500 },
    )
  }
}
