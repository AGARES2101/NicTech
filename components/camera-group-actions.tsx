"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { logger, LogCategory } from "@/lib/logger"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Power, PowerOff, RotateCw, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Camera {
  id: string
  name: string
  status: string
  description?: string
}

interface CameraGroupActionsProps {
  cameras: Camera[]
  serverUrl?: string
  authHeader?: string
  onRefresh: () => void
}

export function CameraGroupActions({ cameras, serverUrl, authHeader, onRefresh }: CameraGroupActionsProps) {
  const [selectedCameras, setSelectedCameras] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: "restart" | "enable" | "disable" | "delete" | null
    title: string
    description: string
  } | null>(null)

  const handleSelectAll = () => {
    if (selectedCameras.length === cameras.length) {
      setSelectedCameras([])
    } else {
      setSelectedCameras(cameras.map((camera) => camera.id))
    }
  }

  const handleSelect = (cameraId: string) => {
    if (selectedCameras.includes(cameraId)) {
      setSelectedCameras(selectedCameras.filter((id) => id !== cameraId))
    } else {
      setSelectedCameras([...selectedCameras, cameraId])
    }
  }

  const handleGroupAction = async (action: "restart" | "enable" | "disable" | "delete") => {
    if (selectedCameras.length === 0) {
      toast({
        title: "Выберите камеры",
        description: "Необходимо выбрать хотя бы одну камеру",
        variant: "destructive",
      })
      return
    }

    // Для опасных действий запрашиваем подтверждение
    if (action === "restart" || action === "disable" || action === "delete") {
      let title = ""
      let description = ""

      switch (action) {
        case "restart":
          title = "Перезапуск камер"
          description = `Вы уверены, что хотите перезапустить ${selectedCameras.length} камер?`
          break
        case "disable":
          title = "Отключение камер"
          description = `Вы уверены, что хотите отключить ${selectedCameras.length} камер?`
          break
        case "delete":
          title = "Удаление камер"
          description = `Вы уверены, что хотите удалить ${selectedCameras.length} камер? Это действие нельзя отменить.`
          break
      }

      setConfirmAction({ action, title, description })
      return
    }

    await executeGroupAction(action)
  }

  const executeGroupAction = async (action: "restart" | "enable" | "disable" | "delete") => {
    try {
      setIsProcessing(true)

      // Формируем заголовки запроса
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (serverUrl) headers["server-url"] = serverUrl
      if (authHeader) headers["authorization"] = authHeader

      const response = await fetch(`/api/cameras/group-action`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          cameraIds: selectedCameras,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ошибка выполнения групповой операции: ${response.statusText}`)
      }

      // Получаем результат операции
      const result = await response.json()

      // Формируем сообщение об успехе
      let actionText = ""
      switch (action) {
        case "restart":
          actionText = "перезапущены"
          break
        case "enable":
          actionText = "включены"
          break
        case "disable":
          actionText = "отключены"
          break
        case "delete":
          actionText = "удалены"
          break
      }

      toast({
        title: "Операция выполнена",
        description: `Камеры успешно ${actionText} (${selectedCameras.length} шт.)`,
      })

      // Сбрасываем выбор
      setSelectedCameras([])

      // Обновляем список камер
      onRefresh()

      // Логируем успешное выполнение операции
      logger.info(LogCategory.API, `Групповая операция "${action}" выполнена для ${selectedCameras.length} камер`, {
        cameraIds: selectedCameras,
      })
    } catch (error) {
      logger.error(LogCategory.API, `Ошибка выполнения групповой операции ${action}`, error)
      toast({
        title: "Ошибка",
        description: `Не удалось выполнить операцию: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setConfirmAction(null)
    }
  }

  // Получение статистики по выбранным камерам
  const getSelectedStats = () => {
    const selectedCamerasData = cameras.filter((camera) => selectedCameras.includes(camera.id))
    const online = selectedCamerasData.filter((camera) => camera.status === "online").length
    const offline = selectedCamerasData.filter((camera) => camera.status === "offline").length
    const disabled = selectedCamerasData.filter((camera) => camera.status === "disabled").length

    return { online, offline, disabled }
  }

  const stats = getSelectedStats()

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Групповые операции с камерами</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedCameras.length === cameras.length && cameras.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer">
                  {selectedCameras.length > 0
                    ? `Выбрано ${selectedCameras.length} из ${cameras.length}`
                    : "Выбрать все камеры"}
                </label>
              </div>

              {selectedCameras.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-success/10">
                    Онлайн: {stats.online}
                  </Badge>
                  <Badge variant="outline" className="bg-destructive/10">
                    Офлайн: {stats.offline}
                  </Badge>
                  <Badge variant="outline" className="bg-muted">
                    Отключены: {stats.disabled}
                  </Badge>
                </div>
              )}
            </div>

            {selectedCameras.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleGroupAction("restart")}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Перезапустить
                </Button>
                <Button variant="outline" size="sm" disabled={isProcessing} onClick={() => handleGroupAction("enable")}>
                  <Power className="mr-2 h-4 w-4" />
                  Включить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleGroupAction("disable")}
                >
                  <PowerOff className="mr-2 h-4 w-4" />
                  Отключить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleGroupAction("delete")}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            )}

            <div className="border rounded-md p-2 max-h-[300px] overflow-y-auto">
              {cameras.map((camera) => (
                <div key={camera.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <Checkbox
                    id={`camera-${camera.id}`}
                    checked={selectedCameras.includes(camera.id)}
                    onCheckedChange={() => handleSelect(camera.id)}
                  />
                  <label htmlFor={`camera-${camera.id}`} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>{camera.name}</span>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            camera.status === "online"
                              ? "bg-success/10 text-success"
                              : camera.status === "offline"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                          }
                        `}
                      >
                        {camera.status === "online" ? "Онлайн" : camera.status === "offline" ? "Офлайн" : "Отключена"}
                      </Badge>
                    </div>
                    {camera.description && <p className="text-xs text-muted-foreground">{camera.description}</p>}
                  </label>
                </div>
              ))}

              {cameras.length === 0 && <div className="text-center p-4 text-muted-foreground">Нет доступных камер</div>}
            </div>

            <div className="flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCameras([])}
                disabled={selectedCameras.length === 0 || isProcessing}
              >
                Снять выделение
              </Button>
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isProcessing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                Обновить список
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Диалог подтверждения действия */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction?.action && executeGroupAction(confirmAction.action)}
              className={confirmAction?.action === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
