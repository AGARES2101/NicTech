"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { AlertCircle } from "lucide-react"

interface VideoStreamProps {
  cameraId: string
  serverUrl?: string
  authHeader?: string
  streamType: "hls" | "mjpeg" | "webrtc" | "mock" | "native"
  streamIndex?: 0 | 1 // 0 - основной поток, 1 - дополнительный
  codec?: "auto" | "h264" | "h265"
  width?: string | number
  height?: string | number
  controls?: boolean
  muted?: boolean
  autoPlay?: boolean
  onError?: (error: string) => void
}

export function VideoStream({
  cameraId,
  serverUrl,
  authHeader,
  streamType = "mock",
  streamIndex = 0,
  codec = "auto",
  width = "100%",
  height = "100%",
  controls = true,
  muted = false,
  autoPlay = true,
  onError,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Сбрасываем состояние при изменении параметров
    setError(null)
    setLoading(true)

    const loadStream = async () => {
      try {
        if (streamType === "mock") {
          // Для мок-потока ничего не делаем, он загрузится через src
          setTimeout(() => setLoading(false), 500)
          return
        }

        if (!serverUrl || !authHeader) {
          throw new Error("Отсутствуют данные авторизации")
        }

        // Здесь будет логика для разных типов потоков
        switch (streamType) {
          case "hls":
            // Логика для HLS потока
            if (videoRef.current) {
              // Проверка поддержки HLS
              if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
                videoRef.current.src = `/api/stream/hls?id=${cameraId}&codec=${codec}&streamIndex=${streamIndex}`
              } else {
                // Если браузер не поддерживает HLS нативно, можно использовать hls.js
                // Но для простоты сейчас просто выдаем ошибку
                throw new Error("Браузер не поддерживает HLS потоки")
              }
            }
            break
          case "mjpeg":
            // MJPEG потоки обрабатываются через img тег, не через video
            // Настраиваем источник для MJPEG
            if (imgRef.current) {
              imgRef.current.src = `/api/stream/mjpeg?id=${cameraId}&framerate=10`
            }
            break
          case "native":
            // Получение видео в формате камеры (раздел 11 API)
            if (videoRef.current) {
              videoRef.current.src = `/api/stream?id=${cameraId}&framerate=10&streamIndex=${streamIndex}`
            }
            break
          case "webrtc":
            // Логика для WebRTC потока
            // Требуется дополнительная библиотека для WebRTC
            throw new Error("WebRTC потоки пока не поддерживаются")
          default:
            throw new Error(`Неизвестный тип потока: ${streamType}`)
        }
      } catch (err) {
        console.error("Ошибка инициализации видеопотока:", err)
        const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки видеопотока"
        setError(errorMessage)
        if (onError) onError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadStream()
  }, [cameraId, serverUrl, authHeader, streamType, codec, streamIndex, onError])

  // Обработчик ошибок для видео
  const handleVideoError = () => {
    const errorMessage = "Не удалось загрузить видеопоток"
    setError(errorMessage)
    setLoading(false)
    if (onError) onError(errorMessage)
  }

  // Обработчик успешной загрузки видео
  const handleVideoLoad = () => {
    setLoading(false)
    setError(null)
  }

  // Рендер в зависимости от типа потока
  if (streamType === "mjpeg") {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center">Загрузка...</div>}
        {error ? (
          <div className="flex flex-col items-center justify-center text-destructive p-4 text-center">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
            <Image
              src={`/placeholder.svg?height=480&width=640&text=Camera+${cameraId}`}
              alt={`Camera ${cameraId} Placeholder`}
              width={640}
              height={480}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              className="mt-4"
            />
          </div>
        ) : (
          <img
            ref={imgRef}
            src={`/api/stream/mjpeg?id=${cameraId}&framerate=10`}
            alt={`Camera ${cameraId} MJPEG Stream`}
            style={{ width, height, objectFit: "contain" }}
            onError={() => {
              const errorMessage = "Не удалось загрузить MJPEG поток"
              setError(errorMessage)
              if (onError) onError(errorMessage)
            }}
            onLoad={handleVideoLoad}
          />
        )}
      </div>
    )
  }

  // Для мок-потока и других типов используем video тег
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center">Загрузка...</div>}
      {error ? (
        <div className="flex flex-col items-center justify-center text-destructive p-4 text-center">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p>{error}</p>
          <Image
            src={`/placeholder.svg?height=480&width=640&text=Camera+${cameraId}`}
            alt={`Camera ${cameraId} Placeholder`}
            width={640}
            height={480}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            className="mt-4"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          src={streamType === "mock" ? `/api/stream/mock?id=${cameraId}&width=640&height=480` : undefined}
          controls={controls}
          muted={muted}
          autoPlay={autoPlay}
          loop={streamType === "mock"}
          playsInline
          style={{ width, height, objectFit: "contain" }}
          onError={handleVideoError}
          onLoadedData={handleVideoLoad}
        />
      )}
    </div>
  )
}

