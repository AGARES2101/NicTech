"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff, Download } from "lucide-react"
import { logger, LogCategory, LogLevel, type LogEntry } from "@/lib/logger"

interface DiagnosticsToolProps {
  serverUrl?: string
  authHeader?: string
}

export function DiagnosticsTool({ serverUrl, authHeader }: DiagnosticsToolProps) {
  const [activeTab, setActiveTab] = useState("connection")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState<LogCategory | "ALL">("ALL")
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.INFO)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<string>("")
  const [testUrl, setTestUrl] = useState(serverUrl || "")
  const [testAuth, setTestAuth] = useState(authHeader || "")
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Загрузка логов
  useEffect(() => {
    const updateLogs = () => {
      const allLogs = logger.getLogs()
      const filteredLogs =
        logFilter === "ALL"
          ? allLogs.filter((log) => log.level >= logLevel)
          : allLogs.filter((log) => log.category === logFilter && log.level >= logLevel)
      setLogs(filteredLogs)
    }

    // Обновляем логи при изменении фильтров
    updateLogs()

    // Добавляем слушатель для обновления логов в реальном времени
    const logListener = (entry: LogEntry) => {
      if ((logFilter === "ALL" || entry.category === logFilter) && entry.level >= logLevel) {
        setLogs((prevLogs) => [entry, ...prevLogs])
      }
    }

    logger.addListener(logListener)

    // Интервал автообновления
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(updateLogs, 2000)
    }

    return () => {
      logger.removeListener(logListener)
      if (interval) clearInterval(interval)
    }
  }, [logFilter, logLevel, autoRefresh])

  // Тестирование соединения
  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionDetails("")

    logger.info(LogCategory.SYSTEM, "Начало тестирования соединения", { url: testUrl })

    try {
      // Проверка доступности сервера
      const startTime = Date.now()
      const response = await fetch("/api/diagnostics/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverUrl: testUrl,
          authHeader: testAuth,
        }),
      })

      const responseTime = Date.now() - startTime
      const data = await response.json()

      if (response.ok && data.success) {
        setConnectionStatus("success")
        setConnectionDetails(`Соединение успешно установлено. Время отклика: ${responseTime}мс. ${data.message || ""}`)
        logger.info(LogCategory.SYSTEM, "Тестирование соединения успешно", {
          responseTime,
          details: data,
        })
      } else {
        setConnectionStatus("error")
        setConnectionDetails(`Ошибка соединения: ${data.message || "Неизвестная ошибка"}`)
        logger.error(LogCategory.SYSTEM, "Ошибка при тестировании соединения", {
          status: response.status,
          details: data,
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      setConnectionDetails(`Ошибка соединения: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`)
      logger.error(LogCategory.SYSTEM, "Исключение при тестировании соединения", { error })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Очистка логов
  const clearLogs = () => {
    logger.clearLogs()
    setLogs([])
  }

  // Экспорт логов
  const exportLogs = () => {
    const json = logger.exportLogs()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `nictech-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Изменение уровня логирования
  const changeLogLevel = (level: string) => {
    const newLevel = Number.parseInt(level) as LogLevel
    setLogLevel(newLevel)
    logger.setLogLevel(newLevel)
    logger.info(LogCategory.SYSTEM, `Уровень логирования изменен на ${LogLevel[newLevel]}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Инструменты диагностики</CardTitle>
        <CardDescription>Диагностика и отладка системы видеонаблюдения</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="connection">Соединение</TabsTrigger>
            <TabsTrigger value="logs">Логи</TabsTrigger>
            <TabsTrigger value="video">Видеопотоки</TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server-url">URL сервера</Label>
                <Input
                  id="server-url"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="http://localhost:11012"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-header">Заголовок авторизации</Label>
                <Input
                  id="auth-header"
                  value={testAuth}
                  onChange={(e) => setTestAuth(e.target.value)}
                  placeholder="Basic dXNlcjpwYXNzd29yZA=="
                />
              </div>

              <Button onClick={testConnection} disabled={isTestingConnection} className="w-full">
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Проверка соединения...
                  </>
                ) : (
                  <>
                    {connectionStatus === "idle" ? (
                      <Wifi className="mr-2 h-4 w-4" />
                    ) : connectionStatus === "success" ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <WifiOff className="mr-2 h-4 w-4" />
                    )}
                    Проверить соединение
                  </>
                )}
              </Button>

              {connectionStatus !== "idle" && (
                <div
                  className={`p-4 rounded-md ${
                    connectionStatus === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {connectionStatus === "success" ? (
                    <CheckCircle className="inline-block mr-2 h-4 w-4" />
                  ) : (
                    <AlertCircle className="inline-block mr-2 h-4 w-4" />
                  )}
                  {connectionDetails}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="log-category">Категория</Label>
                  <Select value={logFilter} onValueChange={(value) => setLogFilter(value as LogCategory | "ALL")}>
                    <SelectTrigger id="log-category" className="w-[180px]">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Все категории</SelectItem>
                      {Object.values(LogCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-level">Уровень</Label>
                  <Select value={logLevel.toString()} onValueChange={changeLogLevel}>
                    <SelectTrigger id="log-level" className="w-[180px]">
                      <SelectValue placeholder="Выберите уровень" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LogLevel.DEBUG.toString()}>DEBUG</SelectItem>
                      <SelectItem value={LogLevel.INFO.toString()}>INFO</SelectItem>
                      <SelectItem value={LogLevel.WARN.toString()}>WARN</SelectItem>
                      <SelectItem value={LogLevel.ERROR.toString()}>ERROR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={(checked) => setAutoRefresh(checked === true)}
                  />
                  <Label htmlFor="auto-refresh">Автообновление</Label>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={clearLogs}>
                    Очистить
                  </Button>
                  <Button variant="outline" onClick={exportLogs}>
                    <Download className="mr-2 h-4 w-4" />
                    Экспорт
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] border rounded-md">
                <div className="p-4 space-y-2">
                  {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">Нет доступных логов</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="border-b pb-2 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              log.level === LogLevel.ERROR
                                ? "destructive"
                                : log.level === LogLevel.WARN
                                  ? "warning"
                                  : log.level === LogLevel.INFO
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {LogLevel[log.level]}
                          </Badge>
                          <Badge variant="outline">{log.category}</Badge>
                          <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.details && (
                          <details className="mt-1">
                            <summary className="text-xs text-muted-foreground cursor-pointer">Подробности</summary>
                            <pre className="text-xs bg-muted p-2 mt-1 rounded overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="video">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Тестирование видеопотоков</Label>
                <p className="text-sm text-muted-foreground">
                  Проверка доступности и работоспособности различных типов видеопотоков
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">MJPEG поток</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        logger.info(LogCategory.VIDEO, "Запуск теста MJPEG потока")
                        // Здесь будет логика тестирования MJPEG потока
                      }}
                      className="w-full"
                    >
                      Проверить MJPEG
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Нативный поток</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        logger.info(LogCategory.VIDEO, "Запуск теста нативного потока")
                        // Здесь будет логика тестирования нативного потока
                      }}
                      className="w-full"
                    >
                      Проверить нативный поток
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">HLS поток</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        logger.info(LogCategory.VIDEO, "Запуск теста HLS потока")
                        // Здесь будет логика тестирования HLS потока
                      }}
                      className="w-full"
                    >
                      Проверить HLS
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">WebRTC поток</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        logger.info(LogCategory.VIDEO, "Запуск теста WebRTC потока")
                        // Здесь будет логика тестирования WebRTC потока
                      }}
                      className="w-full"
                    >
                      Проверить WebRTC
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Инструменты диагностики помогают выявить и устранить проблемы в работе системы
        </p>
      </CardFooter>
    </Card>
  )
}

