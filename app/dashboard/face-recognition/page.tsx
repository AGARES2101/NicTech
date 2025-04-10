"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, RefreshCw, Filter, Download, Plus, UserPlus, User, Settings2, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { parseStringPromise } from "xml2js"

interface FRPerson {
  ID: string
  FirstName: string
  FamilyName: string
  MiddleName?: string
  WorkPlace?: string
  Position?: string
  Phone?: string
  CardNumber?: string
  CardVersion?: string
  Description?: string
  GroupIDs?: { GroupID: string[] }
  Photos?: { Photo: string[] }
}

interface FRGroup {
  ID: string
  Name: string
  Color: string
}

export default function FaceRecognitionPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [persons, setPersons] = useState<FRPerson[]>([])
  const [groups, setGroups] = useState<FRGroup[]>([])
  const [error, setError] = useState("")
  const [authData, setAuthData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<FRPerson | null>(null)
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false)
  const [newPerson, setNewPerson] = useState<Partial<FRPerson>>({})
  const [newPersonPhoto, setNewPersonPhoto] = useState<string | null>(null)

  // Получение данных авторизации из sessionStorage
  useEffect(() => {
    const auth = sessionStorage.getItem("nictech-auth")
    if (auth) {
      try {
        setAuthData(JSON.parse(auth))
      } catch (e) {
        console.error("Ошибка при разборе данных авторизации:", e)
        router.push("/login")
      }
    } else {
      // Для тестирования в режиме разработки можно использовать мок-данные
      if (process.env.NODE_ENV === "development") {
        console.log("Режим разработки: используем мок-данные для авторизации")
        setAuthData({
          serverUrl: "http://mock-server",
          authHeader: "Basic mock-auth",
        })
      } else {
        router.push("/login")
      }
    }
  }, [router])

  // Загрузка списка лиц и групп
  useEffect(() => {
    if (!authData) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Загрузка списка лиц
        const personsResponse = await fetch("/api/modules/fr/persons?sendphotos=1", {
          headers: {
            "server-url": authData.serverUrl,
            authorization: authData.authHeader,
          },
        })

        if (!personsResponse.ok) {
          throw new Error(`Ошибка получения списка лиц: ${personsResponse.statusText}`)
        }

        const personsXml = await personsResponse.text()
        const personsData = await parseStringPromise(personsXml, { explicitArray: false })

        let personsList: FRPerson[] = []
        if (personsData.FRPersons && personsData.FRPersons.FRPerson) {
          personsList = Array.isArray(personsData.FRPersons.FRPerson)
            ? personsData.FRPersons.FRPerson
            : [personsData.FRPersons.FRPerson]
        }

        setPersons(personsList)

        // Загрузка списка групп
        const groupsResponse = await fetch("/api/modules/fr/groups", {
          headers: {
            "server-url": authData.serverUrl,
            authorization: authData.authHeader,
          },
        })

        if (!groupsResponse.ok) {
          throw new Error(`Ошибка получения списка групп: ${groupsResponse.statusText}`)
        }

        const groupsXml = await groupsResponse.text()
        const groupsData = await parseStringPromise(groupsXml, { explicitArray: false })

        let groupsList: FRGroup[] = []
        if (groupsData.FRGroups && groupsData.FRGroups.FRGroup) {
          groupsList = Array.isArray(groupsData.FRGroups.FRGroup)
            ? groupsData.FRGroups.FRGroup
            : [groupsData.FRGroups.FRGroup]
        }

        setGroups(groupsList)
      } catch (err) {
        console.error("Ошибка загрузки данных:", err)
        setError(err instanceof Error ? err.message : "Не удалось загрузить данные")
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

  // Фильтрация лиц по поисковому запросу
  const filteredPersons = persons.filter((person) => {
    const fullName = `${person.FamilyName || ""} ${person.FirstName || ""} ${person.MiddleName || ""}`.toLowerCase()
    const cardNumber = person.CardNumber?.toLowerCase() || ""
    const workplace = person.WorkPlace?.toLowerCase() || ""

    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      cardNumber.includes(searchQuery.toLowerCase()) ||
      workplace.includes(searchQuery.toLowerCase())
    )
  })

  // Обработчик добавления нового лица
  const handleAddPerson = async () => {
    try {
      if (!newPerson.FirstName || !newPerson.FamilyName) {
        setError("Необходимо указать имя и фамилию")
        return
      }

      // Генерируем уникальный ID для нового лица
      const newId = crypto.randomUUID()

      // Формируем XML для запроса
      let xmlData = `<FRPerson>
        <ID>${newId}</ID>
        <FirstName>${newPerson.FirstName}</FirstName>
        <FamilyName>${newPerson.FamilyName}</FamilyName>
        <MiddleName>${newPerson.MiddleName || ""}</MiddleName>
        <WorkPlace>${newPerson.WorkPlace || ""}</WorkPlace>
        <Position>${newPerson.Position || ""}</Position>
        <Phone>${newPerson.Phone || ""}</Phone>
        <CardNumber>${newPerson.CardNumber || ""}</CardNumber>
        <CardVersion>0</CardVersion>
        <Description>${newPerson.Description || ""}</Description>
        <GroupIDs>
          <GroupID>${groups.length > 0 ? groups[0].ID : ""}</GroupID>
        </GroupIDs>`

      // Добавляем фото, если оно есть
      if (newPersonPhoto) {
        xmlData += `<Photos>
          <Photo>${newPersonPhoto}</Photo>
        </Photos>`
      }

      xmlData += `</FRPerson>`

      // Отправляем запрос на добавление лица
      const response = await fetch("/api/modules/fr/persons", {
        method: "POST",
        headers: {
          "server-url": authData.serverUrl,
          authorization: authData.authHeader,
          "Content-Type": "text/xml; charset=utf-8",
        },
        body: xmlData,
      })

      if (!response.ok) {
        throw new Error(`Ошибка добавления лица: ${response.statusText}`)
      }

      // Обновляем список лиц
      setRefreshing(true)
      setIsAddPersonDialogOpen(false)
      setNewPerson({})
      setNewPersonPhoto(null)
    } catch (err) {
      console.error("Ошибка добавления лица:", err)
      setError(err instanceof Error ? err.message : "Не удалось добавить лицо")
    }
  }

  // Обработчик загрузки фото
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          // Получаем Base64 строку без префикса data:image/...
          const base64String = (event.target.result as string).split(",")[1]
          setNewPersonPhoto(base64String)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Обработчик удаления лица
  const handleDeletePerson = async (personId: string) => {
    try {
      // Отправляем запрос на удаление лица
      const response = await fetch(`/api/modules/fr/persons/${personId}`, {
        method: "DELETE",
        headers: {
          "server-url": authData.serverUrl,
          authorization: authData.authHeader,
        },
      })

      if (!response.ok) {
        throw new Error(`Ошибка удаления лица: ${response.statusText}`)
      }

      // Обновляем список лиц
      setRefreshing(true)
      setSelectedPerson(null)
    } catch (err) {
      console.error("Ошибка удаления лица:", err)
      setError(err instanceof Error ? err.message : "Не удалось удалить лицо")
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-background">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Распознавание лиц</h1>
            <p className="text-muted-foreground mt-1">Управление картотекой и мониторинг</p>
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

            <Dialog open={isAddPersonDialogOpen} onOpenChange={setIsAddPersonDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить лицо
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Добавить новое лицо</DialogTitle>
                  <DialogDescription>
                    Заполните информацию о человеке и загрузите фотографию для распознавания.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="firstName" className="text-right">
                      Имя
                    </Label>
                    <Input
                      id="firstName"
                      value={newPerson.FirstName || ""}
                      onChange={(e) => setNewPerson({ ...newPerson, FirstName: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="familyName" className="text-right">
                      Фамилия
                    </Label>
                    <Input
                      id="familyName"
                      value={newPerson.FamilyName || ""}
                      onChange={(e) => setNewPerson({ ...newPerson, FamilyName: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="middleName" className="text-right">
                      Отчество
                    </Label>
                    <Input
                      id="middleName"
                      value={newPerson.MiddleName || ""}
                      onChange={(e) => setNewPerson({ ...newPerson, MiddleName: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cardNumber" className="text-right">
                      Номер карты
                    </Label>
                    <Input
                      id="cardNumber"
                      value={newPerson.CardNumber || ""}
                      onChange={(e) => setNewPerson({ ...newPerson, CardNumber: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="photo" className="text-right">
                      Фото
                    </Label>
                    <div className="col-span-3">
                      <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} />
                      {newPersonPhoto && (
                        <div className="mt-2 flex justify-center">
                          <img
                            src={`data:image/jpeg;base64,${newPersonPhoto}`}
                            alt="Preview"
                            className="max-h-32 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddPerson}>
                    Добавить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="persons" className="flex-1 flex flex-col">
        <div className="px-6 pt-2 border-b">
          <TabsList>
            <TabsTrigger value="persons">
              <User className="mr-2 h-4 w-4" />
              Картотека
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="mr-2 h-4 w-4" />
              Группы
            </TabsTrigger>
            <TabsTrigger value="events">
              <Bell className="mr-2 h-4 w-4" />
              События
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="persons" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Список лиц</h2>
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

            {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

            {loading ? (
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
              </div>
            ) : filteredPersons.length > 0 ? (
              <div className="space-y-4">
                {filteredPersons.map((person) => (
                  <motion.div
                    key={person.ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`hover:shadow-md transition-shadow cursor-pointer ${selectedPerson?.ID === person.ID ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedPerson(selectedPerson?.ID === person.ID ? null : person)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          {person.Photos?.Photo?.[0] ? (
                            <AvatarImage
                              src={`data:image/jpeg;base64,${person.Photos.Photo[0]}`}
                              alt={`${person.FirstName} ${person.FamilyName}`}
                            />
                          ) : (
                            <AvatarFallback>
                              {person.FirstName?.[0] || ""}
                              {person.FamilyName?.[0] || ""}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">
                              {person.FamilyName} {person.FirstName} {person.MiddleName}
                            </h3>
                            {person.CardNumber && (
                              <Badge className="bg-primary text-primary-foreground">Карта: {person.CardNumber}</Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                            {person.Position && <p className="text-sm text-muted-foreground">{person.Position}</p>}
                            {person.WorkPlace && <p className="text-sm text-muted-foreground">{person.WorkPlace}</p>}
                          </div>
                          {person.Phone && (
                            <p className="text-xs text-muted-foreground mt-1">Телефон: {person.Phone}</p>
                          )}
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
                                <p>Профиль</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Settings2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Настройки</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                      {selectedPerson?.ID === person.ID && (
                        <CardFooter className="border-t p-4">
                          <div className="w-full">
                            <div className="flex justify-between mb-4">
                              <h4 className="font-medium">Дополнительная информация</h4>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeletePerson(person.ID)
                                }}
                              >
                                Удалить
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {person.Photos?.Photo?.[0] && (
                                <div className="flex justify-center">
                                  <img
                                    src={`data:image/jpeg;base64,${person.Photos.Photo[0]}`}
                                    alt={`${person.FirstName} ${person.FamilyName}`}
                                    className="max-h-48 rounded-md"
                                  />
                                </div>
                              )}
                              <div className="space-y-2">
                                {person.GroupIDs?.GroupID && (
                                  <div>
                                    <span className="text-sm font-medium">Группы:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {Array.isArray(person.GroupIDs.GroupID)
                                        ? person.GroupIDs.GroupID.map((groupId) => {
                                            const group = groups.find((g) => g.ID === groupId)
                                            return group ? (
                                              <Badge
                                                key={groupId}
                                                style={{ backgroundColor: `#${group.Color.substring(2)}` }}
                                              >
                                                {group.Name}
                                              </Badge>
                                            ) : null
                                          })
                                        : (() => {
                                            const group = groups.find((g) => g.ID === person.GroupIDs?.GroupID)
                                            return group ? (
                                              <Badge style={{ backgroundColor: `#${group.Color.substring(2)}` }}>
                                                {group.Name}
                                              </Badge>
                                            ) : null
                                          })()}
                                    </div>
                                  </div>
                                )}
                                {person.Description && (
                                  <div>
                                    <span className="text-sm font-medium">Описание:</span>
                                    <p className="text-sm text-muted-foreground">{person.Description}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardFooter>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Лица не найдены</h3>
                <p className="text-muted-foreground max-w-md">
                  Не найдено лиц, соответствующих заданным критериям поиска.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Группы</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить группу
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <Card key={group.ID}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: `#${group.Color.substring(2)}` }}
                        ></div>
                        {group.Name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ID:</span>
                          <span className="text-sm font-mono">{group.ID.substring(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Количество лиц:</span>
                          <span className="text-sm">
                            {
                              persons.filter(
                                (p) =>
                                  p.GroupIDs?.GroupID &&
                                  (Array.isArray(p.GroupIDs.GroupID)
                                    ? p.GroupIDs.GroupID.includes(group.ID)
                                    : p.GroupIDs.GroupID === group.ID),
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Редактировать
                      </Button>
                      <Button variant="destructive" size="sm">
                        Удалить
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">События распознавания лиц</h2>
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
                          Камера
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Лицо
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Точность
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Статус
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <tr key={i} className="bg-card border-b">
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-32" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-24" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-40" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-16" />
                              </td>
                              <td className="px-6 py-4">
                                <Skeleton className="h-4 w-20" />
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr className="bg-card border-b">
                          <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                            Для получения событий распознавания лиц в реальном времени необходимо подключиться к
                            серверу.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
