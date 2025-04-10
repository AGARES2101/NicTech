"use client"

import { useEffect, useState, useCallback } from "react"
import { logger, LogCategory } from "@/lib/logger"

// Глобальный кэш для хранения потоков
const streamCache = new Map<string, string>()
const streamTimestamps = new Map<string, number>()

// Время жизни кэша в миллисекундах (5 минут)
const CACHE_TTL = 5 * 60 * 1000

// Периодически очищаем устаревшие записи кэша
setInterval(() => {
  const now = Date.now()
  streamTimestamps.forEach((timestamp, key) => {
    if (now - timestamp > CACHE_TTL) {
      streamCache.delete(key)
      streamTimestamps.delete(key)
      logger.debug(LogCategory.VIDEO, `Удален устаревший кэш для ${key}`)
    }
  })
}, 60000) // Проверка каждую минуту

export function useVideoStreamCache(
  cameraId: string,
  streamType: string,
  streamIndex = 0,
  serverUrl?: string,
  authHeader?: string,
) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Уникальный ключ для кэша
  const cacheKey = `${cameraId}-${streamType}-${streamIndex}`

  const fetchStreamUrl = useCallback(async () => {
    // Проверяем кэш
    if (streamCache.has(cacheKey)) {
      logger.info(LogCategory.VIDEO, `Использование кэшированного потока для ${cacheKey}`)
      setStreamUrl(streamCache.get(cacheKey) || null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Формируем URL для запроса в зависимости от типа потока
      let apiUrl = ""

      switch (streamType) {
        case "hls":
          apiUrl = `/api/stream/hls?id=${cameraId}&streamIndex=${streamIndex}`
          break
        case "mjpeg":
          apiUrl = `/api/stream/mjpeg?id=${cameraId}&framerate=10`
          break
        case "webrtc":
          apiUrl = `/api/stream/webrtc?id=${cameraId}`
          break
        case "mock":
          apiUrl = `/api/stream/mock?id=${cameraId}&streamIndex=${streamIndex}`
          break
        default:
          apiUrl = `/api/stream?id=${cameraId}&framerate=10&streamIndex=${streamIndex}`
      }

      // Добавляем заголовки авторизации, если они предоставлены
      const headers: Record<string, string> = {}
      if (serverUrl) headers["server-url"] = serverUrl
      if (authHeader) headers["authorization"] = authHeader

      // Получаем URL потока
      const response = await fetch(apiUrl, { headers })

      if (!response.ok) {
        throw new Error(`Ошибка получения URL потока: ${response.statusText}`)
      }

      const data = await response.json()

      // Для разных типов потоков может быть разная структура ответа
      let url = ""
      if (data.url) {
        url = data.url
      } else if (data.success && data.url) {
        url = data.url
      } else if (streamType === "mjpeg") {
        // Для MJPEG используем непосредственно URL API
        url = apiUrl
      } else {
        throw new Error("Некорректный формат ответа от сервера")
      }

      // Сохраняем в кэш
      streamCache.set(cacheKey, url)
      streamTimestamps.set(cacheKey, Date.now())

      logger.info(LogCategory.VIDEO, `Получен URL потока для ${cacheKey}: ${url}`)
      setStreamUrl(url)
    } catch (err) {
      logger.error(LogCategory.VIDEO, `Ошибка загрузки URL потока для ${cacheKey}`, err)
      setError(err as Error)

      // Для мок-потока используем запасной вариант
      if (streamType === "mock") {
        const fallbackUrl = `/api/stream/mock?id=${cameraId}&streamIndex=${streamIndex}`
        setStreamUrl(fallbackUrl)
      }
    } finally {
      setLoading(false)
    }
  }, [cameraId, streamType, streamIndex, serverUrl, authHeader, cacheKey])

  // Загружаем URL потока при монтировании компонента
  useEffect(() => {
    fetchStreamUrl()
  }, [fetchStreamUrl])

  // Функция для принудительного обновления URL потока
  const refreshStream = useCallback(() => {
    // Удаляем из кэша
    streamCache.delete(cacheKey)
    streamTimestamps.delete(cacheKey)
    // Загружаем заново
    fetchStreamUrl()
  }, [cacheKey, fetchStreamUrl])

  return { streamUrl, loading, error, refreshStream }
}
