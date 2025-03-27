"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarIcon, Clock, Download, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export default function ArchivePage() {
  const searchParams = useSearchParams()
  const initialCameraId = searchParams.get("cameraId")

  const [authData, setAuthData] = useState<any>(null)
  const [cameras, setCameras] = useState<any[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | null>(initialCameraId)
  const [date, setDate] = useState<Date>(new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState("")
  const [archiveSequences, setArchiveSequences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  // Получение данных авторизации из sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("nictech-auth")
    if (auth) {
      setAuthData(JSON.parse(auth))
    }
  }, [])

  // Загрузка списка камер
  useEffect(() => {
    if (!authData) return

    const fetchCameras = async () => {
      try {
        const response = await fetch("/api/cameras", {
          headers: {
            "server-url": authData.serverUrl,
            authorization: authData.authHeader,
          },
        })

        if (!response.ok) {
          throw new Error("Ошибка получения списка камер")
        }

        const data = await response.json()
        setCameras(data)

        // Если камера не выбрана, выбираем первую из списка
        if (!selectedCamera && data.length > 0) {
          setSelectedCamera(data[0].id)
        }
      } catch (err) {
        console.error("Ошибка загрузки камер:", err)
        setError("Не удалось загрузить список камер")
      }
    }

    fetchCameras()
  }, [authData, selectedCamera])

  // Загрузка записей архива при изменении камеры или даты
  useEffect(() => {
    if (!authData || !selectedCamera) return

    const fetchArchiveSequences = async () => {
      try {
        setLoading(true)
        const formattedDate = format(date, "yyyy-MM-dd")

        const response = await fetch(`/api/archive/sequences?id=${selectedCamera}&date=${formattedDate}`, {
          headers: {
            "server-url": authData.serverUrl,
            authorization: authData.authHeader,
          },
        })

        if (!response.ok) {
          throw new Error("Ошибка получения записей архива")
        }

        const data = await response.json()
        setArchiveSequences(data)

        // Если есть записи, устанавливаем текущее время на начало первой записи
        if (data.length > 0) {
          setCurrentTime(new Date(data[0].start).toLocaleTimeString("ru-RU"))
        }
      } catch (err) {
        console.error("Ошибка загрузки записей архива:", err)
        setError("Не удалось загрузить записи архива")
      } finally {
        setLoading(false)
      }
    }

    fetchArchiveSequences()
  }, [authData, selectedCamera, date])

  // Инициализация сессии архива
  const initArchiveSession = async (time: string) => {
    if (!authData || !selectedCamera) return

    try {
      // Закрываем предыдущую сессию, если она существует
      if (sessionId) {
        await fetch(`/api/archive/stop?sessionId=${sessionId}`, {
          headers: {
            "server-url": authData.serverUrl,
            authorization: authData.authHeader,
          },
        })
      }

      const formattedDate = format(date, "yyyy-MM-dd")
      const fullTime = `${formattedDate}T${time}`

      const response = await fetch(`/api/archive/start?id=${selectedCamera}&time=${fullTime}&direction=Forward`, {
        headers: {
          "server-url": authData.serverUrl,
          authorization: authData.authHeader,
        },
      })

      if (!response.ok) {
        throw new Error("Ошибка инициализации архива")
      }

      const data = await response.json()
      setSessionId(data.sessionId)

      // Загружаем первый кадр
      loadArchiveFrame(data.sessionId, 0)

      return data.sessionId
    } catch (err) {
      console.error("Ошибка инициализации архива:", err)
      setError("Не удалось инициализировать архив")
      return null
    }
  }

  // Загрузка кадра архива
  const loadArchiveFrame = async (sid: string, speed: number) => {
    if (!authData) return

    try {
      const timestamp = new Date().getTime()
      setCurrentImage(`/api/archive/snapshot?sessionId=${sid}&speed=${speed}&viewSize=1280x720&rand=${timestamp}`)

      // Получаем текущее время архива
      const timeResponse = await fetch(`/api/archive/time?sessionId=${sid}`, {
        headers: {
          "server-url": authData.serverUrl,
          authorization: authData.authHeader,
        },
      })

      if (timeResponse.ok) {
        const timeData = await timeResponse.json()
        if (timeData.currentTime) {
          const time = new Date(timeData.currentTime)
          setCurrentTime(time.toLocaleTimeString("ru-RU"))
        }
      }
    } catch (err) {
      console.error("Ошибка загрузки кадра архива:", err)
    }
  }

  // Обработчик воспроизведения/паузы
  const handlePlayPause = async () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (sessionId) {
        loadArchiveFrame(sessionId, 0)
      }
    } else {
      setIsPlaying(true)

      let sid = sessionId
      if (!sid) {
        // Если сессия не инициализирована, инициализируем ее
        if (archiveSequences.length > 0) {
          const time = new Date(archiveSequences[0].start).toLocaleTimeString("ru-RU")
          sid = await initArchiveSession(time)
        }
      }

      if (sid) {
        // Запускаем воспроизведение
        loadArchiveFrame(sid, playbackSpeed)

        // Запускаем интервал для обновления кадров
        const interval = setInterval(() => {
          if (sid) {
            loadArchiveFrame(sid, playbackSpeed)
          } else {
            clearInterval(interval)
          }
        }, 1000)

        // Сохраняем интервал для очистки при размонтировании
        return () => clearInterval(interval)
      }
    }
  }

  // Обработчик изменения скорости воспроизведения
  const handleSpeedChange = (speed: string) => {
    const newSpeed = Number.parseFloat(speed)
    setPlaybackSpeed(newSpeed)

    if (isPlaying && sessionId) {
      loadArchiveFrame(sessionId, newSpeed)
    }
  }

  // Обработчик выбора записи
  const handleSequenceSelect = async (sequence: any) => {
    const time = new Date(sequence.start).toLocaleTimeString("ru-RU")
    await initArchiveSession(time)
    setCurrentTime(time)
  }

  // Форматирование даты для отображения
  const formattedDate = format(date, "PPP", { locale: ru })

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-background">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Архив</h1>
          <div className="flex gap-2">
            <Select value={selectedCamera || ""} onValueChange={setSelectedCamera} disabled={loading}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите камеру" />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4">
          <Card className="overflow-hidden">
            <CardContent className="p-0 relative">
              <div className="aspect-video bg-black relative">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : currentImage ? (
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt={`Архив: ${cameras.find((c) => c.id === selectedCamera)?.name || selectedCamera}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    {archiveSequences.length > 0 ? "Выберите запись для просмотра" : "Нет записей за выбранную дату"}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentTime || "--:--:--"}</span>
                  </div>
                  <div>
                    <span className="text-sm">Скорость: {playbackSpeed}x</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="bg-card border rounded-md p-4">
              <h3 className="font-medium mb-2">Временная шкала</h3>
              <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                {archiveSequences.map((sequence, index) => {
                  // Преобразуем время в проценты для позиционирования
                  const startDate = new Date(sequence.start)
                  const endDate = new Date(sequence.end)

                  const startHour = startDate.getHours()
                  const startMinute = startDate.getMinutes()
                  const endHour = endDate.getHours()
                  const endMinute = endDate.getMinutes()

                  const startPercent = ((startHour * 60 + startMinute) / (24 * 60)) * 100
                  const endPercent = ((endHour * 60 + endMinute) / (24 * 60)) * 100
                  const width = endPercent - startPercent

                  return (
                    <div
                      key={index}
                      className="absolute h-full bg-primary/60 cursor-pointer"
                      style={{
                        left: `${startPercent}%`,
                        width: `${width}%`,
                      }}
                      title={`${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}: ${sequence.reason}`}
                      onClick={() => handleSequenceSelect(sequence)}
                    />
                  )
                })}
                {currentTime && (
                  <div
                    className="absolute h-full w-0.5 bg-red-500"
                    style={{
                      left: `${
                        ((new Date(`2000-01-01T${currentTime}`).getHours() * 60 +
                          new Date(`2000-01-01T${currentTime}`).getMinutes()) /
                          (24 * 60)) *
                        100
                      }%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="icon" disabled={loading || archiveSequences.length === 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlayPause}
                disabled={loading || archiveSequences.length === 0}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" disabled={loading || archiveSequences.length === 0}>
                <SkipForward className="h-4 w-4" />
              </Button>
              <Select
                value={playbackSpeed.toString()}
                onValueChange={handleSpeedChange}
                disabled={loading || archiveSequences.length === 0}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Скорость" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="4">4x</SelectItem>
                  <SelectItem value="8">8x</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="gap-2"
                disabled={loading || archiveSequences.length === 0 || !sessionId}
              >
                <Download className="h-4 w-4" />
                Экспорт
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Записи за {formattedDate}</h3>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)
              ) : archiveSequences.length > 0 ? (
                <div className="space-y-2">
                  {archiveSequences.map((sequence, index) => {
                    const startTime = new Date(sequence.start).toLocaleTimeString("ru-RU")
                    const endTime = new Date(sequence.end).toLocaleTimeString("ru-RU")

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted rounded-md hover:bg-muted/80 cursor-pointer"
                        onClick={() => handleSequenceSelect(sequence)}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          <span>
                            {startTime} - {endTime}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">{sequence.reason}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">Нет записей за выбранную дату</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

