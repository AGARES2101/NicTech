"use client"

import { useEffect, useRef, useState } from "react"
import { logger, LogCategory } from "@/lib/logger"
import { AlertCircle } from "lucide-react"
import Image from "next/image"

interface WebRTCStreamProps {
  cameraId: string
  serverUrl?: string
  authHeader?: string
  width?: string | number
  height?: string | number
  controls?: boolean
  muted?: boolean
  autoPlay?: boolean
  onError?: (error: string) => void
}

export function WebRTCStream({
  cameraId,
  serverUrl,
  authHeader,
  width = "100%",
  height = "100%",
  controls = true,
  muted = false,
  autoPlay = true,
  onError,
}: WebRTCStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Сбрасываем состояние при изменении параметров
    setStatus("connecting")
    setError(null)

    const streamId = `webrtc-${cameraId}`
    logger.info(LogCategory.VIDEO, `Инициализация WebRTC потока: ${streamId}`)

    // Функция для инициализации WebRTC соединения
    const initWebRTC = async () => {
      try {
        if (!serverUrl || !authHeader) {
          const errorMsg = "Отсутствуют данные авторизации для WebRTC"
          logger.error(LogCategory.VIDEO, `${errorMsg} для ${streamId}`)
          throw new Error(errorMsg)
        }

        // Создаем RTCPeerConnection
        const peerConnection = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        })
        peerConnectionRef.current = peerConnection

        // Обработчик для получения медиапотока
        peerConnection.ontrack = (event) => {
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0]
            setStatus("connected")
            logger.info(LogCategory.VIDEO, `WebRTC поток подключен для ${streamId}`)
          }
        }

        // Обработчик ошибок ICE соединения
        peerConnection.onicecandidateerror = (event) => {
          logger.warn(LogCategory.VIDEO, `ICE кандидат ошибка для ${streamId}`, event)
        }

        // Обработчик состояния ICE соединения
        peerConnection.oniceconnectionstatechange = () => {
          logger.debug(
            LogCategory.VIDEO,
            `ICE состояние изменено на ${peerConnection.iceConnectionState} для ${streamId}`,
          )

          if (
            peerConnection.iceConnectionState === "failed" ||
            peerConnection.iceConnectionState === "disconnected" ||
            peerConnection.iceConnectionState === "closed"
          ) {
            setStatus("error")
            setError(`Ошибка ICE соединения: ${peerConnection.iceConnectionState}`)
          }
        }

        // Создаем предложение
        const offer = await peerConnection.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        })
        await peerConnection.setLocalDescription(offer)

        // Отправляем предложение на сервер
        const response = await fetch(`/api/stream/webrtc/offer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "server-url": serverUrl,
            Authorization: authHeader,
          },
          body: JSON.stringify({
            cameraId,
            sdp: peerConnection.localDescription,
          }),
        })

        if (!response.ok) {
          throw new Error(`Ошибка установки WebRTC соединения: ${response.statusText}`)
        }

        // Получаем ответ от сервера
        const { sdp, ice } = await response.json()

        // Устанавливаем удаленное описание
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))

        // Добавляем ICE кандидатов
        if (ice && Array.isArray(ice)) {
          for (const candidate of ice) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
          }
        }

        logger.info(LogCategory.VIDEO, `WebRTC соединение инициализировано для ${streamId}`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка WebRTC"
        logger.error(LogCategory.VIDEO, `Ошибка инициализации WebRTC для ${streamId}: ${errorMessage}`, err)
        setStatus("error")
        setError(errorMessage)
        if (onError) onError(errorMessage)
      }
    }

    initWebRTC()

    // Очистка при размонтировании
    return () => {
      logger.debug(LogCategory.VIDEO, `Закрытие WebRTC соединения для ${streamId}`)
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }
    }
  }, [cameraId, serverUrl, authHeader, onError])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {status === "connecting" && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center justify-center text-destructive p-4 text-center">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>{error || "Ошибка подключения WebRTC"}</p>
          <Image
            src={`/placeholder.svg?height=480&width=640&text=Camera+${cameraId}`}
            alt={`Camera ${cameraId} Placeholder`}
            width={640}
            height={480}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            className="mt-4"
          />
        </div>
      )}
      <video
        ref={videoRef}
        style={{ width, height, objectFit: "contain" }}
        controls={controls}
        muted={muted}
        autoPlay={autoPlay}
        playsInline
      />
    </div>
  )
}
