// Хук для показа лоадера только если операция действительно тянется дольше заданной задержки.
import { useEffect, useRef, useState } from 'react'

export function useDelayedLoading(delay: number, initialIsLoading: boolean) {
  const [isLoading, setIsLoading] = useState(initialIsLoading)

  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function onLoadingChange(nextIsLoading: boolean) {

    if (loadingTimeoutRef.current !== null) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }

    if (nextIsLoading) {
    
      if (delay <= 0) {
        setIsLoading(true)
        return
      }

   
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(true)
        loadingTimeoutRef.current = null
      }, delay)
      return
    }

    
    setIsLoading(false)
  }

  useEffect(() => {
    return () => {
    
      if (loadingTimeoutRef.current !== null) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  return [isLoading, onLoadingChange] as const
}
