"use client"

import { useState } from "react"
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Home, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface PTZControlsProps {
  cameraId: string
  serverUrl?: string
  authHeader?: string
}

export function PTZControls({ cameraId, serverUrl, authHeader }: PTZControlsProps) {
  const [loading, setLoading] = useState(false)

  // Функция для отправки команды PTZ
  const sendPTZCommand = async (action: string) => {
    if (!serverUrl || !authHeader) {
      console.error("Отсутствуют данные авторизации")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/ptz?id=${cameraId}&action=${action}`, {
        headers: {
          "server-url": serverUrl,
          authorization: authHeader,
        },
      })

      if (!response.ok) {
        throw new Error("Ошибка управления PTZ")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || "Ошибка управления PTZ")
      }
    } catch (error) {
      console.error("Ошибка управления PTZ:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить команду PTZ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg">
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("LeftUp")}
          disabled={loading}
        >
          <div className="rotate-[-45deg]">
            <ArrowUp className="h-4 w-4" />
          </div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("Up")}
          disabled={loading}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("RightUp")}
          disabled={loading}
        >
          <div className="rotate-45">
            <ArrowUp className="h-4 w-4" />
          </div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("Left")}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("Home")}
          disabled={loading}
        >
          <Home className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("Right")}
          disabled={loading}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("LeftDown")}
          disabled={loading}
        >
          <div className="rotate-[-135deg]">
            <ArrowUp className="h-4 w-4" />
          </div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("Down")}
          disabled={loading}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("RightDown")}
          disabled={loading}
        >
          <div className="rotate-[135deg]">
            <ArrowUp className="h-4 w-4" />
          </div>
        </Button>
      </div>
      <div className="flex justify-center mt-2 gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("ZoomOut")}
          disabled={loading}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => sendPTZCommand("ZoomIn")}
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
