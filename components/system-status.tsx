"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HardDrive, Cpu, Server, Activity } from "lucide-react"

interface SystemStatusProps {
  serverUrl?: string
  authHeader?: string
}

export function SystemStatus({ serverUrl, authHeader }: SystemStatusProps) {
  const [status, setStatus] = useState<"online" | "warning" | "offline">("online")
  const [cpuUsage, setCpuUsage] = useState(32)
  const [ramUsage, setRamUsage] = useState(45)
  const [diskUsage, setDiskUsage] = useState(68)

  useEffect(() => {
    // В реальном приложении здесь был бы запрос к API для получения статуса системы
    const fetchSystemStatus = async () => {
      if (!serverUrl || !authHeader) return

      try {
        // Имитация запроса к API
        const randomCpu = Math.floor(Math.random() * 40) + 20
        const randomRam = Math.floor(Math.random() * 30) + 30
        const randomDisk = Math.floor(Math.random() * 20) + 60

        setCpuUsage(randomCpu)
        setRamUsage(randomRam)
        setDiskUsage(randomDisk)

        setStatus(randomCpu > 80 || randomRam > 80 ? "warning" : "online")
      } catch (error) {
        console.error("Ошибка получения статуса системы:", error)
        setStatus("warning")
      }
    }

    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000)

    return () => clearInterval(interval)
  }, [serverUrl, authHeader])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success text-success-foreground"
      case "warning":
        return "bg-warning text-warning-foreground"
      case "offline":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getProgressColor = (usage: number) => {
    if (usage > 80) return "bg-destructive"
    if (usage > 60) return "bg-warning"
    return "bg-success"
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Статус системы</span>
        </div>
        <Badge className={getStatusColor(status)}>
          {status === "online" ? "В сети" : status === "warning" ? "Внимание" : "Не доступен"}
        </Badge>
      </div>

      <TooltipProvider>
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-muted-foreground" />
                    <span>CPU</span>
                  </div>
                  <span>{cpuUsage}%</span>
                </div>
                <Progress value={cpuUsage} className="h-1" indicatorClassName={getProgressColor(cpuUsage)} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Использование процессора: {cpuUsage}%</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span>RAM</span>
                  </div>
                  <span>{ramUsage}%</span>
                </div>
                <Progress value={ramUsage} className="h-1" indicatorClassName={getProgressColor(ramUsage)} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Использование памяти: {ramUsage}%</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-muted-foreground" />
                    <span>Диск</span>
                  </div>
                  <span>{diskUsage}%</span>
                </div>
                <Progress value={diskUsage} className="h-1" indicatorClassName={getProgressColor(diskUsage)} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Использование диска: {diskUsage}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
