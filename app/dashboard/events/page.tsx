"use client"

import { useState, useEffect } from "react"
import { Bell, CalendarIcon, Clock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

// Имитация данных событий
const mockEvents = [
  {
    id: "1",
    type: "Движение",
    level: "notification",
    time: "2023-05-15T10:30:45",
    cameraId: "1",
    cameraName: "Камера 1 - Вход",
    description: "Обнаружено движение в зоне наблюдения",
  },
  {
    id: "2",
    type: "Саботаж",
    level: "alarm",
    time: "2023-05-15T11:15:22",
    cameraId: "2",
    cameraName: "Камера 2 - Парковка",
    description: "Обнаружена попытка саботажа камеры",
  },
  {
    id: "3",
    type: "Распознавание лица",
    level: "notification",
    time: "2023-05-15T12:45:10",
    cameraId: "1",
    cameraName: "Камера 1 - Вход",
    description: "Распознано лицо: Иванов Иван",
  },
  {
    id: "4",
    type: "Ошибка подключения",
    level: "error",
    time: "2023-05-15T14:20:05",
    cameraId: "3",
    cameraName: "Камера 3 - Склад",
    description: "Потеряно соединение с камерой",
  },
  {
    id: "5",
    type: "Распознавание номера",
    level: "notification",
    time: "2023-05-15T15:10:30",
    cameraId: "2",
    cameraName: "Камера 2 - Парковка",
    description: "Распознан номер: А123ВС77",
  },
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [eventType, setEventType] = useState("all")
  const [eventLevel, setEventLevel] = useState("all")
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<typeof mockEvents>([])

  // Форматирование даты для отображения
  const formattedDate = format(date, "PPP", { locale: ru })

  useEffect(() => {
    // Имитация загрузки данных
    const timer = setTimeout(() => {
      setLoading(false)
      setEvents(mockEvents)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Фильтрация событий
  const filteredEvents = events.filter((event) => {
    // Фильтр по поисковому запросу
    const matchesSearch =
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase())

    // Фильтр по типу события
    const matchesType = eventType === "all" || event.type === eventType

    // Фильтр по уровню события
    const matchesLevel = eventLevel === "all" || event.level === eventLevel

    return matchesSearch && matchesType && matchesLevel
  })

  // Получение цвета бейджа в зависимости от уровня события
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "alarm":
        return "destructive"
      case "error":
        return "destructive"
      case "notification":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Получение текста уровня события
  const getLevelText = (level: string) => {
    switch (level) {
      case "alarm":
        return "Тревога"
      case "error":
        return "Ошибка"
      case "notification":
        return "Уведомление"
      default:
        return level
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-background">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">События</h1>
          <div className="flex gap-2">
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

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <div className="px-4 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="alarms">Тревоги</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="errors">Ошибки</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск событий..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Тип события" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="Движение">Движение</SelectItem>
                  <SelectItem value="Саботаж">Саботаж</SelectItem>
                  <SelectItem value="Распознавание лица">Распознавание лица</SelectItem>
                  <SelectItem value="Распознавание номера">Распознавание номера</SelectItem>
                  <SelectItem value="Ошибка подключения">Ошибка подключения</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventLevel} onValueChange={setEventLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="alarm">Тревога</SelectItem>
                  <SelectItem value="notification">Уведомление</SelectItem>
                  <SelectItem value="error">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="w-full h-24" />)
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getLevelBadgeVariant(event.level)}>{getLevelText(event.level)}</Badge>
                        <span className="font-medium">{event.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(event.time), "dd.MM.yyyy HH:mm:ss")}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.cameraName}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">Нет событий</h3>
                <p className="text-muted-foreground">События, соответствующие заданным фильтрам, не найдены</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alarms" className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {loading
              ? Array(2)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="w-full h-24" />)
              : events
                  .filter((event) => event.level === "alarm")
                  .map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Тревога</Badge>
                            <span className="font-medium">{event.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(event.time), "dd.MM.yyyy HH:mm:ss")}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{event.cameraName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="w-full h-24" />)
              : events
                  .filter((event) => event.level === "notification")
                  .map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Уведомление</Badge>
                            <span className="font-medium">{event.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(event.time), "dd.MM.yyyy HH:mm:ss")}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{event.cameraName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="flex-1 p-4 overflow-auto">
          <div className="space-y-4">
            {loading
              ? Array(1)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="w-full h-24" />)
              : events
                  .filter((event) => event.level === "error")
                  .map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">Ошибка</Badge>
                            <span className="font-medium">{event.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(event.time), "dd.MM.yyyy HH:mm:ss")}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{event.cameraName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

