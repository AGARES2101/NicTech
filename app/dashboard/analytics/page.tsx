"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays } from "date-fns"
import { ru } from "date-fns/locale"
import { motion } from "framer-motion"
import { AreaChart, BarChart } from "@/components/charts"

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authData, setAuthData] = useState<any>(null)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [selectedCamera, setSelectedCamera] = useState<string>("all")
  const [selectedEventType, setSelectedEventType] = useState<string>("all")
  const [cameras, setCameras] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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

        // Имитация загрузки аналитических данных
        await new Promise((resolve) => setTimeout(resolve, 1000))
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

  // Форматирование диапазона дат
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) {
      return "Выберите период"
    }

    return `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`
  }

  // Данные для графиков
  const eventsByTimeData = [
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

  const eventsByTypeData = [
    { name: "Движение", value: 42 },
    { name: "Лица", value: 28 },
    { name: "Номера", value: 15 },
    { name: "Саботаж", value: 3 },
    { name: "Ошибки", value: 7 },
  ]

  const eventsByDayData = [
    { name: format(subDays(new Date(), 6), "dd.MM"), value: 24 },
    { name: format(subDays(new Date(), 5), "dd.MM"), value: 32 },
    { name: format(subDays(new Date(), 4), "dd.MM"), value: 18 },
    { name: format(subDays(new Date(), 3), "dd.MM"), value: 29 },
    { name: format(subDays(new Date(), 2), "dd.MM"), value: 35 },
    { name: format(subDays(new Date(), 1), "dd.MM"), value: 22 },
    { name: format(new Date(), "dd.MM"), value: 27 },
  ]

  const storageUsageData = [
    { name: "Камера 1", value: 28 },
    { name: "Камера 2", value: 22 },
    { name: "Камера 3", value: 15 },
    { name: "Камера 4", value: 12 },
    { name: "Другие", value: 23 },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Аналитика</h1>
            <p className="text-muted-foreground mt-1">Статистика и аналитические отчеты</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px] justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => range && setDateRange(range)}
                  numberOfMonths={2}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все камеры" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все камеры</SelectItem>
                {cameras.map((camera) => (
                  <SelectItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все события" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все события</SelectItem>
                <SelectItem value="motion">Движение</SelectItem>
                <SelectItem value="face">Распознавание лиц</SelectItem>
                <SelectItem value="plate">Распознавание номеров</SelectItem>
                <SelectItem value="sabotage">Саботаж</SelectItem>
                <SelectItem value="error">Ошибки</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button>
              <Download className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="mr-2 h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="events">
              <LineChart className="mr-2 h-4 w-4" />
              События
            </TabsTrigger>
            <TabsTrigger value="storage">
              <PieChart className="mr-2 h-4 w-4" />
              Хранилище
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="col-span-full"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Активность системы</CardTitle>
                  <CardDescription>Количество событий по дням</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <AreaChart data={eventsByDayData} />
                    </div>
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
                <CardHeader>
                  <CardTitle>События по типам</CardTitle>
                  <CardDescription>Распределение событий по категориям</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <BarChart data={eventsByTypeData} />
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
                <CardHeader>
                  <CardTitle>События по времени</CardTitle>
                  <CardDescription>Распределение событий по времени суток</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <AreaChart data={eventsByTimeData} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Сводная статистика</CardTitle>
                <CardDescription>Основные показатели за выбранный период</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-muted-foreground">Всего событий</p>
                          <p className="text-3xl font-bold">95</p>
                          <p className="text-xs text-muted-foreground">+12% по сравнению с прошлым периодом</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-muted-foreground">Распознано лиц</p>
                          <p className="text-3xl font-bold">28</p>
                          <p className="text-xs text-muted-foreground">+5% по сравнению с прошлым периодом</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-muted-foreground">Распознано номеров</p>
                          <p className="text-3xl font-bold">15</p>
                          <p className="text-xs text-muted-foreground">-3% по сравнению с прошлым периодом</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-medium text-muted-foreground">Тревожные события</p>
                          <p className="text-3xl font-bold">7</p>
                          <p className="text-xs text-muted-foreground">-15% по сравнению с прошлым периодом</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="col-span-full"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Детальная статистика событий</CardTitle>
                      <CardDescription>Распределение событий по дням и типам</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Фильтры
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Поделиться
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <div className="h-[400px]">
                      <AreaChart data={eventsByDayData} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Журнал событий</CardTitle>
                <CardDescription>Подробный список событий за выбранный период</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                ) : (
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Дата и время
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Тип события
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Камера
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Описание
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">15.05.2023 10:30:45</td>
                          <td className="px-6 py-4">Движение</td>
                          <td className="px-6 py-4">Камера 1 - Вход</td>
                          <td className="px-6 py-4">Обнаружено движение в зоне наблюдения</td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">15.05.2023 11:15:22</td>
                          <td className="px-6 py-4">Саботаж</td>
                          <td className="px-6 py-4">Камера 2 - Парковка</td>
                          <td className="px-6 py-4">Обнаружена попытка саботажа камеры</td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">15.05.2023 12:45:10</td>
                          <td className="px-6 py-4">Распознавание лица</td>
                          <td className="px-6 py-4">Камера 1 - Вход</td>
                          <td className="px-6 py-4">Распознано лицо: Иванов Иван</td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">15.05.2023 14:20:05</td>
                          <td className="px-6 py-4">Ошибка подключения</td>
                          <td className="px-6 py-4">Камера 3 - Склад</td>
                          <td className="px-6 py-4">Потеряно соединение с камерой</td>
                        </tr>
                        <tr className="bg-card">
                          <td className="px-6 py-4">15.05.2023 15:10:30</td>
                          <td className="px-6 py-4">Распознавание номера</td>
                          <td className="px-6 py-4">Камера 2 - Парковка</td>
                          <td className="px-6 py-4">Распознан номер: А123ВС77</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">Показано 5 из 95 записей</div>
                <Button variant="outline" size="sm">
                  Показать все
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="storage" className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Использование хранилища</CardTitle>
                  <CardDescription>Распределение использования дискового пространства</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <BarChart data={storageUsageData} />
                    </div>
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
                <CardHeader>
                  <CardTitle>Статистика хранилища</CardTitle>
                  <CardDescription>Основные показатели использования хранилища</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Общий объем</span>
                          <span className="text-sm">2.0 TB</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: "68%" }}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground">Использовано: 1.36 TB (68%)</span>
                          <span className="text-xs text-muted-foreground">Свободно: 0.64 TB (32%)</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-4">Использование по дискам</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Диск 1</span>
                              <span className="text-xs">500 GB</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                            </div>
                            <div className="flex justify-end mt-1">
                              <span className="text-xs text-muted-foreground">425 GB (85%)</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Диск 2</span>
                              <span className="text-xs">500 GB</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                            </div>
                            <div className="flex justify-end mt-1">
                              <span className="text-xs text-muted-foreground">360 GB (72%)</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Диск 3</span>
                              <span className="text-xs">1 TB</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: "58%" }}></div>
                            </div>
                            <div className="flex justify-end mt-1">
                              <span className="text-xs text-muted-foreground">580 GB (58%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Прогноз использования хранилища</CardTitle>
                <CardDescription>Оценка заполнения хранилища на основе текущих тенденций</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <AreaChart
                      data={[
                        { name: "Сейчас", value: 68 },
                        { name: "+1 день", value: 70 },
                        { name: "+2 дня", value: 72 },
                        { name: "+3 дня", value: 74 },
                        { name: "+4 дня", value: 76 },
                        { name: "+5 дней", value: 78 },
                        { name: "+6 дней", value: 80 },
                        { name: "+7 дней", value: 82 },
                      ]}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  При текущей интенсивности записи хранилище будет заполнено через 14 дней
                </div>
                <Button variant="outline" size="sm">
                  Настроить политики хранения
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

