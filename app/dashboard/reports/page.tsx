"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Filter,
  LineChart,
  Mail,
  Printer,
  RefreshCw,
  Save,
  Search,
  Share2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subDays } from "date-fns"
import { ru } from "date-fns/locale"
import { motion } from "framer-motion"
import { AreaChart, BarChart } from "@/components/charts"

export default function ReportsPage() {
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
  const [selectedReport, setSelectedReport] = useState("events")
  const [refreshing, setRefreshing] = useState(false)

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

  // Форматирование диапазона дат
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) {
      return "Выберите период"
    }

    return `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`
  }

  // Данные для графиков
  const eventsByDayData = [
    { name: format(subDays(new Date(), 6), "dd.MM"), value: 24 },
    { name: format(subDays(new Date(), 5), "dd.MM"), value: 32 },
    { name: format(subDays(new Date(), 4), "dd.MM"), value: 18 },
    { name: format(subDays(new Date(), 3), "dd.MM"), value: 29 },
    { name: format(subDays(new Date(), 2), "dd.MM"), value: 35 },
    { name: format(subDays(new Date(), 1), "dd.MM"), value: 22 },
    { name: format(new Date(), "dd.MM"), value: 27 },
  ]

  const eventsByTypeData = [
    { name: "Движение", value: 42 },
    { name: "Лица", value: 28 },
    { name: "Номера", value: 15 },
    { name: "Саботаж", value: 3 },
    { name: "Ошибки", value: 7 },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Отчеты</h1>
            <p className="text-muted-foreground mt-1">Формирование и просмотр отчетов</p>
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

            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Тип отчета" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">События</SelectItem>
                <SelectItem value="access">Контроль доступа</SelectItem>
                <SelectItem value="storage">Хранилище</SelectItem>
                <SelectItem value="recognition">Распознавание</SelectItem>
                <SelectItem value="system">Система</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Создать отчет
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="templates" className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Шаблоны
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Save className="mr-2 h-4 w-4" />
              Сохраненные
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Calendar className="mr-2 h-4 w-4" />
              Запланированные
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="templates" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Шаблоны отчетов</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск шаблонов..." className="pl-10 w-[250px]" />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>События системы</CardTitle>
                      <CardDescription>Отчет по событиям системы за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <span className="text-sm">Включает графики и таблицы</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Предпросмотр
                      </Button>
                      <Button size="sm">Создать</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>Контроль доступа</CardTitle>
                      <CardDescription>Отчет по контролю доступа за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        <span className="text-sm">Включает графики и таблицы</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Предпросмотр
                      </Button>
                      <Button size="sm">Создать</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>Распознавание объектов</CardTitle>
                      <CardDescription>Отчет по распознаванию объектов за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <span className="text-sm">Включает графики и таблицы</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Предпросмотр
                      </Button>
                      <Button size="sm">Создать</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>Использование хранилища</CardTitle>
                      <CardDescription>Отчет по использованию хранилища за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <span className="text-sm">Включает графики и таблицы</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Предпросмотр
                      </Button>
                      <Button size="sm">Создать</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>Активность пользователей</CardTitle>
                      <CardDescription>Отчет по активности пользователей за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        <span className="text-sm">Включает графики и таблицы</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Предпросмотр
                      </Button>
                      <Button size="sm">Создать</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle>Системная производительность</CardTitle>
                      <CardDescription>Отчет по производительности системы за выбранный период</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-primary" />
                        <span className="text-sm">Включает графики и таблицы</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Предпросмотр
                      </Button>
                      <Button size="sm">Создать</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Предпросмотр отчета</h2>

            {loading ? (
              <Skeleton className="h-[500px] w-full" />
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Отчет по событиям системы</CardTitle>
                    <CardDescription>Период: {formatDateRange()}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Фильтры
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Печать
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Экспорт
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Отправить
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Поделиться
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">События по дням</h3>
                      <div className="h-[300px]">
                        <AreaChart data={eventsByDayData} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">События по типам</h3>
                      <div className="h-[300px]">
                        <BarChart data={eventsByTypeData} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Таблица событий</h3>
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
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Сформировано: {format(new Date(), "dd.MM.yyyy HH:mm")}
                  </div>
                  <Button>Сохранить отчет</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Сохраненные отчеты</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск отчетов..." className="pl-10 w-[250px]" />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Название
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Тип
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Период
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Создан
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">События за май 2023</td>
                          <td className="px-6 py-4">События</td>
                          <td className="px-6 py-4">01.05.2023 - 31.05.2023</td>
                          <td className="px-6 py-4">01.06.2023</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Открыть
                              </Button>
                              <Button variant="outline" size="sm">
                                Экспорт
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">Контроль доступа Q2 2023</td>
                          <td className="px-6 py-4">Контроль доступа</td>
                          <td className="px-6 py-4">01.04.2023 - 30.06.2023</td>
                          <td className="px-6 py-4">01.07.2023</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Открыть
                              </Button>
                              <Button variant="outline" size="sm">
                                Экспорт
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">Распознавание объектов</td>
                          <td className="px-6 py-4">Распознавание</td>
                          <td className="px-6 py-4">01.01.2023 - 30.06.2023</td>
                          <td className="px-6 py-4">01.07.2023</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Открыть
                              </Button>
                              <Button variant="outline" size="sm">
                                Экспорт
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">Использование хранилища</td>
                          <td className="px-6 py-4">Хранилище</td>
                          <td className="px-6 py-4">01.01.2023 - 31.12.2023</td>
                          <td className="px-6 py-4">02.01.2024</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Открыть
                              </Button>
                              <Button variant="outline" size="sm">
                                Экспорт
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card">
                          <td className="px-6 py-4">Активность пользователей</td>
                          <td className="px-6 py-4">Пользователи</td>
                          <td className="px-6 py-4">01.01.2023 - 31.12.2023</td>
                          <td className="px-6 py-4">02.01.2024</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Открыть
                              </Button>
                              <Button variant="outline" size="sm">
                                Экспорт
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Запланированные отчеты</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Запланировать отчет
              </Button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Название
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Тип
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Расписание
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Получатели
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Следующий запуск
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">Ежедневный отчет по событиям</td>
                          <td className="px-6 py-4">События</td>
                          <td className="px-6 py-4">Ежедневно, 08:00</td>
                          <td className="px-6 py-4">admin@example.com</td>
                          <td className="px-6 py-4">Завтра, 08:00</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Изменить
                              </Button>
                              <Button variant="outline" size="sm">
                                Отключить
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">Еженедельный отчет по доступу</td>
                          <td className="px-6 py-4">Контроль доступа</td>
                          <td className="px-6 py-4">Еженедельно, Пн, 09:00</td>
                          <td className="px-6 py-4">security@example.com</td>
                          <td className="px-6 py-4">Пн, 09:00</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Изменить
                              </Button>
                              <Button variant="outline" size="sm">
                                Отключить
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card border-b">
                          <td className="px-6 py-4">Ежемесячный отчет по хранилищу</td>
                          <td className="px-6 py-4">Хранилище</td>
                          <td className="px-6 py-4">Ежемесячно, 1-е число, 10:00</td>
                          <td className="px-6 py-4">it@example.com</td>
                          <td className="px-6 py-4">01.06.2023, 10:00</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Изменить
                              </Button>
                              <Button variant="outline" size="sm">
                                Отключить
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="bg-card">
                          <td className="px-6 py-4">Квартальный отчет по распознаванию</td>
                          <td className="px-6 py-4">Распознавание</td>
                          <td className="px-6 py-4">Ежеквартально, 1-е число, 12:00</td>
                          <td className="px-6 py-4">management@example.com</td>
                          <td className="px-6 py-4">01.07.2023, 12:00</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Изменить
                              </Button>
                              <Button variant="outline" size="sm">
                                Отключить
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
