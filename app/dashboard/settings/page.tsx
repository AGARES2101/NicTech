"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Camera,
  Database,
  HardDrive,
  RefreshCw,
  Save,
  Server,
  Settings,
  Shield,
  Users,
  Info,
  Bug,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { APP_VERSION, CHANGELOG } from "@/lib/version"
import { DiagnosticsTool } from "@/components/diagnostics-tool"
import { logger, LogCategory, LogLevel } from "@/lib/logger"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authData, setAuthData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  // Получение данных авторизации из sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("nictech-auth")
    if (auth) {
      try {
        const parsedAuth = JSON.parse(auth)
        setAuthData(parsedAuth)
        logger.info(LogCategory.AUTH, "Данные авторизации успешно загружены")
      } catch (e) {
        console.error("Ошибка при разборе данных авторизации:", e)
        logger.error(LogCategory.AUTH, "Ошибка при разборе данных авторизации", e)
        router.push("/login")
        return
      }
    } else {
      // Для тестирования в режиме разработки можно использовать мок-данные
      if (process.env.NODE_ENV === "development") {
        console.log("Режим разработки: используем мок-данные для авторизации")
        logger.info(LogCategory.AUTH, "Режим разработки: используем мок-данные для авторизации")
        setAuthData({
          serverUrl: "http://mock-server",
          authHeader: "Basic mock-auth",
        })
      } else {
        logger.warn(LogCategory.AUTH, "Данные авторизации отсутствуют, перенаправление на страницу входа")
        router.push("/login")
        return
      }
    }
  }, [router])

  // Загрузка данных
  useEffect(() => {
    if (!authData) return

    const fetchData = async () => {
      try {
        setLoading(true)
        logger.info(LogCategory.SYSTEM, "Загрузка настроек", { serverUrl: authData.serverUrl })

        // Имитация загрузки данных
        await new Promise((resolve) => setTimeout(resolve, 1500))

        logger.info(LogCategory.SYSTEM, "Настройки успешно загружены")
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
        logger.error(LogCategory.SYSTEM, "Ошибка загрузки настроек", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchData()
  }, [authData, refreshing])

  // Обработчик обновления данных
  const handleRefresh = () => {
    logger.info(LogCategory.SYSTEM, "Запрос на обновление настроек")
    setRefreshing(true)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Настройки</h1>
            <p className="text-muted-foreground mt-1">Управление настройками системы</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>

            <Button>
              <Save className="mr-2 h-4 w-4" />
              Сохранить изменения
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r p-4 overflow-y-auto hidden md:block">
          <nav className="space-y-1">
            <Button
              variant={activeTab === "general" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("general")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Общие
            </Button>
            <Button
              variant={activeTab === "server" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("server")}
            >
              <Server className="mr-2 h-4 w-4" />
              Сервер
            </Button>
            <Button
              variant={activeTab === "cameras" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("cameras")}
            >
              <Camera className="mr-2 h-4 w-4" />
              Камеры
            </Button>
            <Button
              variant={activeTab === "storage" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("storage")}
            >
              <HardDrive className="mr-2 h-4 w-4" />
              Хранилище
            </Button>
            <Button
              variant={activeTab === "users" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Пользователи
            </Button>
            <Button
              variant={activeTab === "security" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("security")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Безопасность
            </Button>
            <Button
              variant={activeTab === "notifications" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="mr-2 h-4 w-4" />
              Уведомления
            </Button>
            <Button
              variant={activeTab === "database" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("database")}
            >
              <Database className="mr-2 h-4 w-4" />
              База данных
            </Button>
            <Separator className="my-2" />
            <Button
              variant={activeTab === "diagnostics" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("diagnostics")}
            >
              <Bug className="mr-2 h-4 w-4" />
              Диагностика
            </Button>
            <Button
              variant={activeTab === "logs" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("logs")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Логи
            </Button>
            <Button
              variant={activeTab === "about" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("about")}
            >
              <Info className="mr-2 h-4 w-4" />О программе
            </Button>
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="md:hidden mb-6">
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="general">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="server">
                <Server className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="cameras">
                <Camera className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="storage">
                <HardDrive className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="users">
                <Users className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="database">
                <Database className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="diagnostics">
                <Bug className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="logs">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="about">
                <Info className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeTab === "general" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Общие настройки</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Настройки системы</CardTitle>
                  <CardDescription>Основные настройки системы видеонаблюдения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="system-name">Название системы</Label>
                        <Input id="system-name" defaultValue="NicTech Enterprise" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Язык интерфейса</Label>
                        <Select defaultValue="ru">
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Выберите язык" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ru">Русский</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Часовой пояс</Label>
                        <Select defaultValue="europe-moscow">
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder="Выберите часовой пояс" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="europe-moscow">Москва (UTC+3)</SelectItem>
                            <SelectItem value="europe-london">Лондон (UTC+0)</SelectItem>
                            <SelectItem value="america-new_york">Нью-Йорк (UTC-5)</SelectItem>
                            <SelectItem value="asia-tokyo">Токио (UTC+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode">Темная тема</Label>
                          <p className="text-sm text-muted-foreground">Включить темную тему интерфейса</p>
                        </div>
                        <Switch id="dark-mode" defaultChecked />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="log-level">Уровень логирования</Label>
                        <Select
                          defaultValue={LogLevel.INFO.toString()}
                          onValueChange={(value) => {
                            logger.setLogLevel(Number.parseInt(value) as LogLevel)
                          }}
                        >
                          <SelectTrigger id="log-level">
                            <SelectValue placeholder="Выберите уровень логирования" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={LogLevel.DEBUG.toString()}>Отладка</SelectItem>
                            <SelectItem value={LogLevel.INFO.toString()}>Информация</SelectItem>
                            <SelectItem value={LogLevel.WARN.toString()}>Предупреждения</SelectItem>
                            <SelectItem value={LogLevel.ERROR.toString()}>Ошибки</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-update">Автоматические обновления</Label>
                          <p className="text-sm text-muted-foreground">
                            Автоматически проверять и устанавливать обновления
                          </p>
                        </div>
                        <Switch id="auto-update" defaultChecked />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Сохранить настройки</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {activeTab === "server" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Настройки сервера</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Параметры сервера</CardTitle>
                  <CardDescription>Настройки сервера видеонаблюдения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="server-address">Адрес сервера</Label>
                        <Input id="server-address" defaultValue="http://localhost:11012" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="server-port">Порт</Label>
                        <Input id="server-port" defaultValue="11012" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="https">HTTPS</Label>
                          <p className="text-sm text-muted-foreground">Использовать защищенное соединение</p>
                        </div>
                        <Switch id="https" defaultChecked />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="max-connections">Максимальное количество подключений</Label>
                        <Input id="max-connections" defaultValue="100" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Таймаут сессии (минуты)</Label>
                        <Input id="session-timeout" defaultValue="30" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="remote-access">Удаленный доступ</Label>
                          <p className="text-sm text-muted-foreground">Разрешить удаленный доступ к серверу</p>
                        </div>
                        <Switch id="remote-access" defaultChecked />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Сохранить настройки</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {activeTab === "cameras" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Настройки камер</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Параметры камер</CardTitle>
                  <CardDescription>Настройки камер видеонаблюдения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="default-framerate">Частота кадров по умолчанию</Label>
                        <Select defaultValue="25">
                          <SelectTrigger id="default-framerate">
                            <SelectValue placeholder="Выберите частоту кадров" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 fps</SelectItem>
                            <SelectItem value="15">15 fps</SelectItem>
                            <SelectItem value="25">25 fps</SelectItem>
                            <SelectItem value="30">30 fps</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="default-resolution">Разрешение по умолчанию</Label>
                        <Select defaultValue="1080p">
                          <SelectTrigger id="default-resolution">
                            <SelectValue placeholder="Выберите разрешение" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="720p">HD (1280x720)</SelectItem>
                            <SelectItem value="1080p">Full HD (1920x1080)</SelectItem>
                            <SelectItem value="2k">2K (2560x1440)</SelectItem>
                            <SelectItem value="4k">4K (3840x2160)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="motion-detection">Детекция движения</Label>
                          <p className="text-sm text-muted-foreground">Включить детекцию движения по умолчанию</p>
                        </div>
                        <Switch id="motion-detection" defaultChecked />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="reconnect-interval">Интервал переподключения (секунды)</Label>
                        <Input id="reconnect-interval" defaultValue="10" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ptz-speed">Скорость PTZ по умолчанию</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger id="ptz-speed">
                            <SelectValue placeholder="Выберите скорость PTZ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">Медленная</SelectItem>
                            <SelectItem value="medium">Средняя</SelectItem>
                            <SelectItem value="fast">Быстрая</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>Сохранить настройки</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {activeTab === "diagnostics" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Диагностика системы</h2>
              </div>

              <DiagnosticsTool serverUrl={authData?.serverUrl} authHeader={authData?.authHeader} />
            </motion.div>
          )}

          {activeTab === "logs" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Логи веб-интерфейса</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Журнал событий</CardTitle>
                  <CardDescription>Просмотр логов работы веб-интерфейса</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Здесь будет компонент для просмотра логов */}
                  <p className="text-muted-foreground">
                    Для просмотра подробных логов и диагностики перейдите на вкладку "Диагностика"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">О программе</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>NicTech Surveillance</CardTitle>
                  <CardDescription>Информация о версии и разработчиках</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Версия:</span>
                      <span>{APP_VERSION.full}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Кодовое имя:</span>
                      <span>{APP_VERSION.codename}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Дата сборки:</span>
                      <span>{APP_VERSION.build}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">История изменений</h3>
                    {CHANGELOG.map((release, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Версия {release.version}</h4>
                          <span className="text-sm text-muted-foreground">{release.date}</span>
                        </div>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                          {release.changes.map((change, changeIndex) => (
                            <li key={changeIndex}>{change}</li>
                          ))}
                        </ul>
                        {index < CHANGELOG.length - 1 && <Separator className="my-2" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">© 2025 NicTech. Все права защищены.</p>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Заглушки для остальных вкладок */}
          {(activeTab === "storage" ||
            activeTab === "users" ||
            activeTab === "security" ||
            activeTab === "notifications" ||
            activeTab === "database") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {activeTab === "storage" && "Настройки хранилища"}
                  {activeTab === "users" && "Управление пользователями"}
                  {activeTab === "security" && "Настройки безопасности"}
                  {activeTab === "notifications" && "Настройки уведомлений"}
                  {activeTab === "database" && "Настройки базы данных"}
                </h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === "storage" && "Параметры хранилища"}
                    {activeTab === "users" && "Пользователи и группы"}
                    {activeTab === "security" && "Параметры безопасности"}
                    {activeTab === "notifications" && "Параметры уведомлений"}
                    {activeTab === "database" && "Параметры базы данных"}
                  </CardTitle>
                  <CardDescription>Этот раздел находится в разработке</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="space-y-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                      <h3 className="text-xl font-medium mb-2">Раздел в разработке</h3>
                      <p className="text-muted-foreground max-w-md">
                        Этот раздел настроек находится в разработке и будет доступен в ближайшем обновлении.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

