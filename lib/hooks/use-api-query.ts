import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type { ApiQueryOptions } from '@/types/api'

export function useApiQuery<T>(endpoint: string, options: ApiQueryOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    let interval: NodeJS.Timeout | null = null

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.fetch(endpoint)
        
        if (mounted) {
          let transformed: T
          
          if (options.transform) {
            transformed = options.transform(response)
          } else {
            transformed = response as T
          }
          
          setData(transformed)
          setError(null)
          options.onSuccess?.(transformed)
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          options.onError?.(error)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    if (options.enabled !== false) {
      fetchData()
      if (options.refetchInterval) {
        interval = setInterval(fetchData, options.refetchInterval)
      }
    }

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
    }
  }, [endpoint, options.enabled, options.refetchInterval])

  return { data, isLoading, error }
}
