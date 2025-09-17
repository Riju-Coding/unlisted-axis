"use client"

import { Loader2, TrendingUp } from "lucide-react"

export function SimpleLoader() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unlisted Axis</h1>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  )
}
