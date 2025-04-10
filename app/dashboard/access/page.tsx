"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays } from "date-fns"
import { ru } from "date-fns/locale"

export default function AccessControlPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authData, setAuthData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })

  // Имитация данных пользователей
  const users = [
    {
      id: "1",
      name: "Иванов Иван",
      role: "Администратор",
      department: "IT отдел",
      status: "active",
      lastAccess: "2023-05-15T10:30:45",
      avatar: "/avatars/admin.jpg",
    },
    {
      id: "2",
      name: "Петров Петр",
      role: "Охранник",
      department: "Служба безопасности",
      status: "active",
      lastAccess: "2023-05-15T09:15:22",
      avatar: "",
    },
    {
      id: "3",
      name: "Сидорова Анна",
      role: "Менеджер",
      department: "Отдел продаж",
      status: "inactive",
      lastAccess: "2023-05-10T14:45:10",
      avatar: "",
    },
    {
      id: "4",
      name: "Козлов Дмитрий",
      role: "Техник",
      department: "Техническая поддержка",
      status: "active",
      lastAccess: "2023-05-15T08:20:05",
      avatar: "",
    },
    {
      id: "5",
      name: "Смирнова Елена",
      role: "Бухгалтер",
      department: "Финансовый отдел",
      status: "blocked",
      lastAccess: "2023-05-01T11:10:30",
      avatar: "",
    },
  ]

  // Имитация данных доступа
  const accessLogs = [
    {
      id: "1",
      userId: "1",
      userName: "Иванов Иван",
      door: "Главный вход",
      time: "2023-05-15T10:30:45",
      status: "granted",
      method: "card",
    },
    {
      id: "2",
      userId: "2",
      userName: "Петров Петр",
      door: "Серверная",
      time: "2023-05-15T09:15:22",
      status: "denied",
      method: "card",
    },
    {
      id: "3",
      userId: "1",
      userName: "Иванов Иван",
      door: "Офис директора",
      time: "2023-05-15T11:45:10",
      status: "granted",
      method: "pin",
    },
    {
      id: "4",
      userId: "4",
      userName: "Козлов Дмитрий",
      door: "Техническое помещение",
      time: "2023-05-15T08:20:05",
      status: "granted",
      method: "card",
    },
    {
      id: "5",
      userId: "3",
      userName: "Сидорова Анна",
      door: "Конференц-зал",
      time: "2023-05-15T14:10:30",
      status: "granted",
      method: "biometric",
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

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Форматирование даты и времени
  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return date.toLocaleString("ru-RU")
    } catch (e) {
      return dateTimeStr
    }
  }

  // Получение цвета статуса пользователя
  const getUserStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground"
      case "inactive":
        return "bg-warning text-warning-foreground"
      case "blocked":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Получение текста статуса пользователя
  const getUserStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Активен"
      case "inactive":
        return "Неактивен"
      case "blocked":
        return "Заблокирован"
      default:
        return status
    }
  }

  // Получение цвета статуса доступа
  const getAccessStatusColor = (status: string) => {
    switch (status) {
      case "granted":
        return "bg-success text-success-foreground"
      case "denied":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Получение текста статуса доступа
  const getAccessStatusText = (status: string) => {
    switch (status) {
      case "granted":
        return "Разрешен"
      case "denied":
        return "Отказано"
      default:
        return status
    }
  }

  // Форматирование диапазона дат
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) {
      return "Выберите период"
    }

    return `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Контроль доступа</h1>
            <p className="text-muted-foreground mt-1">Управление доступом и мониторинг</p>
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
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить пользователя
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="access-logs">
              <Lock className="mr-2 h-4 w-4" />
              Журнал доступа
            </TabsTrigger>
            <TabsTrigger value="access-points">
              <Shield className="mr-2 h-4 w-4" />
              Точки доступа
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Список пользователей</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{user.name}</h3>
                            <Badge className={getUserStatusColor(user.status)}>{getUserStatusText(user.status)}</Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">{user.role}</p>
                            <p className="text-sm text-muted-foreground">{user.department}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Последний доступ: {formatDateTime(user.lastAccess)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <User className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Профиль пользователя</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Настройки доступа</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Пользователи не найдены</h3>
                <p className="text-muted-foreground max-w-md">
                  Не найдено пользователей, соответствующих заданным критериям поиска.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="access-logs" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Журнал доступа</h2>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      {formatDateRange()}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => range && setDateRange(range)}
                      numberOfMonths={2}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт
                </Button>
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
                            Дата и время
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Пользователь
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Точка доступа
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Метод
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Статус
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessLogs.map((log) => (
                          <tr key={log.id} className="bg-card border-b">
                            <td className="px-6 py-4">{formatDateTime(log.time)}</td>
                            <td className="px-6 py-4">{log.userName}</td>
                            <td className="px-6 py-4">{log.door}</td>
                            <td className="px-6 py-4">
                              {log.method === "card"
                                ? "Карта"
                                : log.method === "pin"
                                  ? "PIN-код"
                                  : log.method === "biometric"
                                    ? "Биометрия"
                                    : log.method}
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={getAccessStatusColor(log.status)}>
                                {getAccessStatusText(log.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between py-4">
                  <div className="text-sm text-muted-foreground">Показано 5 из 125 записей</div>
                  <Button variant="outline" size="sm">
                    Показать все
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="access-points" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Точки доступа</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить точку доступа
              </Button>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Главный вход</CardTitle>
                    <CardDescription>Контроллер доступа: DK-2000</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="success">Онлайн</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Режим:</span>
                        <span className="text-sm">Нормальный</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Последнее событие:</span>
                        <span className="text-sm">10:30:45</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Настройки
                    </Button>
                    <Button size="sm">Управление</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Серверная</CardTitle>
                    <CardDescription>Контроллер доступа: DK-2000</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="success">Онлайн</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Режим:</span>
                        <span className="text-sm">Повышенная безопасность</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Последнее событие:</span>
                        <span className="text-sm">09:15:22</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Настройки
                    </Button>
                    <Button size="sm">Управление</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Офис директора</CardTitle>
                    <CardDescription>Контроллер доступа: DK-3000</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="success">Онлайн</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Режим:</span>
                        <span className="text-sm">Повышенная безопасность</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Последнее событие:</span>
                        <span className="text-sm">11:45:10</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Настройки
                    </Button>
                    <Button size="sm">Управление</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Техническое помещение</CardTitle>
                    <CardDescription>Контроллер доступа: DK-2000</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="success">Онлайн</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Режим:</span>
                        <span className="text-sm">Нормальный</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Последнее событие:</span>
                        <span className="text-sm">08:20:05</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Настройки
                    </Button>
                    <Button size="sm">Управление</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Конференц-зал</CardTitle>
                    <CardDescription>Контроллер доступа: DK-2000</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="success">Онлайн</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Режим:</span>
                        <span className="text-sm">Нормальный</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Последнее событие:</span>
                        <span className="text-sm">14:10:30</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Настройки
                    </Button>
                    <Button size="sm">Управление</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Склад</CardTitle>
                    <CardDescription>Контроллер доступа: DK-2000</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="destructive">Офлайн</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Режим:</span>
                        <span className="text-sm">Неизвестно</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Последнее событие:</span>
                        <span className="text-sm">Вчера, 18:45:12</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Настройки
                    </Button>
                    <Button size="sm">Управление</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
