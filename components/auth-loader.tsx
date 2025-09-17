"use client"

import { Loader2, TrendingUp } from "lucide-react"

export function AuthLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md mx-auto">
        {/* Brand Section */}
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unlisted Axis</h1>
          <p className="text-gray-600 dark:text-gray-300">Admin Panel for Unlisted Shares</p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="relative flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    </div>
  )
}
