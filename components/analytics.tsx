"use client"

import { useEffect } from "react"
import Script from "next/script"

export function Analytics() {
  useEffect(() => {
    // Имитация инициализации аналитики
    console.log("Analytics initialized")
  }, [])

  return (
    <>
      {/* Здесь можно подключить реальные скрипты аналитики */}
      <Script
        id="analytics-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            console.log('NicTech Enterprise Analytics loaded');
            // Здесь был бы код реальной аналитики
          `,
        }}
      />
    </>
  )
}

