"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { logger, LogCategory } from "@/lib/logger"
import { GripVertical, Save, Plus, Trash2, Pencil, X, Check, Layout, LayoutGrid } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CameraItem {
  id: string
  name: string
  status: string
}

interface CameraLayout {
  id: string
  name: string
  description?: string
  grid: string // "1x1", "2x2", "3x3", "4x4", "custom"
  cameras: string[] // массив ID камер
  isDefault?: boolean
}

interface SortableCameraItemProps {
  camera: CameraItem
  index: number
}

function SortableCameraItem({ camera, index }: SortableCameraItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: camera.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 mb-2 bg-card border rounded-md flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="cursor-move touch-none" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="font-medium">{camera.name}</div>
          <div className="text-xs text-muted-foreground">Позиция: {index + 1}</div>
        </div>
      </div>
      <Badge
        variant="outline"
        className={`
          ${
            camera.status === "online"
              ? "bg-success/10 text-success"
              : camera.status === "offline"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground"
          }
        `}
      >
        {camera.status === "online" ? "Онлайн" : camera.status === "offline" ? "Офлайн" : "Отключена"}
      </Badge>
    </div>
  )
}

interface CameraLayoutEditorProps {
  cameras: CameraItem[]
  layouts: CameraLayout[]
  serverUrl?: string
  authHeader?: string
  onSaveLayout: (layout: CameraLayout) => Promise<void>
  onDeleteLayout: (layoutId: string) => Promise<void>
  onSetDefaultLayout: (layoutId: string) => Promise<void>
}

