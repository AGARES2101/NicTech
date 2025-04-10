// Уровни логирования
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Категории логов
export enum LogCategory {
  SYSTEM = "SYSTEM",
  AUTH = "AUTH",
  VIDEO = "VIDEO",
  ARCHIVE = "ARCHIVE",
  API = "API",
  UI = "UI",
  FACE_RECOGNITION = "FACE_RECOGNITION",
}

// Интерфейс записи лога
export interface LogEntry {
  timestamp: Date
  level: LogLevel
  category: LogCategory
  message: string
  details?: any
}

// Максимальное количество хранимых логов
const MAX_LOG_ENTRIES = 1000

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private logLevel: LogLevel = LogLevel.INFO
  private listeners: ((entry: LogEntry) => void)[] = []

  private constructor() {
    // Приватный конструктор для синглтона
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  // Установка уровня логирования
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level
    this.debug(LogCategory.SYSTEM, `Уровень логирования изменен на ${LogLevel[level]}`)
  }

  // Получение текущего уровня логирования
  public getLogLevel(): LogLevel {
    return this.logLevel
  }

  // Добавление слушателя логов
  public addListener(listener: (entry: LogEntry) => void): void {
    this.listeners.push(listener)
  }

  // Удаление слушателя логов
  public removeListener(listener: (entry: LogEntry) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  // Получение всех логов
  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Получение логов по категории
  public getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter((log) => log.category === category)
  }

  // Очистка логов
  public clearLogs(): void {
    this.logs = []
    this.debug(LogCategory.SYSTEM, "Логи очищены")
  }

  // Экспорт логов в JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Методы логирования
  public debug(category: LogCategory, message: string, details?: any): void {
    this.log(LogLevel.DEBUG, category, message, details)
  }

  public info(category: LogCategory, message: string, details?: any): void {
    this.log(LogLevel.INFO, category, message, details)
  }

  public warn(category: LogCategory, message: string, details?: any): void {
    this.log(LogLevel.WARN, category, message, details)
  }

  public error(category: LogCategory, message: string, details?: any): void {
    this.log(LogLevel.ERROR, category, message, details)
  }

  // Внутренний метод логирования
  private log(level: LogLevel, category: LogCategory, message: string, details?: any): void {
    if (level < this.logLevel) return

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      details,
    }

    // Добавляем запись в массив логов
    this.logs.unshift(entry)

    // Ограничиваем количество хранимых логов
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs.pop()
    }

    // Уведомляем слушателей
    this.listeners.forEach((listener) => listener(entry))

    // Вывод в консоль браузера для отладки
    const logMethod = this.getConsoleMethod(level)
    const formattedMessage = `[${LogLevel[level]}][${category}] ${message}`

    if (details) {
      console.groupCollapsed(formattedMessage)
      console[logMethod]("Details:", details)
      console.groupEnd()
    } else {
      console[logMethod](formattedMessage)
    }
  }

  // Получение соответствующего метода консоли
  private getConsoleMethod(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "debug"
      case LogLevel.INFO:
        return "info"
      case LogLevel.WARN:
        return "warn"
      case LogLevel.ERROR:
        return "error"
      default:
        return "log"
    }
  }
}

// Экспортируем синглтон
export const logger = Logger.getInstance()
