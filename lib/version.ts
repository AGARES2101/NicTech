// Информация о версии приложения
export const APP_VERSION = {
  major: 1,
  minor: 2,
  patch: 0,
  build: "20250328",
  codename: "Secure Vision",
  get full() {
    return `${this.major}.${this.minor}.${this.patch} (${this.build})`
  },
  get short() {
    return `${this.major}.${this.minor}.${this.patch}`
  },
}

// История изменений
export const CHANGELOG = [
  {
    version: "1.2.0",
    date: "28.03.2025",
    changes: [
      "Добавлена поддержка API Revisor VMS",
      "Улучшена работа с видеопотоками",
      "Добавлена поддержка модуля распознавания лиц",
      "Добавлена система логирования и диагностики",
    ],
  },
  {
    version: "1.1.0",
    date: "15.03.2025",
    changes: ["Добавлена страница аналитики", "Улучшен интерфейс работы с архивом", "Добавлены фильтры для камер"],
  },
  {
    version: "1.0.0",
    date: "01.03.2025",
    changes: ["Первая стабильная версия", "Базовый функционал для работы с камерами", "Просмотр живого видео и архива"],
  },
]