export function CameraLayoutEditor({
  cameras,
  layouts,
  serverUrl,
  authHeader,
  onSaveLayout,
  onDeleteLayout,
  onSetDefaultLayout,
}: CameraLayoutEditorProps) {
  const [activeTab, setActiveTab] = useState<"list" | "edit">("list")
  const [selectedLayout, setSelectedLayout] = useState<CameraLayout | null>(null)
  const [editingLayout, setEditingLayout] = useState<CameraLayout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Создание нового макета
  const handleCreateLayout = () => {
    const newLayout: CameraLayout = {
      id: `new-${Date.now()}`,
      name: "Новый макет",
      grid: "2x2",
      cameras: [],
      isDefault: layouts.length === 0, // Если это первый макет, делаем его по умолчанию
    }

    setEditingLayout(newLayout)
    setIsEditing(true)
    setActiveTab("edit")
  }

  // Редактирование существующего макета
  const handleEditLayout = (layout: CameraLayout) => {
    setEditingLayout({ ...layout })
    setIsEditing(true)
    setActiveTab("edit")
  }

  // Обработка перетаскивания камер
  const handleDragEnd = (event: DragEndEvent) => {
    if (!editingLayout) return

    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = editingLayout.cameras.indexOf(active.id.toString())
      const newIndex = editingLayout.cameras.indexOf(over?.id.toString() || "")

      if (oldIndex !== -1 && newIndex !== -1) {
        setEditingLayout({
          ...editingLayout,
          cameras: arrayMove(editingLayout.cameras, oldIndex, newIndex),
        })
      }
    }
  }

  // Добавление камеры в макет
  const handleAddCamera = (cameraId: string) => {
    if (!editingLayout) return

    if (editingLayout.cameras.includes(cameraId)) {
      toast({
        title: "Камера уже добавлена",
        description: "Эта камера уже присутствует в макете",
        variant: "destructive",
      })
      return
    }

    setEditingLayout({
      ...editingLayout,
      cameras: [...editingLayout.cameras, cameraId],
    })
  }

  // Удаление камеры из макета
  const handleRemoveCamera = (cameraId: string) => {
    if (!editingLayout) return

    setEditingLayout({
      ...editingLayout,
      cameras: editingLayout.cameras.filter((id) => id !== cameraId),
    })
  }

  // Сохранение макета
  const handleSaveLayout = async () => {
    if (!editingLayout) return

    try {
      setIsSaving(true)

      // Проверяем, что у макета есть название
      if (!editingLayout.name.trim()) {
        toast({
          title: "Ошибка сохранения",
          description: "Необходимо указать название макета",
          variant: "destructive",
        })
        return
      }

      await onSaveLayout(editingLayout)

      toast({
        title: "Макет сохранен",
        description: "Макет камер успешно сохранен",
      })

      // Сбрасываем состояние редактирования
      setIsEditing(false)
      setEditingLayout(null)
      setActiveTab("list")

      logger.info(LogCategory.UI, `Макет "${editingLayout.name}" сохранен`, { layoutId: editingLayout.id })
    } catch (error) {
      logger.error(LogCategory.UI, "Ошибка сохранения макета камер", error)
      toast({
        title: "Ошибка сохранения",
        description: `Не удалось сохранить макет: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Удаление макета
  const handleDeleteLayout = async (layoutId: string) => {
    try {
      await onDeleteLayout(layoutId)

      toast({
        title: "Макет удален",
        description: "Макет камер успешно удален",
      })

      // Если удаляем текущий выбранный макет, сбрасываем выбор
      if (selectedLayout?.id === layoutId) {
        setSelectedLayout(null)
      }

      logger.info(LogCategory.UI, `Макет удален`, { layoutId })
    } catch (error) {
      logger.error(LogCategory.UI, "Ошибка удаления макета камер", error)
      toast({
        title: "Ошибка удаления",
        description: `Не удалось удалить макет: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  // Установка макета по умолчанию
  const handleSetDefaultLayout = async (layoutId: string) => {
    try {
      await onSetDefaultLayout(layoutId)

      toast({
        title: "Макет по умолчанию",
        description: "Макет камер установлен по умолчанию",
      })

      logger.info(LogCategory.UI, `Макет установлен по умолчанию`, { layoutId })
    } catch (error) {
      logger.error(LogCategory.UI, "Ошибка установки макета по умолчанию", error)
      toast({
        title: "Ошибка",
        description: `Не удалось установить макет по умолчанию: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  // Отмена редактирования
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingLayout(null)
    setActiveTab("list")
  }

  // Получение камеры по ID
  const getCameraById = (cameraId: string) => {
    return cameras.find((camera) => camera.id === cameraId) || null
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Настройка раскладок камер</CardTitle>
        <CardDescription>Создавайте и настраивайте раскладки камер для удобного мониторинга</CardDescription>
      </CardHeader>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "list" | "edit")}
        className="flex-1 flex flex-col"
      >
        <div className="px-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="list" disabled={isEditing}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Список раскладок
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={isEditing && !editingLayout}>
              <Layout className="mr-2 h-4 w-4" />
              Редактирование
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="flex-1 p-6 pt-2">
          <div className="space-y-4">
            <Button onClick={handleCreateLayout}>
              <Plus className="mr-2 h-4 w-4" />
              Создать раскладку
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {layouts.map((layout) => (
                <Card key={layout.id} className={layout.isDefault ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{layout.name}</CardTitle>
                      {layout.isDefault && <Badge variant="default">По умолчанию</Badge>}
                    </div>
                    {layout.description && <CardDescription>{layout.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-2">
                      Сетка: {layout.grid === "custom" ? "Пользовательская" : layout.grid}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">Камер: {layout.cameras.length}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditLayout(layout)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                      {!layout.isDefault && (
                        <Button variant="outline" size="sm" onClick={() => handleSetDefaultLayout(layout.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          По умолчанию
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteLayout(layout.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {layouts.length === 0 && (
                <div className="col-span-full text-center p-8 border rounded-md">
                  <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg">Нет раскладок</h3>
                  <p className="text-muted-foreground mb-4">У вас пока нет настроенных раскладок камер</p>
                  <Button onClick={handleCreateLayout}>
                    <Plus className="mr-2 h-4 w-4" />
                    Создать раскладку
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 p-6 pt-2">
          {editingLayout ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="layout-name">Название раскладки</Label>
                  <Input
                    id="layout-name"
                    value={editingLayout.name}
                    onChange={(e) =>
                      setEditingLayout({
                        ...editingLayout,
                        name: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="layout-grid">Тип сетки</Label>
                  <Select
                    value={editingLayout.grid}
                    onValueChange={(value) =>
                      setEditingLayout({
                        ...editingLayout,
                        grid: value,
                      })
                    }
                  >
                    <SelectTrigger id="layout-grid" className="mt-1">
                      <SelectValue placeholder="Выберите тип сетки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1x1">1 x 1</SelectItem>
                      <SelectItem value="2x2">2 x 2</SelectItem>
                      <SelectItem value="3x3">3 x 3</SelectItem>
                      <SelectItem value="4x4">4 x 4</SelectItem>
                      <SelectItem value="custom">Пользовательская</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="layout-description">Описание (опционально)</Label>
                  <Input
                    id="layout-description"
                    value={editingLayout.description || ""}
                    onChange={(e) =>
                      setEditingLayout({
                        ...editingLayout,
                        description: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Камеры в раскладке</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Перетаскивайте камеры для изменения порядка отображения
                  </p>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={editingLayout.cameras}>
                      <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto p-1">
                        {editingLayout.cameras.length > 0 ? (
                          editingLayout.cameras.map((cameraId, index) => {
                            const camera = getCameraById(cameraId)
                            if (!camera) return null

                            return (
                              <div key={cameraId} className="flex items-center gap-2">
                                <SortableCameraItem camera={camera} index={index} />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveCamera(cameraId)}
                                  className="flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-center p-4 border rounded-md">
                            <p className="text-muted-foreground">Добавьте камеры из списка справа</p>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Доступные камеры</h3>
                  <p className="text-xs text-muted-foreground mb-4">Нажмите на камеру, чтобы добавить ее в раскладку</p>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
                    {cameras.map((camera) => (
                      <div
                        key={camera.id}
                        className={`p-3 border rounded-md flex items-center justify-between hover:bg-muted/50 cursor-pointer ${
                          editingLayout.cameras.includes(camera.id) ? "opacity-50" : ""
                        }`}
                        onClick={() => !editingLayout.cameras.includes(camera.id) && handleAddCamera(camera.id)}
                      >
                        <div>
                          <div className="font-medium">{camera.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {editingLayout.cameras.includes(camera.id) ? "Уже добавлена" : "Нажмите, чтобы добавить"}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              camera.status === "online"
                                ? "bg-success/10 text-success"
                                : camera.status === "offline"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                            }
                          `}
                        >
                          {camera.status === "online" ? "Онлайн" : camera.status === "offline" ? "Офлайн" : "Отключена"}
                        </Badge>
                      </div>
                    ))}

                    {cameras.length === 0 && (
                      <div className="text-center p-4 border rounded-md">
                        <p className="text-muted-foreground">Нет доступных камер</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Отмена
                </Button>
                <Button onClick={handleSaveLayout} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Сохранить раскладку
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg">Выберите раскладку для редактирования</h3>
              <p className="text-muted-foreground mb-4">Выберите существующую раскладку или создайте новую</p>
              <Button onClick={handleCreateLayout}>
                <Plus className="mr-2 h-4 w-4" />
                Создать раскладку
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
