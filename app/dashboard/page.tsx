"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Camera,
  Clock,
  Eye,
  FileText,
  Map,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { AreaChart, BarChart } from "@/components/charts"
import { VideoStream } from "@/components/video-stream"
import { logger, LogCategory } from "@/lib/logger"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cameras, setCameras] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [authData, setAuthData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalCameras: 0,
    onlineCameras: 0,
    totalEvents: 0,
    criticalEvents: 0,
    storageUsed: 0,
    storageTotal: 0,
    recognizedFaces: 0,
    recognizedPlates: 0,
  })

  // Получение данных авторизации из sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("nictech-auth")
    if (auth) {
      setAuthData(JSON.parse(auth))
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true)

        // Логируем начало загрузки
        logger.info(LogCategory.VIDEO, "Начало загрузки списка камер для дашборда")

        // Получаем данные авторизации из sessionStorage
        const authDataStr = sessionStorage.getItem("nictech-auth")

        if (!authDataStr) {
          logger.warn(LogCategory.AUTH, "Отсутствуют данные авторизации для загрузки камер")

          // Используем мок-данные в случае отсутствия авторизации
          const mockCameras = Array.from({ length: 4 }, (_, i) => ({
            id: `mock-camera-${i + 1}`,
            name: `Камера ${i + 1}`,
            status: i < 3 ? "online" : "offline",
            location: "Мок-расположение",
          }))
          setCameras(mockCameras)
          return
        }

        const authData = JSON.parse(authDataStr)

        // Запрашиваем список камер с сервера
        const response = await fetch("/api/cameras", {
          headers: {
            "server-url": authData.serverUrl,
            authorization: `Basic ${btoa(`${authData.username}:${authData.password}`)}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Ошибка получения списка камер: ${response.statusText}`)
        }

        const data = await response.json()

        // Логируем успешную загрузку
        logger.info(LogCategory.VIDEO, `Успешно загружено ${data.length} камер для дашборда`)

        setCameras(data)
      } catch (error) {
        console.error("Ошибка загрузки списка камер:", error)

        // Логируем ошибку
        logger.error(LogCategory.VIDEO, "Ошибка загрузки списка камер для дашборда", error)

        // Используем мок-данные в случае ошибки
        const mockCameras = Array.from({ length: 4 }, (_, i) => ({
          id: `mock-camera-${i + 1}`,
          name: `Камера ${i + 1}`,
          status: "online",
          location: "Мок-расположение",
        }))
        setCameras(mockCameras)
      } finally {
        setLoading(false)
      }
    }

    fetchCameras()
  }, [])

  // Загрузка данных
  useEffect(() => {
    if (!authData) {
      // Если нет данных авторизации, используем мок-данные
      setStats({
        totalCameras: cameras.length,
        onlineCameras: cameras.filter((c: any) => c.status === "online").length,
        totalEvents: 0,
        criticalEvents: 0,
        storageUsed: 68,
        storageTotal: 100,
        recognizedFaces: Math.floor(Math.random() * 50) + 10,
        recognizedPlates: Math.floor(Math.random() * 30) + 5,
      })
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Загрузка событий
        try {
          const eventsResponse = await fetch("/api/events?lastMinutes=60", {
            headers: {
              "server-url": authData.serverUrl,
              authorization: `Basic ${btoa(`${authData.username}:${authData.password}`)}`,
            },
          })

          if (!eventsResponse.ok) {
            throw new Error("Ошибка получения событий")
          }

          const eventsData = await eventsResponse.json()
          setEvents(eventsData)

          // Установка статистики
          setStats({
            totalCameras: cameras.length,
            onlineCameras: cameras.filter((c: any) => c.status === "online").length,
            totalEvents: eventsData.length,
            criticalEvents: eventsData.filter((e: any) => e.level === "alarm").length,
            storageUsed: 68,
            storageTotal: 100,
            recognizedFaces: Math.floor(Math.random() * 50) + 10,
            recognizedPlates: Math.floor(Math.random() * 30) + 5,
          })
        } catch (error) {
          console.error("Ошибка загрузки событий:", error)
          logger.error(LogCategory.API, "Ошибка загрузки событий", error)

          // Установка статистики с мок-данными для событий
          setStats({
            totalCameras: cameras.length,
            onlineCameras: cameras.filter((c: any) => c.status === "online").length,
            totalEvents: 0,
            criticalEvents: 0,
            storageUsed: 68,
            storageTotal: 100,
            recognizedFaces: Math.floor(Math.random() * 50) + 10,
            recognizedPlates: Math.floor(Math.random() * 30) + 5,
          })
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
        logger.error(LogCategory.API, "Ошибка загрузки данных для дашборда", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authData, cameras])

  // Данные для графиков
  const eventChartData = [
    { name: "00:00", value: 5 },
    { name: "02:00", value: 3 },
    { name: "04:00", value: 2 },
    { name: "06:00", value: 4 },
    { name: "08:00", value: 12 },
    { name: "10:00", value: 15 },
    { name: "12:00", value: 10 },
    { name: "14:00", value: 8 },
    { name: "16:00", value: 13 },
    { name: "18:00", value: 18 },
    { name: "20:00", value: 11 },
    { name: "22:00", value: 7 },
  ]

  const detectionChartData = [
    { name: "Лица", value: stats.recognizedFaces },
    { name: "Номера", value: stats.recognizedPlates },
    { name: "Объекты", value: 23 },
    { name: "Движение", value: 42 },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Обзор системы</h1>
            <p className="text-muted-foreground mt-1">Добро пожаловать в NicTech Enterprise</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск..." className="pl-10 w-[250px]" />
            </div>
            <Button onClick={() => router.push("/dashboard/cameras")}>
              <Camera className="mr-2 h-4 w-4" />
              Камеры
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Камеры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-16" /> : stats.onlineCameras}/{stats.totalCameras}
                    </p>
                    <p className="text-xs text-muted-foreground">Онлайн</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                </div>
                {!loading && (
                  <Progress
                    value={(stats.onlineCameras / stats.totalCameras) * 100}
                    className="h-1 mt-4"
                    indicatorClassName="bg-primary"
                  />
                )}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">События</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-16" /> : stats.totalEvents}
                    </p>
                    <p className="text-xs text-muted-foreground">За последний час</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-warning" />
                  </div>
                </div>
                {!loading && stats.criticalEvents > 0 && (
                  <div className="flex items-center gap-2 mt-4 text-warning text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{stats.criticalEvents} критических</span>
                  </div>
                )}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Хранилище</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-16" /> : `${stats.storageUsed}%`}
                    </p>
                    <p className="text-xs text-muted-foreground">Использовано</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-success" />
                  </div>
                </div>
                {!loading && (
                  <Progress
                    value={stats.storageUsed}
                    className="h-1 mt-4"
                    indicatorClassName={stats.storageUsed > 80 ? "bg-destructive" : "bg-success"}
                  />
                )}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Распознавание</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-16" /> : stats.recognizedFaces + stats.recognizedPlates}
                    </p>
                    <p className="text-xs text-muted-foreground">Объектов сегодня</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                </div>
                {!loading && (
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      <span>Лица: {stats.recognizedFaces}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-warning"></span>
                      <span>Номера: {stats.recognizedPlates}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Активность системы</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Сегодня</DropdownMenuItem>
                      <DropdownMenuItem>Неделя</DropdownMenuItem>
                      <DropdownMenuItem>Месяц</DropdownMenuItem>
                      <DropdownMenuItem>Экспорт данных</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>Количество событий по времени</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <AreaChart data={eventChartData} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Распознавание</CardTitle>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Типы распознанных объектов</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <BarChart data={detectionChartData} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Последние события</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/events")}>
                    Все события
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="rounded-full p-2 bg-muted">
                          {event.level === "alarm" ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : event.level === "notification" ? (
                            <Bell className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{event.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                event.level === "alarm"
                                  ? "destructive"
                                  : event.level === "notification"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {event.level === "alarm"
                                ? "Тревога"
                                : event.level === "notification"
                                  ? "Уведомление"
                                  : "Ошибка"}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{event.cameraName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">Нет событий</h3>
                    <p className="text-muted-foreground">События не найдены</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Активные камеры</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/cameras")}>
                    Все камеры
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />)
                ) : cameras.length > 0 ? (
                  <div className="space-y-4">
                    {cameras.slice(0, 5).map((camera) => (
                      <div key={camera.id} className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-black relative flex-shrink-0 rounded-md overflow-hidden">
                          {camera.status === "online" ? (
                            <VideoStream
                              cameraId={camera.id}
                              serverUrl={authData?.serverUrl}
                              authHeader={authData?.authHeader}
                              streamType="mock"
                              width="100%"
                              height="100%"
                              controls={false}
                              muted={true}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-white text-xs">Офлайн</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{camera.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{camera.description || camera.model}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={camera.status === "online" ? "success" : "destructive"}
                              className="h-5 px-1.5"
                            >
                              {camera.status === "online" ? "Онлайн" : "Офлайн"}
                            </Badge>
                            {camera.ptzEnabled && (
                              <Badge variant="outline" className="h-5 px-1.5">
                                PTZ
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">Нет камер</h3>
                    <p className="text-muted-foreground">Камеры не найдены</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Быстрый доступ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2"
                          onClick={() => router.push("/dashboard/cameras")}
                        >
                          <Camera className="h-6 w-6" />
                          <span>Камеры</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Просмотр всех камер</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2"
                          onClick={() => router.push("/dashboard/archive")}
                        >
                          <Clock className="h-6 w-6" />
                          <span>Архив</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Просмотр архивных записей</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2"
                          onClick={() => router.push("/dashboard/map")}
                        >
                          <Map className="h-6 w-6" />
                          <span>Карта</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Интерактивная карта объектов</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2"
                          onClick={() => router.push("/dashboard/analytics")}
                        >
                          <BarChart3 className="h-6 w-6" />
                          <span>Аналитика</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Аналитические отчеты</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2"
                          onClick={() => router.push("/dashboard/access")}
                        >
                          <Users className="h-6 w-6" />
                          <span>Доступ</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Контроль доступа</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-24 flex flex-col items-center justify-center gap-2"
                          onClick={() => router.push("/dashboard/reports")}
                        >
                          <FileText className="h-6 w-6" />
                          <span>Отчеты</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Формирование отчетов</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
