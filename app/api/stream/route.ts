import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const framerate = searchParams.get("framerate") || "10"

    // В реальном приложении здесь будет запрос к API NicTech
    // const serverUrl = request.headers.get('server-url');
    // const authHeader = request.headers.get('authorization');

    // Для MJPEG потока нужно проксировать запрос напрямую
    // return new Response(
    //   fetch(`${serverUrl}/rsapi/mjpeg?id=${id}&framerate=${framerate}`, {
    //     headers: {
    //       'Authorization': authHeader
    //     }
    //   })
    // );

    // Для демонстрации возвращаем ошибку, так как в Next.js API Routes
    // не поддерживают потоковую передачу данных напрямую
    return NextResponse.json({
      success: false,
      message: "Для просмотра видеопотока используйте прямой URL к серверу NicTech",
    })
  } catch (error) {
    console.error("Ошибка получения видеопотока:", error)
    return NextResponse.json({ success: false, message: "Ошибка сервера" }, { status: 500 })
  }
}

