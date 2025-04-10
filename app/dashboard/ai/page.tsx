"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Brain,
  Camera,
  ChevronRight,
  Cpu,
  Database,
  FileText,
  Fingerprint,
  History,
  ImagePlus,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function AIPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authData, setAuthData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Имитация данных распознанных лиц
  const recognizedFaces = [
    {
      id: "1",
      name: "Иванов Иван",
      confidence: 98.5,
      timestamp: "2023-05-15T10:30:45",
      cameraId: "1",
      cameraName: "Камера 1 - Вход",
      imageUrl: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "2",
      name: "Петров Петр",
      confidence: 95.2,
      timestamp: "2023-05-15T11:15:22",
      cameraId: "2",
      cameraName: "Камера 2 - Парковка",
      imageUrl: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "3",
      name: "Сидорова Анна",
      confidence: 97.8,
      timestamp: "2023-05-15T12:45:10",
      cameraId: "1",
      cameraName: "Камера 1 - Вход",
      imageUrl: "/placeholder.svg?height=120&width=120",
    },
    {
      id: "4",
      name: "Неизвестный",
      confidence: 65.3,
      timestamp: "2023-05-15T14:20:05",
      cameraId: "3",
      cameraName: "Камера 3 - Склад",
      imageUrl: "/placeholder.svg?height=120&width=120",
    },
  ]

  // Имитация данных распознанных номеров
  const recognizedPlates = [
    {
      id: "1",
      plateNumber: "А123ВС77",
      confidence: 99.1,
      timestamp: "2023-05-15T09:30:45",
      cameraId: "2",
      cameraName: "Камера 2 - Парковка",
      imageUrl: "/placeholder.svg?height=80&width=160",
    },
    {
      id: "2",
      plateNumber: "В456АХ99",
      confidence: 97.5,
      timestamp: "2023-05-15T10:15:22",
      cameraId: "2",
      cameraName: "Камера 2 - Парковка",
      imageUrl: "/placeholder.svg?height=80&width=160",
    },
    {
      id: "3",
      plateNumber: "Е789КМ50",
      confidence: 98.3,
      timestamp: "2023-05-15T11:45:10",
      cameraId: "2",
      cameraName: "Камера 2 - Парковка",
      imageUrl: "/placeholder.svg?height=80&width=160",
    },
    {
      id: "4",
      plateNumber: "О321ТР77",
      confidence: 96.7,
      timestamp: "2023-05-15T13:20:05",
      cameraId: "2",
      cameraName: "Камера 2 - Парковка",
      imageUrl: "/placeholder.svg?height=80&width=160",
    },
  ]

  // Имитация данных моделей ИИ
  const aiModels = [
    {
      id: "1",
      name: "Распознавание лиц",
      description: "Модель для распознавания лиц на видеопотоке",
      type: "face",
      status: "active",
      version: "2.3.1",
      accuracy: 97.5,
      lastUpdated: "2023-04-15",
    },
    {
      id: "2",
      name: "Распознавание номеров",
      description: "Модель для распознавания автомобильных номеров",
      type: "plate",
      status: "active",
      version: "1.8.5",
      accuracy: 98.2,
      lastUpdated: "2023-03-22",
    },
    {
      id: "3",
      name: "Детекция объектов",
      description: "Модель для обнаружения и классификации объектов",
      type: "object",
      status: "active",
      version: "3.1.2",
      accuracy: 94.8,
      lastUpdated: "2023-05-01",
    },
    {
      id: "4",
      name: "Анализ поведения",
      description: "Модель для анализа поведения людей на видео",
      type: "behavior",
      status: "inactive",
      version: "0.9.3",
      accuracy: 85.6,
      lastUpdated: "2023-02-10",
    },
  ]

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

        // Имитация загрузки данных
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchData()
  }, [authData, refreshing])

  // Обработчик обновления данных
  const handleRefresh = () => {
    setRefreshing(true)
  }

  // Форматирование даты и времени
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString("ru-RU")
    } catch (e) {
      return dateTimeStr
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Искусственный интеллект</h1>
            <Badge variant="outline" className="ml-2">
              NEW
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                className="pl-10 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Загрузить изображение
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="dashboard">
              <Sparkles className="mr-2 h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="face-recognition">
              <Fingerprint className="mr-2 h-4 w-4" />
              Распознавание лиц
            </TabsTrigger>
            <TabsTrigger value="plate-recognition">
              <FileText className="mr-2 h-4 w-4" />
              Распознавание номеров
            </TabsTrigger>
            <TabsTrigger value="models">
              <Brain className="mr-2 h-4 w-4" />
              Модели ИИ
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Распознано лиц</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : "128"}</p>
                        <p className="text-xs text-muted-foreground">За последние 24 часа</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Fingerprint className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Распознано номеров</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : "85"}</p>
                        <p className="text-xs text-muted-foreground">За последние 24 часа</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Точность распознавания</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : "96.8%"}</p>
                        <p className="text-xs text-muted-foreground">Средняя точность</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Активные модели</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : "3/4"}</p>
                        <p className="text-xs text-muted-foreground">Запущено</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Cpu className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Последние распознанные лица</CardTitle>
                    <CardDescription>Недавно распознанные лица с камер</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recognizedFaces.slice(0, 3).map((face) => (
                          <div key={face.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                              <img
                                src={face.imageUrl || "/placeholder.svg"}
                                alt={face.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{face.name}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <p className="text-xs text-muted-foreground">{face.cameraName}</p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(face.timestamp)}</p>
                              </div>
                            </div>
                            <Badge variant="outline">{face.confidence.toFixed(1)}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.querySelector('[data-value="face-recognition"]')?.click()}
                    >
                      Показать все
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Последние распознанные номера</CardTitle>
                    <CardDescription>Недавно распознанные автомобильные номера</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recognizedPlates.slice(0, 3).map((plate) => (
                          <div key={plate.id} className="flex items-center gap-4">
                            <div className="w-16 h-10 rounded-md overflow-hidden bg-muted">
                              <img
                                src={plate.imageUrl || "/placeholder.svg"}
                                alt={plate.plateNumber}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{plate.plateNumber}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <p className="text-xs text-muted-foreground">{plate.cameraName}</p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(plate.timestamp)}</p>
                              </div>
                            </div>
                            <Badge variant="outline">{plate.confidence.toFixed(1)}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.querySelector('[data-value="plate-recognition"]')?.click()}
                    >
                      Показать все
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Модели искусственного интеллекта</CardTitle>
                  <CardDescription>Статус и производительность моделей ИИ</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {aiModels.map((model) => (
                        <div key={model.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                {model.type === "face" ? (
                                  <Fingerprint className="h-4 w-4 text-primary" />
                                ) : model.type === "plate" ? (
                                  <FileText className="h-4 w-4 text-primary" />
                                ) : model.type === "object" ? (
                                  <Layers className="h-4 w-4 text-primary" />
                                ) : (
                                  <Brain className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{model.name}</p>
                                <p className="text-xs text-muted-foreground">Версия {model.version}</p>
                              </div>
                            </div>
                            <Badge variant={model.status === "active" ? "success" : "secondary"}>
                              {model.status === "active" ? "Активна" : "Неактивна"}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Точность</span>
                              <span>{model.accuracy}%</span>
                            </div>
                            <Progress value={model.accuracy} className="h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.querySelector('[data-value="models"]')?.click()}
                  >
                    Управление моделями
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="face-recognition" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Распознавание лиц</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Загрузить изображение
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить лицо
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Распознанные лица</CardTitle>
                <CardDescription>Список недавно распознанных лиц с камер</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recognizedFaces.map((face) => (
                      <motion.div
                        key={face.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                              <img
                                src={face.imageUrl || "/placeholder.svg"}
                                alt={face.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{face.name}</h3>
                                <Badge variant={face.confidence > 90 ? "success" : "warning"}>
                                  {face.confidence.toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Camera className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">{face.cameraName}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <History className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">{formatDateTime(face.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Настройки</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Database className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Добавить в базу</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">Показано 4 из 128 записей</div>
                <Button variant="outline" size="sm">
                  Показать все
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>База данных лиц</CardTitle>
                <CardDescription>Управление базой данных лиц для распознавания</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <Fingerprint className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">База данных лиц</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Здесь вы можете управлять базой данных лиц для распознавания. Добавляйте новые лица, редактируйте
                    существующие и настраивайте параметры распознавания.
                  </p>
                  <Button>Открыть базу данных лиц</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plate-recognition" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Распознавание номеров</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Загрузить изображение
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить номер
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Распознанные номера</CardTitle>
                <CardDescription>Список недавно распознанных автомобильных номеров</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recognizedPlates.map((plate) => (
                      <motion.div
                        key={plate.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-24 h-16 rounded-md overflow-hidden bg-muted">
                              <img
                                src={plate.imageUrl || "/placeholder.svg"}
                                alt={plate.plateNumber}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg">{plate.plateNumber}</h3>
                                <Badge variant={plate.confidence > 90 ? "success" : "warning"}>
                                  {plate.confidence.toFixed(1)}%
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <div className="flex items-center gap-1">
                                  <Camera className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">{plate.cameraName}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <History className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">{formatDateTime(plate.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Настройки</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Database className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Добавить в базу</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">Показано 4 из 85 записей</div>
                <Button variant="outline" size="sm">
                  Показать все
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>База данных номеров</CardTitle>
                <CardDescription>Управление базой данных автомобильных номеров</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">База данных номеров</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Здесь вы можете управлять базой данных автомобильных номеров. Добавляйте новые номера, редактируйте
                    существующие и настраивайте параметры распознавания.
                  </p>
                  <Button>Открыть базу данных номеров</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Модели искусственного интеллекта</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить модель
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                : aiModels.map((model, index) => (
                    <motion.div
                      key={model.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{model.name}</CardTitle>
                              <CardDescription>Версия {model.version}</CardDescription>
                            </div>
                            <Badge variant={model.status === "active" ? "success" : "secondary"}>
                              {model.status === "active" ? "Активна" : "Неактивна"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{model.description}</p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Точность</span>
                              <span>{model.accuracy}%</span>
                            </div>
                            <Progress value={model.accuracy} className="h-1.5" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Тип</p>
                              <p className="font-medium">
                                {model.type === "face"
                                  ? "Распознавание лиц"
                                  : model.type === "plate"
                                    ? "Распознавание номеров"
                                    : model.type === "object"
                                      ? "Детекция объектов"
                                      : model.type === "behavior"
                                        ? "Анализ поведения"
                                        : model.type}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Последнее обновление</p>
                              <p className="font-medium">{model.lastUpdated}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="outline">Настройки</Button>
                          {model.status === "active" ? (
                            <Button variant="destructive">Остановить</Button>
                          ) : (
                            <Button>Запустить</Button>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
