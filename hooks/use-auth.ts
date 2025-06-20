"use client"

import { useState, useEffect } from "react"
import type { User } from "../types"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem("invoice-user")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("invoice-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username: string) => {
    const userData: User = {
      username,
      isAuthenticated: true,
    }
    setUser(userData)
    localStorage.setItem("invoice-user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("invoice-user")
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user?.isAuthenticated,
  }
}
