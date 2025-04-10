"use client"

import { useRef, useEffect, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Maximize2, MoreHorizontal, Play, Settings2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VideoStream } from "@/components/video-stream"
import { useRouter } from "next/navigation"

interface Camera {
  id: string
  name: string
  status: string
  description?: string
  model?: string
  ptzEnabled?: boolean
  receiveAudio?: boolean
}

interface VirtualizedCameraListProps {
  cameras: Camera[]
  serverUrl?: string
  authHeader?: string
  streamType: "hls" | "mjpeg" | "webrtc" | "mock" | "native"
  streamIndex?: 0 | 1
  codec?: "auto" | "h264" | "h265"
  onCameraSelect?: (cameraId: string) => void
  onFullscreen?: (cameraId: string) => void
  selectedCamera?: string | null
}

export function VirtualizedCameraList({
  cameras,
  serverUrl,
  authHeader,
  streamType,
  streamIndex = 1,
  codec = "auto",
  onCameraSelect,
  onFullscreen,
  selectedCamera,
}: VirtualizedCameraListProps) {
  const router = useRouter()
  const parentRef = useRef<HTMLDivElement>(null)
  const [parentHeight, setParentHeight] = useState(0)

  // Обновляем высоту контейнера при изменении размера окна
  useEffect(() => {
    const updateHeight = () => {
      if (parentRef.current) {
        setParentHeight(parentRef.current.offsetHeight)
      }
    }

    updateHeight()
    window.addEventListener("resize", updateHeight)

    return () => {
      window.removeEventListener("resize", updateHeight)
    }
  }, [])

  const rowVirtualizer = useVirtualizer({
    count: cameras.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Примерная высота строки
    overscan: 5, // Количество дополнительных элементов для рендеринга
  })

  // Получение цвета статуса камеры
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success text-success-foreground"
      case "offline":
        return "bg-destructive text-destructive-foreground"
      case "disabled":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Получение текста статуса камеры
  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Онлайн"
      case "offline":
        return "Не доступна"
      case "disabled":
        return "Отключена"
      default:
        return status
    }
  }

  return (
    <div ref={parentRef} className="overflow-auto h-full w-full">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const camera = cameras[virtualRow.index]
          return (
            <div
              key={camera.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                padding: "0.5rem",
              }}
            >
              <Card
                className={`hover:shadow-md transition-shadow ${selectedCamera === camera.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => onCameraSelect?.(camera.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-24 h-16 bg-black relative flex-shrink-0 rounded-md overflow-hidden">
                    {camera.status === "online" ? (
                      <VideoStream
                        cameraId={camera.id}
                        serverUrl={serverUrl}
                        authHeader={authHeader}
                        streamType={streamType}
                        streamIndex={streamIndex}
                        codec={codec}
                        width="100%"
                        height="100%"
                        controls={false}
                        muted={true}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white text-xs">{getStatusText(camera.status)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{camera.name}</h3>
                      <Badge className={`${getStatusColor(camera.status)} ml-2`}>{getStatusText(camera.status)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{camera.description || camera.model}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {camera.ptzEnabled && (
                        <Badge variant="outline" className="text-xs">
                          PTZ
                        </Badge>
                      )}
                      {camera.receiveAudio && (
                        <Badge variant="outline" className="text-xs">
                          Аудио
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/archive?cameraId=${camera.id}`)
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onFullscreen?.(camera.id)
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            // Экспорт кадра
                            const link = document.createElement("a")
                            link.href = `/api/snapshot?id=${camera.id}`
                            link.download = `camera-${camera.id}-${new Date().toISOString()}.jpg`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Экспорт кадра
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            // Настройки камеры
                            router.push(`/dashboard/settings/cameras/${camera.id}`)
                          }}
                        >
                          <Settings2 className="mr-2 h-4 w-4" />
                          Настройки
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
