"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Bell,
  Camera,
  Clock,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
  Users,
  BarChart3,
  Map,
  Layers,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SystemStatus } from "@/components/system-status"
import { motion } from "framer-motion"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [authData, setAuthData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)

    // Проверка авторизации
    const auth = sessionStorage.getItem("nictech-auth")
    if (!auth) {
      router.push("/login")
    } else {
      setAuthData(JSON.parse(auth))
    }

    // Адаптивное сворачивание меню
    const handleResize = () => {
      setCollapsed(window.innerWidth < 1280)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem("nictech-auth")
    router.push("/login")
  }

  if (!mounted) return null

  const navItems = [
    { id: "", label: "Обзор", icon: LayoutDashboard, badge: null },
    { id: "cameras", label: "Камеры", icon: Camera, badge: null },
    { id: "archive", label: "Архив", icon: Clock, badge: null },
    { id: "events", label: "События", icon: Bell, badge: notifications > 0 ? notifications : null },
    { id: "analytics", label: "Аналитика", icon: BarChart3, badge: null },
    { id: "map", label: "Карта объектов", icon: Map, badge: null },
    { id: "access", label: "Контроль доступа", icon: Users, badge: null },
    { id: "reports", label: "Отчеты", icon: FileText, badge: null },
    { id: "integrations", label: "Интеграции", icon: Layers, badge: null },
    { id: "ai", label: "Искусственный интеллект", icon: Cpu, badge: "NEW" },
    { id: "settings", label: "Настройки", icon: Settings, badge: null },
  ]

  const activeItem =
    navItems.find((item) => pathname === `/dashboard/${item.id}` || (item.id === "" && pathname === "/dashboard"))
      ?.id || ""

  return (
    <div className="flex h-screen bg-background">
      {/* Боковая панель для десктопа */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className={cn("p-4 border-b flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">NicTech</h1>
            </div>
          )}
          {collapsed && <Shield className="h-6 w-6 text-primary" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "hidden" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeItem === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed ? "px-2" : "",
                      activeItem === item.id && "bg-secondary",
                    )}
                    onClick={() => router.push(`/dashboard/${item.id}`)}
                  >
                    <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <Badge variant={item.badge === "NEW" ? "outline" : "default"} className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    <div className="flex items-center">
                      {item.label}
                      {item.badge && (
                        <Badge variant={item.badge === "NEW" ? "outline" : "default"} className="ml-2">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        <div className={cn("p-4 border-t", collapsed ? "flex justify-center" : "")}>
          {!collapsed && <SystemStatus serverUrl={authData?.serverUrl} authHeader={authData?.authHeader} />}

          <div className={cn("flex items-center justify-between mt-4", collapsed ? "flex-col gap-4" : "")}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={collapsed ? "right" : "top"}>
                  {theme === "dark" ? "Светлая тема" : "Темная тема"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!collapsed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-2 pr-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Администратор</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Профиль
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer" onClick={() => router.push("/dashboard/profile")}>
                      <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right">Администратор</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </aside>

      {/* Мобильная навигация */}
      <div className="lg:hidden flex items-center p-4 border-b w-full bg-card">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">NicTech Enterprise</h1>
              </div>
            </div>
            <nav className="flex flex-col p-4 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeItem === item.id ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", activeItem === item.id && "bg-secondary")}
                  onClick={() => {
                    router.push(`/dashboard/${item.id}`)
                    document.querySelector("[data-radix-collection-item]")?.click() // Закрыть Sheet
                  }}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                  {item.badge && (
                    <Badge variant={item.badge === "NEW" ? "outline" : "default"} className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>
            <div className="absolute bottom-4 left-4 right-4 space-y-4">
              <SystemStatus serverUrl={authData?.serverUrl} authHeader={authData?.authHeader} />

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button variant="outline" className="w-full justify-start ml-2" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center ml-4">
          <Shield className="h-5 w-5 text-primary mr-2" />
          <h1 className="text-lg font-bold">NicTech Enterprise</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => router.push("/dashboard/events")}
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>События</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Avatar className="h-8 w-8" onClick={() => router.push("/dashboard/profile")}>
            <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Основной контент */}
      <motion.main
        className="flex-1 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  )
}
