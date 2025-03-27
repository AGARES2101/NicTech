"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface Camera {
  id: string
  name: string
  description: string
  model: string
  ptzEnabled: boolean
  ptzMoveEnabled?: boolean
  ptzZoomEnabled?: boolean
  receiveAudio?: boolean
  status: string
  archiveStart?: string
  archiveEnd?: string
}

interface CameraInfoProps {
  camera: Camera
  onClose: () => void
  serverUrl?: string
  authHeader?: string
}

export function CameraInfo({ camera, onClose, serverUrl, authHeader }: CameraInfoProps) {
  const [cameraState, setCameraState] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Загрузка состояния камеры
  useEffect(() => {
    if (!serverUrl || !authHeader) return

    const fetchCameraState = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/camera/state?id=${camera.id}`, {
          headers: {
            "server-url": serverUrl,
            authorization: authHeader,
          },
        })

        if (!response.ok) {
          throw new Error("Ошибка получения состояния камеры")
        }

        const data = await response.json()
        setCameraState(data)
      } catch (error) {
        console.error("Ошибка загрузки состояния камеры:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCameraState()
  }, [camera.id, serverUrl, authHeader])

  // Форматирование даты и времени
  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "Нет данных"
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString("ru-RU")
    } catch (e) {
      return dateTimeStr
    }
  }

  // Получение текста состояния записи
  const getRecordingStateText = (state?: string) => {
    if (!state) return "Неизвестно"

    switch (state) {
      case "Writing":
        return "Запись ведется"
      case "NotWriting":
        return "Запись не ведется"
      case "RecordingIsOff":
        return "Запись отключена"
      case "Disabled":
        return "Камера отключена"
      case "Error":
        return "Ошибка"
      default:
        return state
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{camera.name}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="archive">Архив</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Основная информация</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{camera.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Название:</span>
                  <span>{camera.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Описание:</span>
                  <span>{camera.description || "Нет описания"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Модель:</span>
                  <span>{camera.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Статус:</span>
                  <span className={camera.status === "online" ? "text-green-500" : "text-red-500"}>
                    {camera.status === "online" ? "В сети" : camera.status === "disabled" ? "Отключена" : "Не доступна"}
                  </span>
                </div>
                {loading ? (
                  <Skeleton className="h-4 w-full" />
                ) : (
                  cameraState && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Состояние записи:</span>
                      <span>{getRecordingStateText(cameraState.state)}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Возможности</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PTZ управление:</span>
                  <span>{camera.ptzEnabled ? "Да" : "Нет"}</span>
                </div>
                {camera.ptzMoveEnabled !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Поворот PTZ:</span>
                    <span>{camera.ptzMoveEnabled ? "Да" : "Нет"}</span>
                  </div>
                )}
                {camera.ptzZoomEnabled !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Зум PTZ:</span>
                    <span>{camera.ptzZoomEnabled ? "Да" : "Нет"}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Аудио:</span>
                  <span>{camera.receiveAudio ? "Да" : "Нет"}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Архив</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Начало архива:</span>
                <span>{formatDateTime(camera.archiveStart)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Конец архива:</span>
                <span>{formatDateTime(camera.archiveEnd)}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="archive" className="mt-4">
          <div className="text-center p-4">
            <p>Для работы с архивом перейдите в раздел "Архив"</p>
            <Button
              className="mt-2"
              onClick={() => (window.location.href = `/dashboard/archive?cameraId=${camera.id}`)}
            >
              Перейти в архив
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="text-center p-4">
            <p>Настройки камеры доступны только администраторам</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

