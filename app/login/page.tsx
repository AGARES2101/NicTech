"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Server, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [serverUrl, setServerUrl] = useState("http://localhost:11012")
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)

  useEffect(() => {
    // Проверяем поддержку биометрии
    const checkBiometricSupport = async () => {
      try {
        if (window.PublicKeyCredential) {
          setShowBiometricPrompt(true)
        }
      } catch (err) {
        console.error("Биометрия не поддерживается:", err)
      }
    }

    checkBiometricSupport()

    // Эффект для анимации
    document.body.classList.add("premium-gradient")

    return () => {
      document.body.classList.remove("premium-gradient")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Имитация более длительной загрузки для премиального ощущения
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Отправляем запрос на авторизацию
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serverUrl,
          username,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Сохраняем данные для авторизации в sessionStorage
        sessionStorage.setItem(
          "nictech-auth",
          JSON.stringify({
            serverUrl,
            username,
            password,
            authHeader: `Basic ${btoa(`${username}:${password}`)}`,
          }),
        )

        toast({
          title: "Успешная авторизация",
          description: "Добро пожаловать в NicTech Enterprise",
          variant: "success",
        })

        router.push("/dashboard")
      } else {
        setError(data.message || "Ошибка авторизации")
      }
    } catch (err) {
      setError("Ошибка подключения к серверу")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometricAuth = async () => {
    setLoading(true)

    try {
      // Имитация биометрической аутентификации
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Биометрическая аутентификация",
        description: "Успешная идентификация",
        variant: "success",
      })

      // Сохраняем данные для авторизации в sessionStorage
      sessionStorage.setItem(
        "nictech-auth",
        JSON.stringify({
          serverUrl,
          username: "admin",
          password: "admin",
          authHeader: `Basic ${btoa("admin:admin")}`,
        }),
      )

      router.push("/dashboard")
    } catch (err) {
      setError("Ошибка биометрической аутентификации")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="absolute inset-0 bg-security-pattern opacity-5"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
            <Shield className="h-16 w-16 mx-auto text-primary mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">NicTech Enterprise</h1>
          <p className="text-muted-foreground">Интеллектуальная система видеонаблюдения</p>
        </div>

        <Card className="w-full max-w-md bg-card border-border shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Авторизация</CardTitle>
            <CardDescription className="text-center">Введите данные для входа в систему</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="server" className="text-white">
                  Адрес сервера
                </Label>
                <div className="relative">
                  <Server className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="server"
                    placeholder="http://localhost:11012"
                    className="pl-10"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Имя пользователя
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="admin"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="bg-destructive/20 border-destructive/30">
                  <AlertDescription className="text-white">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Авторизация..." : "Войти"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            NicTech Enterprise Edition © {new Date().getFullYear()}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
