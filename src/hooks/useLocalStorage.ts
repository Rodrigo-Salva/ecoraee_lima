import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../utils/storage'

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = initialValue instanceof Function ? initialValue() : initialValue
    return readStorage(key, fallback)
  })

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue] as const
}
