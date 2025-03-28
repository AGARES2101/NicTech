"use client"

import { useState, useEffect } from "react"
import {
  Expand,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Play,
  Search,
  Filter,
  Grid3X3,
  Grid2X2,
  Grid,
  RefreshCw,
  Settings2,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PTZControls } from "@/components/ptz-controls"
import { CameraInfo } from "@/components/camera-info"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { VideoStream } from "@/components/video-stream"

export default function CamerasPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [layout, setLayout] = useState("2x2")
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cameras, setCameras] = useState<any[]>([])
  const [error, setError] = useState("")
  const [authData, setAuthData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showOffline, setShowOffline] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string[]>(["online", "offline", "disabled"])
  const [filterPTZ, setFilterPTZ] = useState<boolean | null>(null)
  const [streamType, setStreamType] = useState<"hls" | "mjpeg" | "webrtc" | "mock">("mock")
  const [codec, setCodec] = useState<"auto" | "h264" | "h265">("auto")

  // Получение данных авторизации из sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("nictech-auth")
    if (auth) {
      setAuthData(JSON.parse(auth))
    } else {
      router.push("/login")
    }
  }, [router])

  // Загрузка списка камер
  useEffect(() => {
    if (!authData) return

    const fetchCameras = async () => {
      try {
        setLoading(true)
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
      } catch (err) {
        console.error("Ошибка загрузки камер:", err)
        setError("Не удалось загрузить список камер")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchCameras()

    // Автоматическое обновление
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCameras()
      }, 10000) // Обновление каждые 10 секунд
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [authData, refreshing, autoRefresh])

  // Фильтрация камер по поисковому запросу и фильтрам
  const filteredCameras = cameras.filter((camera) => {
    // Фильтр по поисковому запросу
    const matchesSearch =
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (camera.description && camera.description.toLowerCase().includes(searchQuery.toLowerCase()))

    // Фильтр по статусу
    const matchesStatus = filterStatus.includes(camera.status)

    // Фильтр по PTZ
    const matchesPTZ = filterPTZ === null || camera.ptzEnabled === filterPTZ

    return matchesSearch && matchesStatus && matchesPTZ
  })

  // Определение размеров сетки в зависимости от выбранного макета
  const getGridClass = () => {
    switch (layout) {
      case "1x1":
        return "grid-cols-1"
      case "2x2":
        return "grid-cols-1 sm:grid-cols-2"
      case "3x3":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      case "4x4":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      default:
        return "grid-cols-1 sm:grid-cols-2"
    }
  }

  // Обработчик выбора камеры
  const handleCameraSelect = (cameraId: string) => {
    setSelectedCamera(cameraId === selectedCamera ? null : cameraId)
  }

  // Обработчик переключения полноэкранного режима
  const toggleFullscreen = (cameraId: string) => {
    setFullscreenCamera(cameraId === fullscreenCamera ? null : cameraId)
  }

  // Обработчик обновления списка камер
  const handleRefresh = () => {
    setRefreshing(true)
  }

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
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Камеры</h1>
            <p className="text-muted-foreground mt-1">Управление и мониторинг камер видеонаблюдения</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск камер..."
                className="pl-10 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Фильтры камер</h4>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Статус</h5>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-online"
                          checked={filterStatus.includes("online")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterStatus([...filterStatus, "online"])
                            } else {
                              setFilterStatus(filterStatus.filter((s) => s !== "online"))
                            }
                          }}
                        />
                        <label
                          htmlFor="status-online"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Онлайн
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-offline"
                          checked={filterStatus.includes("offline")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterStatus([...filterStatus, "offline"])
                            } else {
                              setFilterStatus(filterStatus.filter((s) => s !== "offline"))
                            }
                          }}
                        />
                        <label
                          htmlFor="status-offline"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Не доступна
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="status-disabled"
                          checked={filterStatus.includes("disabled")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterStatus([...filterStatus, "disabled"])
                            } else {
                              setFilterStatus(filterStatus.filter((s) => s !== "disabled"))
                            }
                          }}
                        />
                        <label
                          htmlFor="status-disabled"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Отключена
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Возможности</h5>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ptz-enabled"
                          checked={filterPTZ === true}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterPTZ(true)
                            } else {
                              setFilterPTZ(null)
                            }
                          }}
                        />
                        <label
                          htmlFor="ptz-enabled"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          С поддержкой PTZ
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="ptz-disabled"
                          checked={filterPTZ === false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterPTZ(false)
                            } else {
                              setFilterPTZ(null)
                            }
                          }}
                        />
                        <label
                          htmlFor="ptz-disabled"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Без поддержки PTZ
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Тип потока</h5>
                    <Select value={streamType} onValueChange={(value: any) => setStreamType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип потока" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mock">Тестовый поток</SelectItem>
                        <SelectItem value="mjpeg">MJPEG поток</SelectItem>
                        <SelectItem value="hls">HLS поток</SelectItem>
                        <SelectItem value="webrtc">WebRTC поток</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(streamType === "hls" || streamType === "webrtc") && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Кодек</h5>
                      <Select value={codec} onValueChange={(value: any) => setCodec(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите кодек" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Автоматически</SelectItem>
                          <SelectItem value="h264">H.264</SelectItem>
                          <SelectItem value="h265">H.265 (HEVC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterStatus(["online", "offline", "disabled"])
                        setFilterPTZ(null)
                      }}
                    >
                      Сбросить
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        document.querySelector("[data-radix-collection-item]")?.click() // Закрыть Popover
                      }}
                    >
                      Применить
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Обновить список камер</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Макет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x1">
                  <div className="flex items-center">
                    <Grid className="mr-2 h-4 w-4" />
                    <span>1 x 1</span>
                  </div>
                </SelectItem>
                <SelectItem value="2x2">
                  <div className="flex items-center">
                    <Grid2X2 className="mr-2 h-4 w-4" />
                    <span>2 x 2</span>
                  </div>
                </SelectItem>
                <SelectItem value="3x3">
                  <div className="flex items-center">
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    <span>3 x 3</span>
                  </div>
                </SelectItem>
                <SelectItem value="4x4">
                  <div className="flex items-center">
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    <span>4 x 4</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh">Автообновление</Label>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid" className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="grid">
              <Grid2X2 className="mr-2 h-4 w-4" />
              Сетка
            </TabsTrigger>
            <TabsTrigger value="list">
              <Grid className="mr-2 h-4 w-4" />
              Список
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="flex-1 p-6 overflow-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-4 bg-destructive/10 text-destructive rounded-md"
            >
              {error}
            </motion.div>
          )}

          {fullscreenCamera ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-full">
              <div className="absolute inset-0 flex items-center justify-center bg-black rounded-lg overflow-hidden">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <VideoStream
                    cameraId={fullscreenCamera}
                    serverUrl={authData?.serverUrl}
                    authHeader={authData?.authHeader}
                    streamType={streamType}
                    codec={codec}
                    width="100%"
                    height="100%"
                    controls={true}
                  />
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="icon" onClick={() => toggleFullscreen(fullscreenCamera)}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
              {cameras.find((c) => c.id === fullscreenCamera)?.ptzEnabled && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <PTZControls
                    cameraId={fullscreenCamera}
                    serverUrl={authData?.serverUrl}
                    authHeader={authData?.authHeader}
                  />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <div className="bg-black/60 backdrop-blur-sm text-white p-2 rounded-md">
                  <h3 className="font-medium">{cameras.find((c) => c.id === fullscreenCamera)?.name}</h3>
                  <p className="text-sm text-gray-300">{cameras.find((c) => c.id === fullscreenCamera)?.description}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={`grid ${getGridClass()} gap-6`}>
              {loading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Skeleton className="w-full aspect-video rounded-lg" />
                    </motion.div>
                  ))
              ) : filteredCameras.length > 0 ? (
                filteredCameras.map((camera, index) => (
                  <motion.div
                    key={camera.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`overflow-hidden hover:shadow-md transition-shadow ${selectedCamera === camera.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => handleCameraSelect(camera.id)}
                    >
                      <CardContent className="p-0 relative">
                        <div className="aspect-video bg-black relative">
                          {camera.status === "online" ? (
                            <VideoStream
                              cameraId={camera.id}
                              serverUrl={authData?.serverUrl}
                              authHeader={authData?.authHeader}
                              streamType={streamType}
                              codec={codec}
                              width="100%"
                              height="100%"
                              controls={false}
                              muted={true}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-white font-medium">{getStatusText(camera.status)}</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/dashboard/archive?cameraId=${camera.id}`)
                                }}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Архив
                              </DropdownMenuItem>
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
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFullscreen(camera.id)
                            }}
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white p-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">{camera.name}</h3>
                            <Badge className={`${getStatusColor(camera.status)} text-xs`}>
                              {getStatusText(camera.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-300 mt-1 line-clamp-1">
                            {camera.description || camera.model}
                          </p>
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
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
                  <EyeOff className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Камеры не найдены</h3>
                  <p className="text-muted-foreground max-w-md">
                    Не найдено камер, соответствующих заданным критериям поиска и фильтрации.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setFilterStatus(["online", "offline", "disabled"])
                      setFilterPTZ(null)
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="flex-1 p-6 overflow-auto">
          <div className="space-y-4">
            {loading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Skeleton className="w-full h-20" />
                  </motion.div>
                ))
            ) : filteredCameras.length > 0 ? (
              filteredCameras.map((camera, index) => (
                <motion.div
                  key={camera.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className={`hover:shadow-md transition-shadow ${selectedCamera === camera.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => handleCameraSelect(camera.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-24 h-16 bg-black relative flex-shrink-0 rounded-md overflow-hidden">
                        {camera.status === "online" ? (
                          <VideoStream
                            cameraId={camera.id}
                            serverUrl={authData?.serverUrl}
                            authHeader={authData?.authHeader}
                            streamType={streamType}
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
                          <Badge className={`${getStatusColor(camera.status)} ml-2`}>
                            {getStatusText(camera.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {camera.description || camera.model}
                        </p>
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
                          {camera.archiveStart && (
                            <span className="text-xs text-muted-foreground">
                              Архив с {new Date(camera.archiveStart).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Архив</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFullscreen(camera.id)
                                }}
                              >
                                <Expand className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Полный экран</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

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
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <EyeOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Камеры не найдены</h3>
                <p className="text-muted-foreground max-w-md">
                  Не найдено камер, соответствующих заданным критериям поиска и фильтрации.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterStatus(["online", "offline", "disabled"])
                    setFilterPTZ(null)
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedCamera && !fullscreenCamera && (
        <div className="border-t p-6 bg-card">
          <CameraInfo
            camera={cameras.find((c) => c.id === selectedCamera)!}
            onClose={() => setSelectedCamera(null)}
            serverUrl={authData?.serverUrl}
            authHeader={authData?.authHeader}
          />
        </div>
      )}
    </div>
  )
}

