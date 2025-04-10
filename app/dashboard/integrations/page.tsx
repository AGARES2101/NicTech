"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Check,
  ChevronRight,
  Database,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Server,
  Shield,
  Smartphone,
  Webhook,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function IntegrationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authData, setAuthData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Имитация данных интеграций
  const integrations = [
    {
      id: "1",
      name: "Active Directory",
      description: "Интеграция с Microsoft Active Directory для управления пользователями",
      category: "auth",
      status: "active",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "2",
      name: "PostgreSQL",
      description: "Подключение к базе данных PostgreSQL для хранения данных",
      category: "database",
      status: "active",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "3",
      name: "REST API",
      description: "Интеграция с внешними системами через REST API",
      category: "api",
      status: "active",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "4",
      name: "SMTP",
      description: "Отправка уведомлений по электронной почте",
      category: "notification",
      status: "active",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "5",
      name: "Telegram",
      description: "Отправка уведомлений в Telegram",
      category: "notification",
      status: "inactive",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "6",
      name: "ONVIF",
      description: "Интеграция с камерами по протоколу ONVIF",
      category: "device",
      status: "active",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "7",
      name: "Webhooks",
      description: "Отправка событий на внешние URL",
      category: "api",
      status: "inactive",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "8",
      name: "LDAP",
      description: "Интеграция с LDAP для аутентификации пользователей",
      category: "auth",
      status: "inactive",
      icon: "/placeholder.svg?height=48&width=48",
    },
    {
      id: "9",
      name: "MongoDB",
      description: "Подключение к базе данных MongoDB для хранения данных",
      category: "database",
      status: "inactive",
      icon: "/placeholder.svg?height=48&width=48",
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

  // Фильтрация интеграций по поисковому запросу
  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Получение иконки категории
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return <Shield className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "api":
        return <Webhook className="h-5 w-5" />
      case "notification":
        return <Bell className="h-5 w-5" />
      case "device":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  // Получение текста категории
  const getCategoryText = (category: string) => {
    switch (category) {
      case "auth":
        return "Аутентификация"
      case "database":
        return "База данных"
      case "api":
        return "API"
      case "notification":
        return "Уведомления"
      case "device":
        return "Устройства"
      default:
        return category
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Интеграции</h1>
            <p className="text-muted-foreground mt-1">Управление интеграциями с внешними системами</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск интеграций..."
                className="pl-10 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить интеграцию
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="all">
              <Server className="mr-2 h-4 w-4" />
              Все
            </TabsTrigger>
            <TabsTrigger value="auth">
              <Shield className="mr-2 h-4 w-4" />
              Аутентификация
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="mr-2 h-4 w-4" />
              Базы данных
            </TabsTrigger>
            <TabsTrigger value="api">
              <Webhook className="mr-2 h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="notification">
              <Bell className="mr-2 h-4 w-4" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="device">
              <Smartphone className="mr-2 h-4 w-4" />
              Устройства
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Все интеграции</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-inactive" className="text-sm">
                  Показать неактивные
                </Label>
                <Switch id="show-inactive" defaultChecked />
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
            ) : filteredIntegrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                              <img
                                src={integration.icon || "/placeholder.svg"}
                                alt={integration.name}
                                className="w-6 h-6"
                              />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <CardDescription>{getCategoryText(integration.category)}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={integration.status === "active" ? "success" : "secondary"}>
                            {integration.status === "active" ? "Активно" : "Неактивно"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          {integration.status === "active" ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-success" />
                              Подключено
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                              Не подключено
                            </>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Настроить
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Server className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Интеграции не найдены</h3>
                <p className="text-muted-foreground max-w-md">
                  Не найдено интеграций, соответствующих заданным критериям поиска.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Документация по API</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>REST API</CardTitle>
                  <CardDescription>Документация по REST API для интеграции с внешними системами</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    REST API предоставляет доступ к функциям системы через HTTP запросы. Поддерживаются методы GET,
                    POST, PUT, DELETE.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Открыть документацию
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Документация по настройке webhooks для получения событий</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Webhooks позволяют получать уведомления о событиях в системе в реальном времени. Поддерживаются
                    различные типы событий.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Открыть документацию
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {["auth", "database", "api", "notification", "device"].map((category) => (
          <TabsContent key={category} value={category} className="flex-1 p-6 overflow-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{getCategoryText(category)} интеграции</h2>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`show-inactive-${category}`} className="text-sm">
                    Показать неактивные
                  </Label>
                  <Switch id={`show-inactive-${category}`} defaultChecked />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredIntegrations
                    .filter((integration) => integration.category === category)
                    .map((integration, index) => (
                      <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                                  <img
                                    src={integration.icon || "/placeholder.svg"}
                                    alt={integration.name}
                                    className="w-6 h-6"
                                  />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                                  <CardDescription>{getCategoryText(integration.category)}</CardDescription>
                                </div>
                              </div>
                              <Badge variant={integration.status === "active" ? "success" : "secondary"}>
                                {integration.status === "active" ? "Активно" : "Неактивно"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="flex items-center text-xs text-muted-foreground">
                              {integration.status === "active" ? (
                                <>
                                  <Check className="h-3 w-3 mr-1 text-success" />
                                  Подключено
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                                  Не подключено
                                </>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Настроить
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              )}

              {!loading &&
                filteredIntegrations.filter((integration) => integration.category === category).length === 0 && (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    {getCategoryIcon(category)}
                    <h3 className="text-xl font-medium mb-2 mt-4">Интеграции не найдены</h3>
                    <p className="text-muted-foreground max-w-md">
                      Не найдено интеграций в категории {getCategoryText(category)}.
                    </p>
                    <Button variant="outline" className="mt-4">
                      Добавить интеграцию
                    </Button>
                  </div>
                )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
