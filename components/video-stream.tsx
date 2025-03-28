"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VideoStreamProps {
  cameraId: string
  serverUrl?: string
  authHeader?: string
  width?: string | number
  height?: string | number
  streamType?: "hls" | "mjpeg" | "webrtc" | "mock"
  autoPlay?: boolean
  muted?: boolean
  controls?: boolean
  codec?: "h264" | "h265" | "auto"
  onError?: (error: Error) => void
}

export function VideoStream({
  cameraId,
  serverUrl,
  authHeader,
  width = "100%",
  height = "100%",
  streamType = "mjpeg",
  autoPlay = true,
  muted = true,
  controls = true,
  codec = "auto",
  onError,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  // Функция для обработки ошибок
  const handleError = (errorMessage: string) => {
    console.error(errorMessage)
    setError(errorMessage)
    setLoading(false)
    if (onError) {
      onError(new Error(errorMessage))
    }
  }

  // Инициализация видеопотока
  useEffect(() => {
    if (!cameraId) return

    const initStream = async () => {
      setLoading(true)
      setError(null)

      try {
        if (streamType === "mock") {
          // Используем мок-видео для тестирования
          setStreamUrl("/api/stream/mock?id=" + cameraId)
          setLoading(false)
          return
        }

        if (!serverUrl || !authHeader) {
          throw new Error("Отсутствуют данные авторизации")
        }

        // Получаем URL для потока в зависимости от выбранного типа
        switch (streamType) {
          case "hls":
            // HLS поток (m3u8)
            const hlsResponse = await fetch(
              `/api/stream/hls?id=${cameraId}${codec !== "auto" ? `&codec=${codec}` : ""}`,
              {
                headers: {
                  "server-url": serverUrl,
                  authorization: authHeader,
                },
              },
            )

            if (!hlsResponse.ok) {
              throw new Error("Не удалось получить HLS поток")
            }

            const hlsData = await hlsResponse.json()
            setStreamUrl(hlsData.url)
            break

          case "mjpeg":
            // MJPEG поток
            setStreamUrl(`/api/stream/mjpeg?id=${cameraId}`)
            break

          case "webrtc":
            // WebRTC поток
            const webrtcResponse = await fetch(
              `/api/stream/webrtc?id=${cameraId}${codec !== "auto" ? `&codec=${codec}` : ""}`,
              {
                headers: {
                  "server-url": serverUrl,
                  authorization: authHeader,
                },
              },
            )

            if (!webrtcResponse.ok) {
              throw new Error("Не удалось получить WebRTC поток")
            }

            const webrtcData = await webrtcResponse.json()
            setStreamUrl(webrtcData.url)
            break

          default:
            throw new Error("Неподдерживаемый тип потока")
        }

        setLoading(false)
      } catch (err) {
        // Если произошла ошибка, переключаемся на мок-видео
        console.warn("Ошибка при инициализации потока, переключаемся на мок-видео:", err)
        setStreamUrl("/api/stream/mock?id=" + cameraId)
        setLoading(false)
      }
    }

    initStream()

    // Очистка при размонтировании
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ""
        videoRef.current.load()
      }
    }
  }, [cameraId, serverUrl, authHeader, streamType, codec])

  // Обновление MJPEG потока
  useEffect(() => {
    if (streamType !== "mjpeg" || !imgRef.current || !streamUrl) return

    const img = imgRef.current
    img.src = streamUrl
    img.onerror = () => {
      handleError("Ошибка загрузки MJPEG потока")
    }
    img.onload = () => {
      setLoading(false)
    }
  }, [streamUrl, streamType])

  // Обновление HLS/WebRTC/mock потока
  useEffect(() => {
    if ((streamType === "hls" || streamType === "webrtc" || streamType === "mock") && videoRef.current && streamUrl) {
      const video = videoRef.current
      video.src = streamUrl
      video.onerror = () => {
        // Для mock потока используем запасной вариант вместо ошибки
        if (streamType === "mock") {
          console.warn("Не удалось загрузить мок-видео, используем статическое изображение")
          setLoading(false)
          // Очищаем ошибку, так как будем использовать запасной вариант
          setError(null)
        } else {
          handleError(`Ошибка загрузки ${streamType.toUpperCase()} потока`)
        }
      }
      video.onloadeddata = () => {
        setLoading(false)
      }

      if (autoPlay) {
        video.play().catch((err) => {
          console.warn("Автовоспроизведение не удалось:", err)
          // Для mock потока не показываем ошибку при проблемах с автовоспроизведением
          if (streamType === "mock") {
            setLoading(false)
          }
        })
      }
    }
  }, [streamUrl, streamType, autoPlay, codec])

  // Отображение загрузки
  if (loading) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    )
  }

  // Отображение ошибки
  if (error) {
    return (
      <div style={{ width, height }} className="bg-black">
        <Alert variant="destructive" className="bg-black/80 border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Отображение MJPEG потока
  if (streamType === "mjpeg" && streamUrl) {
    return (
      <div style={{ width, height }} className="bg-black overflow-hidden">
        <img
          ref={imgRef}
          src={streamUrl || "/placeholder.svg"}
          alt={`Камера ${cameraId}`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    )
  }

  // Отображение HLS/WebRTC/Mock потока
  return (
    <div style={{ width, height }} className="bg-black overflow-hidden">
      {error && streamType === "mock" ? (
        // Запасной вариант для mock потока при ошибке
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={`/placeholder.svg?height=480&width=640&text=Camera+${cameraId}`}
            alt={`Камера ${cameraId}`}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          muted={muted}
          controls={controls}
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          {...(codec === "h265" ? { "data-setup": '{"techOrder": ["html5"]}' } : {})}
        />
      )}
    </div>
  )
}

