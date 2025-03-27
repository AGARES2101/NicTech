"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Layers, MapPin, Plus, Search, Settings, Share2, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authData, setAuthData] = useState<any>(null)
  const [cameras, setCameras] = useState<any[]>([])
  const [selectedFloor, setSelectedFloor] = useState("1")
  const [selectedBuilding, setSelectedBuilding] = useState("main")
  const [zoom, setZoom] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  // Получение данных авторизации из sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("nictech-auth")
    if (auth) {
      setAuthData(JSON.parse(auth))
    } else {
      router.push("/login")
    }
  }, [router])

  // Загрузка данных
  useEffect(() => {
    if (!authData) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Загрузка камер
        const camerasResponse = await fetch("/api/cameras", {
          headers: {
            "server-url": authData.serverUrl,
            authorization: authData.authHeader,
          },
        })

        if (!camerasResponse.ok) {
          throw new Error("Ошибка получения списка камер")
        }

        const camerasData = await camerasResponse.json()
        setCameras(camerasData)

        // Имитация загрузки карты
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authData])

  // Увеличение масштаба
  const handleZoomIn = () => {
    if (zoom < 2) {
      setZoom(zoom + 0.2)
    }
  }

  // Уменьшение масштаба
  const handleZoomOut = () => {
    if (zoom > 0.6) {
      setZoom(zoom - 0.2)
    }
  }

  // Фильтрация камер по поисковому запросу
  const filteredCameras = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (camera.description && camera.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Получение URL для снимка камеры
  const getCameraSnapshotUrl = (cameraId: string) => {
    if (!authData) return ""

    let url = `/api/snapshot?id=${cameraId}&viewSize=160x120`
    // Добавляем случайное число для предотвращения кэширования
    url += `&rand=${Math.random()}`

    return url
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Карта объектов</h1>
            <p className="text-muted-foreground mt-1">Интерактивная карта расположения камер и устройств</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск на карте..."
                className="pl-10 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите здание" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Главное здание</SelectItem>
                <SelectItem value="warehouse">Склад</SelectItem>
                <SelectItem value="parking">Парковка</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите этаж" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 этаж</SelectItem>
                <SelectItem value="2">2 этаж</SelectItem>
                <SelectItem value="3">3 этаж</SelectItem>
              </SelectContent>
            </Select>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить устройство
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Устройства на карте</h3>
            <Tabs defaultValue="cameras">
              <TabsList className="w-full">
                <TabsTrigger value="cameras" className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Камеры
                </TabsTrigger>
                <TabsTrigger value="sensors" className="flex-1">
                  <Layers className="mr-2 h-4 w-4" />
                  Датчики
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cameras" className="mt-4 space-y-3">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : filteredCameras.length > 0 ? (
                  filteredCameras.map((camera) => (
                    <Card key={camera.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-16 h-12 bg-black relative flex-shrink-0 rounded-md overflow-hidden">
                          <img
                            src={getCameraSnapshotUrl(camera.id) || "/placeholder.svg?height=120&width=160"}
                            alt={camera.name}
                            className="w-full h-full object-cover"
                          />
                          {camera.status !== "online" && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-white text-xs">Офлайн</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{camera.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{camera.description || camera.model}</p>
                          <Badge
                            variant={camera.status === "online" ? "success" : "destructive"}
                            className="mt-1 text-xs"
                          >
                            {camera.status === "online" ? "Онлайн" : "Офлайн"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">Камеры не найдены</div>
                )}
              </TabsContent>

              <TabsContent value="sensors" className="mt-4">
                <div className="text-center p-4 text-muted-foreground">Датчики не настроены</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-4/5 h-4/5" />
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
              <div
                className="relative w-full h-full bg-muted/20 overflow-hidden"
                style={{
                  backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: `scale(${zoom})`,
                  transition: "transform 0.3s ease",
                }}
              >
                {/* Здесь будет интерактивная карта */}
                <div className="absolute top-1/4 left-1/4">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success animate-pulse" />
                  </div>
                </div>

                <div className="absolute top-3/4 left-3/4">
                  <div className="relative">
                    <MapPin className="h-8 w-8 text-destructive" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Увеличить</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Уменьшить</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Поделиться картой</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Настройки карты</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="absolute bottom-4 left-4 bg-card p-2 rounded-md shadow-md text-xs">
                Здание:{" "}
                {selectedBuilding === "main"
                  ? "Главное здание"
                  : selectedBuilding === "warehouse"
                    ? "Склад"
                    : "Парковка"}{" "}
                | Этаж: {selectedFloor} | Масштаб: {Math.round(zoom * 100)}%
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

