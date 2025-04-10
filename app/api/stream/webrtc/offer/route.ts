import { type NextRequest, NextResponse } from "next/server"
import { logger, LogCategory } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    // Получаем данные авторизации из заголовков
    const serverUrl = request.headers.get("server-url")
    const authHeader = request.headers.get("authorization")

    // Получаем данные из тела запроса
    const { cameraId, sdp } = await request.json()

    // Проверяем наличие необходимых данных
    if (!cameraId) {
      return NextResponse.json({ success: false, message: "Не указан идентификатор камеры" }, { status: 400 })
    }

    if (!sdp) {
      return NextResponse.json({ success: false, message: "Не указано SDP предложение" }, { status: 400 })
    }

    // Если нет данных авторизации, используем мок-данные для тестирования
    if (!serverUrl || !authHeader) {
      logger.info(LogCategory.VIDEO, `WebRTC предложение для камеры ${cameraId} (мок-режим)`, { cameraId })

      // Имитируем задержку
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Возвращаем мок-ответ
      return NextResponse.json({
        success: true,
        sdp: {
          type: "answer",
          sdp: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:mock\r\na=ice-pwd:mock\r\na=ice-options:trickle\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=extmap:1 urn:ietf:params:rtp-hdrext:toffset\r\na=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\na=extmap:3 urn:3gpp:video-orientation\r\na=extmap:4 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\na=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay\r\na=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type\r\na=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing\r\na=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space\r\na=recvonly\r\na=rtcp-mux\r\na=rtcp-rsize\r\na=rtpmap:96 H264/90000\r\na=rtcp-fb:96 goog-remb\r\na=rtcp-fb:96 transport-cc\r\na=rtcp-fb:96 ccm fir\r\na=rtcp-fb:96 nack\r\na=rtcp-fb:96 nack pli\r\na=fmtp:96 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\n",
        },
        ice: [
          {
            candidate: "candidate:1 1 UDP 2130706431 127.0.0.1 50000 typ host",
            sdpMLineIndex: 0,
            sdpMid: "0",
          },
        ],
      })
    }

    // Формируем URL для запроса к серверу Revisor VMS
    const revisorUrl = `${serverUrl}/rsapi/webrtc/offer`

    // Отправляем запрос к серверу Revisor VMS
    const response = await fetch(revisorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        cameraId,
        sdp,
      }),
    })

    // Проверяем ответ сервера
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(LogCategory.VIDEO, `Ошибка установки WebRTC соединения для камеры ${cameraId}`, {
        status: response.status,
        error: errorText,
      })

      return NextResponse.json(
        {
          success: false,
          message: `Ошибка установки WebRTC соединения: ${response.statusText}`,
          error: errorText,
        },
        { status: response.status },
      )
    }

    // Получаем результат операции
    const result = await response.json()

    logger.info(LogCategory.VIDEO, `WebRTC соединение успешно установлено для камеры ${cameraId}`, { cameraId })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error(LogCategory.VIDEO, "Ошибка установки WebRTC соединения", error)

    return NextResponse.json(
      { success: false, message: "Ошибка сервера", error: (error as Error).message },
      { status: 500 },
    )
  }
}
