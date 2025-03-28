"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { logger, LogCategory } from "@/lib/logger"

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
  const streamId = `${cameraId}-${streamType}-${streamIndex}`

  useEffect(() => {
    // Сбрасываем состояние при изменении параметров
    setError(null)
    setLoading(true)

    logger.info(LogCategory.VIDEO, `Инициализация видеопотока: ${streamId}`, {
      cameraId,
      streamType,
      streamIndex,
      codec,
    })

    const loadStream = async () => {
      try {
        if (streamType === "mock") {
          logger.debug(LogCategory.VIDEO, `Использование мок-потока для ${streamId}`)
          // Для мок-потока ничего не делаем, он загрузится через src
          setTimeout(() => setLoading(false), 500)
          return
        }

        if (!serverUrl || !authHeader) {
          const errorMsg = "Отсутствуют данные авторизации"
          logger.error(LogCategory.VIDEO, `${errorMsg} для ${streamId}`)
          throw new Error(errorMsg)
        }

        // Здесь будет логика для разных типов потоков
        switch (streamType) {
          case "hls":
            logger.debug(LogCategory.VIDEO, `Настройка HLS потока для ${streamId}`)
            // Логика для HLS потока
            if (videoRef.current) {
              // Проверка поддержки HLS
              if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
                const src = `/api/stream/hls?id=${cameraId}&codec=${codec}&streamIndex=${streamIndex}`
                logger.debug(LogCategory.VIDEO, `Установка источника HLS: ${src}`)
                videoRef.current.src = src
              } else {
                // Если браузер не поддерживает HLS нативно, можно использовать hls.js
                // Но для простоты сейчас просто выдаем ошибку
                const errorMsg = "Браузер не поддерживает HLS потоки"
                logger.error(LogCategory.VIDEO, `${errorMsg} для ${streamId}`)
                throw new Error(errorMsg)
              }
            }
            break
          case "mjpeg":
            logger.debug(LogCategory.VIDEO, `Настройка MJPEG потока для ${streamId}`)
            // MJPEG потоки обрабатываются через img тег, не через video
            // Настраиваем источник для MJPEG
            if (imgRef.current) {
              const src = `/api/stream/mjpeg?id=${cameraId}&framerate=10`
              logger.debug(LogCategory.VIDEO, `Установка источника MJPEG: ${src}`)
              imgRef.current.src = src
            }
            break
          case "native":
            logger.debug(LogCategory.VIDEO, `Настройка нативного потока для ${streamId}`)
            // Получение видео в формате камеры (раздел 11 API)
            if (videoRef.current) {
              const src = `/api/stream?id=${cameraId}&framerate=10&streamIndex=${streamIndex}`
              logger.debug(LogCategory.VIDEO, `Установка источника нативного потока: ${src}`)
              videoRef.current.src = src
            }
            break
          case "webrtc":
            logger.debug(LogCategory.VIDEO, `Попытка настройки WebRTC потока для ${streamId}`)
            // Логика для WebRTC потока
            // Требуется дополнительная библиотека для WebRTC
            const errorMsg = "WebRTC потоки пока не поддерживаются"
            logger.error(LogCategory.VIDEO, `${errorMsg} для ${streamId}`)
            throw new Error(errorMsg)
          default:
            const unknownErrorMsg = `Неизвестный тип потока: ${streamType}`
            logger.error(LogCategory.VIDEO, `${unknownErrorMsg} для ${streamId}`)
            throw new Error(unknownErrorMsg)
        }
      } catch (err) {
        console.error("Ошибка инициализации видеопотока:", err)
        const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки видеопотока"
        logger.error(LogCategory.VIDEO, `Ошибка инициализации видеопотока ${streamId}: ${errorMessage}`, err)
        setError(errorMessage)
        if (onError) onError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadStream()

    // Очистка при размонтировании
    return () => {
      logger.debug(LogCategory.VIDEO, `Очистка видеопотока: ${streamId}`)
      if (videoRef.current) {
        videoRef.current.src = ""
        videoRef.current.load()
      }
    }
  }, [cameraId, serverUrl, authHeader, streamType, codec, streamIndex, onError, streamId])

  // Обработчик ошибок для видео
  const handleVideoError = () => {
    const errorMessage = "Не удалось загрузить видеопоток"
    logger.error(LogCategory.VIDEO, `${errorMessage} для ${streamId}`)
    setError(errorMessage)
    setLoading(false)
    if (onError) onError(errorMessage)
  }

  // Обработчик успешной загрузки видео
  const handleVideoLoad = () => {
    logger.info(LogCategory.VIDEO, `Видеопоток ${streamId} успешно загружен`)
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
              logger.error(LogCategory.VIDEO, `${errorMessage} для ${streamId}`)
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

