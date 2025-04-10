"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { logger, LogCategory } from "@/lib/logger"
import {
  Bell,
  Mail,
  MessageSquare,
  Globe,
  Smartphone,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  Send,
  Settings,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

// Типы каналов оповещений
export type NotificationChannelType = "email" | "sms" | "telegram" | "push" | "webhook"

// Интерфейс канала оповещений
export interface NotificationChannel {
  id: string
  type: NotificationChannelType
  name: string
  enabled: boolean
  config: Record<string, any>
}

// Интерфейс правила оповещений
export interface NotificationRule {
  id: string
  name: string
  eventTypes: string[]
  severity: "low" | "medium" | "high" | "critical"
  channels: string[]
  enabled: boolean
  schedule: {
    allDay: boolean
    timeRanges: { start: string; end: string }[]
    weekdays: number[]
  }
}

// Типы событий для оповещений
export const EVENT_TYPES = [
  { id: "motion", name: "Обнаружение движения" },
  { id: "face", name: "Распознавание лица" },
  { id: "object", name: "Обнаружение объекта" },
  { id: "camera_offline", name: "Камера не доступна" },
  { id: "camera_online", name: "Камера подключена" },
  { id: "storage_warning", name: "Предупреждение о хранилище" },
  { id: "system_error", name: "Системная ошибка" },
  { id: "login_attempt", name: "Попытка входа" },
  { id: "export_complete", name: "Экспорт завершен" },
]

interface NotificationSettingsProps {
  channels: NotificationChannel[]
  rules: NotificationRule[]
  onSaveChannel: (channel: NotificationChannel) => Promise<void>
  onSaveRule: (rule: NotificationRule) => Promise<void>
  onDeleteChannel: (channelId: string) => Promise<void>
  onDeleteRule: (ruleId: string) => Promise<void>
  onTestChannel: (channelId: string) => Promise<void>
}

export function NotificationSettings({
  channels,
  rules,
  onSaveChannel,
  onSaveRule,
  onDeleteChannel,
  onDeleteRule,
  onTestChannel,
}: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<"channels" | "rules">("channels")
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ type: "channel" | "rule"; id: string } | null>(null)

  // Обработчик сохранения канала оповещений
  const handleSaveChannel = async () => {
    if (!editingChannel) return

    try {
      setIsSaving(true)

      // Проверяем, что у канала есть название
      if (!editingChannel.name.trim()) {
        toast({
          title: "Ошибка сохранения",
          description: "Необходимо указать название канала оповещений",
          variant: "destructive",
        })
        return
      }

      await onSaveChannel(editingChannel)

      toast({
        title: "Канал сохранен",
        description: "Настройки канала оповещений успешно сохранены",
      })

      // Сбрасываем состояние редактирования
      setEditingChannel(null)

      logger.info(LogCategory.NOTIFICATIONS, `Канал "${editingChannel.name}" сохранен`, {
        channelId: editingChannel.id,
      })
    } catch (error) {
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка сохранения канала оповещений", error)
      toast({
        title: "Ошибка сохранения",
        description: `Не удалось сохранить канал: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Обработчик сохранения правила оповещений
  const handleSaveRule = async () => {
    if (!editingRule) return

    try {
      setIsSaving(true)

      // Проверяем, что у правила есть название
      if (!editingRule.name.trim()) {
        toast({
          title: "Ошибка сохранения",
          description: "Необходимо указать название правила оповещений",
          variant: "destructive",
        })
        return
      }

      // Проверяем, что выбран хотя бы один тип события
      if (editingRule.eventTypes.length === 0) {
        toast({
          title: "Ошибка сохранения",
          description: "Необходимо выбрать хотя бы один тип события",
          variant: "destructive",
        })
        return
      }

      // Проверяем, что выбран хотя бы один канал оповещений
      if (editingRule.channels.length === 0) {
        toast({
          title: "Ошибка сохранения",
          description: "Необходимо выбрать хотя бы один канал оповещений",
          variant: "destructive",
        })
        return
      }

      await onSaveRule(editingRule)

      toast({
        title: "Правило сохранено",
        description: "Правило оповещений успешно сохранено",
      })

      // Сбрасываем состояние редактирования
      setEditingRule(null)

      logger.info(LogCategory.NOTIFICATIONS, `Правило "${editingRule.name}" сохранено`, { ruleId: editingRule.id })
    } catch (error) {
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка сохранения правила оповещений", error)
      toast({
        title: "Ошибка сохранения",
        description: `Не удалось сохранить правило: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Обработчик тестирования канала оповещений
  const handleTestChannel = async (channelId: string) => {
    try {
      await onTestChannel(channelId)

      toast({
        title: "Тестовое оповещение отправлено",
        description: "Проверьте получение тестового оповещения",
      })

      logger.info(LogCategory.NOTIFICATIONS, `Отправлено тестовое оповещение`, { channelId })
    } catch (error) {
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка отправки тестового оповещения", error)
      toast({
        title: "Ошибка отправки",
        description: `Не удалось отправить тестовое оповещение: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  // Обработчик удаления канала оповещений
  const handleDeleteChannel = async (channelId: string) => {
    try {
      await onDeleteChannel(channelId)

      toast({
        title: "Канал удален",
        description: "Канал оповещений успешно удален",
      })

      // Если удаляем текущий редактируемый канал, сбрасываем состояние
      if (editingChannel?.id === channelId) {
        setEditingChannel(null)
      }

      logger.info(LogCategory.NOTIFICATIONS, `Канал удален`, { channelId })
    } catch (error) {
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка удаления канала оповещений", error)
      toast({
        title: "Ошибка удаления",
        description: `Не удалось удалить канал: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setConfirmDelete(null)
    }
  }

  // Обработчик удаления правила оповещений
  const handleDeleteRule = async (ruleId: string) => {
    try {
      await onDeleteRule(ruleId)

      toast({
        title: "Правило удалено",
        description: "Правило оповещений успешно удалено",
      })

      // Если удаляем текущее редактируемое правило, сбрасываем состояние
      if (editingRule?.id === ruleId) {
        setEditingRule(null)
      }

      logger.info(LogCategory.NOTIFICATIONS, `Правило удалено`, { ruleId })
    } catch (error) {
      logger.error(LogCategory.NOTIFICATIONS, "Ошибка удаления правила оповещений", error)
      toast({
        title: "Ошибка удаления",
        description: `Не удалось удалить правило: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setConfirmDelete(null)
    }
  }

  // Получение иконки для типа канала
  const getChannelIcon = (type: NotificationChannelType) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5" />
      case "sms":
        return <Smartphone className="h-5 w-5" />
      case "telegram":
        return <MessageSquare className="h-5 w-5" />
      case "push":
        return <Bell className="h-5 w-5" />
      case "webhook":
        return <Globe className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  // Получение названия типа канала
  const getChannelTypeName = (type: NotificationChannelType) => {
    switch (type) {
      case "email":
        return "Email"
      case "sms":
        return "SMS"
      case "telegram":
        return "Telegram"
      case "push":
        return "Push-уведомления"
      case "webhook":
        return "Webhook"
      default:
        return type
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Настройки оповещений</CardTitle>
        <CardDescription>Настройте каналы и правила оповещений для мониторинга событий</CardDescription>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "channels" | "rules")}
        className="flex-1 flex flex-col"
      >
        <div className="px-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="channels">
              <Settings className="mr-2 h-4 w-4" />
              Каналы оповещений
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Bell className="mr-2 h-4 w-4" />
              Правила оповещений
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="channels" className="flex-1 p-6 pt-2 overflow-auto">
          <div className="space-y-4">
            <Button
              onClick={() =>
                setEditingChannel({
                  id: `new-${Date.now()}`,
                  type: "email",
                  name: "Новый канал",
                  enabled: true,
                  config: {},
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить канал
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <Card key={channel.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(channel.type)}
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                      </div>
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={(checked) => {
                          onSaveChannel({
                            ...channel,
                            enabled: checked,
                          })
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">Тип: {getChannelTypeName(channel.type)}</div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingChannel({ ...channel })}>
                        Редактировать
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleTestChannel(channel.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Тест
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete({ type: "channel", id: channel.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {channels.length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-md">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg">Нет настроенных каналов</h3>
                  <p className="text-muted-foreground mb-4">
                    Добавьте канал оповещений для получения уведомлений о событиях
                  </p>
                  <Button
                    onClick={() =>
                      setEditingChannel({
                        id: `new-${Date.now()}`,
                        type: "email",
                        name: "Новый канал",
                        enabled: true,
                        config: {},
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить канал
                  </Button>
                </div>
              )}
            </div>

            {editingChannel && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingChannel.id.startsWith("new-") ? "Новый канал" : "Редактирование канала"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="channel-name">Название</Label>
                      <Input
                        id="channel-name"
                        value={editingChannel.name}
                        onChange={(e) =>
                          setEditingChannel({
                            ...editingChannel,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="channel-type">Тип</Label>
                      <Select
                        value={editingChannel.type}
                        onValueChange={(value: NotificationChannelType) =>
                          setEditingChannel({
                            ...editingChannel,
                            type: value,
                            config: {}, // Сбрасываем конфигурацию при смене типа
                          })
                        }
                      >
                        <SelectTrigger id="channel-type">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="push">Push-уведомления</SelectItem>
                          <SelectItem value="webhook">Webhook</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="channel-enabled"
                        checked={editingChannel.enabled}
                        onCheckedChange={(checked) =>
                          setEditingChannel({
                            ...editingChannel,
                            enabled: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="channel-enabled">Включен</Label>
                    </div>

                    {/* Динамические поля конфигурации в зависимости от типа канала */}
                    {editingChannel.type === "email" && (
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="email-recipients">Получатели (через запятую)</Label>
                          <Input
                            id="email-recipients"
                            value={editingChannel.config.recipients || ""}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  recipients: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email-subject">Тема письма</Label>
                          <Input
                            id="email-subject"
                            value={editingChannel.config.subject || ""}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  subject: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {editingChannel.type === "sms" && (
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sms-numbers">Номера телефонов (через запятую)</Label>
                          <Input
                            id="sms-numbers"
                            value={editingChannel.config.numbers || ""}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  numbers: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {editingChannel.type === "telegram" && (
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="telegram-chat-id">ID чата или канала</Label>
                          <Input
                            id="telegram-chat-id"
                            value={editingChannel.config.chatId || ""}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  chatId: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="telegram-token">Токен бота</Label>
                          <Input
                            id="telegram-token"
                            type="password"
                            value={editingChannel.config.token || ""}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  token: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {editingChannel.type === "webhook" && (
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="webhook-url">URL вебхука</Label>
                          <Input
                            id="webhook-url"
                            value={editingChannel.config.url || ""}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  url: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="webhook-method">HTTP метод</Label>
                          <Select
                            value={editingChannel.config.method || "POST"}
                            onValueChange={(value) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  method: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger id="webhook-method">
                              <SelectValue placeholder="Выберите метод" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="GET">GET</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="webhook-headers">Заголовки (JSON)</Label>
                          <Textarea
                            id="webhook-headers"
                            value={editingChannel.config.headers || "{}"}
                            onChange={(e) =>
                              setEditingChannel({
                                ...editingChannel,
                                config: {
                                  ...editingChannel.config,
                                  headers: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setEditingChannel(null)}>
                        Отмена
                      </Button>
                      <Button onClick={handleSaveChannel} disabled={isSaving}>
                        {isSaving ? "Сохранение..." : "Сохранить"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="flex-1 p-6 pt-2 overflow-auto">
          <div className="space-y-4">
            <Button
              onClick={() =>
                setEditingRule({
                  id: `new-${Date.now()}`,
                  name: "Новое правило",
                  eventTypes: [],
                  severity: "medium",
                  channels: [],
                  enabled: true,
                  schedule: {
                    allDay: true,
                    timeRanges: [{ start: "00:00", end: "23:59" }],
                    weekdays: [1, 2, 3, 4, 5, 6, 7],
                  },
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Добавить правило
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            rule.severity === "critical"
                              ? "text-destructive"
                              : rule.severity === "high"
                                ? "text-warning"
                                : rule.severity === "medium"
                                  ? "text-amber-500"
                                  : "text-muted-foreground"
                          }`}
                        />
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => {
                          onSaveRule({
                            ...rule,
                            enabled: checked,
                          })
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-muted-foreground">
                        Важность:{" "}
                        {rule.severity === "critical"
                          ? "Критическая"
                          : rule.severity === "high"
                            ? "Высокая"
                            : rule.severity === "medium"
                              ? "Средняя"
                              : "Низкая"}
                      </div>
                      <div className="text-sm text-muted-foreground">События: {rule.eventTypes.length}</div>
                      <div className="text-sm text-muted-foreground">Каналы: {rule.channels.length}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rule.schedule.allDay ? "Круглосуточно" : "По расписанию"}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingRule({ ...rule })}>
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDelete({ type: "rule", id: rule.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {rules.length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-md">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg">Нет настроенных правил</h3>
                  <p className="text-muted-foreground mb-4">
                    Добавьте правило оповещений для настройки условий отправки уведомлений
                  </p>
                  <Button
                    onClick={() =>
                      setEditingRule({
                        id: `new-${Date.now()}`,
                        name: "Новое правило",
                        eventTypes: [],
                        severity: "medium",
                        channels: [],
                        enabled: true,
                        schedule: {
                          allDay: true,
                          timeRanges: [{ start: "00:00", end: "23:59" }],
                          weekdays: [1, 2, 3, 4, 5, 6, 7],
                        },
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить правило
                  </Button>
                </div>
              )}
            </div>

            {editingRule && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingRule.id.startsWith("new-") ? "Новое правило" : "Редактирование правила"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="rule-name">Название</Label>
                      <Input
                        id="rule-name"
                        value={editingRule.name}
                        onChange={(e) =>
                          setEditingRule({
                            ...editingRule,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="rule-severity">Важность</Label>
                      <Select
                        value={editingRule.severity}
                        onValueChange={(value: "low" | "medium" | "high" | "critical") =>
                          setEditingRule({
                            ...editingRule,
                            severity: value,
                          })
                        }
                      >
                        <SelectTrigger id="rule-severity">
                          <SelectValue placeholder="Выберите важность" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкая</SelectItem>
                          <SelectItem value="medium">Средняя</SelectItem>
                          <SelectItem value="high">Высокая</SelectItem>
                          <SelectItem value="critical">Критическая</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Типы событий</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {EVENT_TYPES.map((eventType) => (
                          <div key={eventType.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`event-${eventType.id}`}
                              checked={editingRule.eventTypes.includes(eventType.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setEditingRule({
                                    ...editingRule,
                                    eventTypes: [...editingRule.eventTypes, eventType.id],
                                  })
                                } else {
                                  setEditingRule({
                                    ...editingRule,
                                    eventTypes: editingRule.eventTypes.filter((id) => id !== eventType.id),
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={`event-${eventType.id}`} className="cursor-pointer">
                              {eventType.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Каналы оповещений</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {channels.length > 0 ? (
                          channels.map((channel) => (
                            <div key={channel.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`channel-${channel.id}`}
                                checked={editingRule.channels.includes(channel.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEditingRule({
                                      ...editingRule,
                                      channels: [...editingRule.channels, channel.id],
                                    })
                                  } else {
                                    setEditingRule({
                                      ...editingRule,
                                      channels: editingRule.channels.filter((id) => id !== channel.id),
                                    })
                                  }
                                }}
                                disabled={!channel.enabled}
                              />
                              <Label
                                htmlFor={`channel-${channel.id}`}
                                className={`cursor-pointer flex items-center gap-2 ${!channel.enabled ? "text-muted-foreground" : ""}`}
                              >
                                {getChannelIcon(channel.type)}
                                {channel.name}
                                {!channel.enabled && <span className="text-xs">(отключен)</span>}
                              </Label>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-2 text-muted-foreground">
                            Нет настроенных каналов оповещений
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Расписание</Label>
                      <div className="border rounded-md p-3 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="schedule-all-day"
                            checked={editingRule.schedule.allDay}
                            onCheckedChange={(checked) => {
                              setEditingRule({
                                ...editingRule,
                                schedule: {
                                  ...editingRule.schedule,
                                  allDay: checked as boolean,
                                },
                              })
                            }}
                          />
                          <Label htmlFor="schedule-all-day" className="cursor-pointer">
                            Круглосуточно
                          </Label>
                        </div>

                        {!editingRule.schedule.allDay && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Временные интервалы</Label>
                              <div className="space-y-2">
                                {editingRule.schedule.timeRanges.map((range, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={range.start}
                                      onChange={(e) => {
                                        const newRanges = [...editingRule.schedule.timeRanges]
                                        newRanges[index] = { ...range, start: e.target.value }
                                        setEditingRule({
                                          ...editingRule,
                                          schedule: {
                                            ...editingRule.schedule,
                                            timeRanges: newRanges,
                                          },
                                        })
                                      }}
                                      className="w-32"
                                    />
                                    <span>—</span>
                                    <Input
                                      type="time"
                                      value={range.end}
                                      onChange={(e) => {
                                        const newRanges = [...editingRule.schedule.timeRanges]
                                        newRanges[index] = { ...range, end: e.target.value }
                                        setEditingRule({
                                          ...editingRule,
                                          schedule: {
                                            ...editingRule.schedule,
                                            timeRanges: newRanges,
                                          },
                                        })
                                      }}
                                      className="w-32"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newRanges = editingRule.schedule.timeRanges.filter((_, i) => i !== index)
                                        setEditingRule({
                                          ...editingRule,
                                          schedule: {
                                            ...editingRule.schedule,
                                            timeRanges: newRanges.length
                                              ? newRanges
                                              : [{ start: "00:00", end: "23:59" }],
                                          },
                                        })
                                      }}
                                      disabled={editingRule.schedule.timeRanges.length <= 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingRule({
                                    ...editingRule,
                                    schedule: {
                                      ...editingRule.schedule,
                                      timeRanges: [
                                        ...editingRule.schedule.timeRanges,
                                        { start: "09:00", end: "18:00" },
                                      ],
                                    },
                                  })
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить интервал
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label>Дни недели</Label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { id: 1, name: "Пн" },
                                  { id: 2, name: "Вт" },
                                  { id: 3, name: "Ср" },
                                  { id: 4, name: "Чт" },
                                  { id: 5, name: "Пт" },
                                  { id: 6, name: "Сб" },
                                  { id: 7, name: "Вс" },
                                ].map((day) => (
                                  <div key={day.id} className="flex items-center">
                                    <Checkbox
                                      id={`day-${day.id}`}
                                      checked={editingRule.schedule.weekdays.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setEditingRule({
                                            ...editingRule,
                                            schedule: {
                                              ...editingRule.schedule,
                                              weekdays: [...editingRule.schedule.weekdays, day.id].sort(),
                                            },
                                          })
                                        } else {
                                          setEditingRule({
                                            ...editingRule,
                                            schedule: {
                                              ...editingRule.schedule,
                                              weekdays: editingRule.schedule.weekdays.filter((id) => id !== day.id),
                                            },
                                          })
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`day-${day.id}`} className="ml-2 cursor-pointer">
                                      {day.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rule-enabled"
                        checked={editingRule.enabled}
                        onCheckedChange={(checked) =>
                          setEditingRule({
                            ...editingRule,
                            enabled: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="rule-enabled">Включено</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setEditingRule(null)}>
                        Отмена
                      </Button>
                      <Button onClick={handleSaveRule} disabled={isSaving}>
                        {isSaving ? "Сохранение..." : "Сохранить"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDelete?.type === "channel" ? "Удаление канала" : "Удаление правила"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.type === "channel"
                ? "Вы уверены, что хотите удалить этот канал оповещений? Это действие нельзя отменить."
                : "Вы уверены, что хотите удалить это правило оповещений? Это действие нельзя отменить."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete?.type === "channel") {
                  handleDeleteChannel(confirmDelete.id)
                } else if (confirmDelete?.type === "rule") {
                  handleDeleteRule(confirmDelete.id)
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
