import React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProgressIndicatorProps {
  steps: {
    label: string
    isComplete: boolean
    isActive?: boolean
  }[]
  className?: string
}

export function ProgressIndicator({ steps, className }: ProgressIndicatorProps) {
  const completedSteps = steps.filter(step => step.isComplete).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
        
        {/* Animated progress bar */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  "border-2 bg-white shadow-sm",
                  step.isComplete
                    ? "border-indigo-600 bg-indigo-600 scale-110"
                    : step.isActive
                    ? "border-indigo-600 bg-white scale-105"
                    : "border-gray-300 bg-white"
                )}
              >
                {step.isComplete ? (
                  <Check className="w-5 h-5 text-white animate-fade-in" />
                ) : (
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      step.isActive ? "text-indigo-600" : "text-gray-400"
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300",
                  step.isComplete || step.isActive
                    ? "text-indigo-600"
                    : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress percentage */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-indigo-600">{Math.round(progress)}%</span> Complete
        </p>
      </div>
    </div>
  )
}