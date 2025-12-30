import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  isVisible?: boolean
  className?: string
}

export function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 4,
  isVisible = false,
  className,
}: ProgressRingProps) {
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!isVisible) {
      return
    }

    // Animate progress over 2 seconds
    const duration = 2000
    const steps = 60
    const stepValue = percentage / steps
    const stepDuration = duration / steps
    let current = 0

    timerRef.current = setInterval(() => {
      current += stepValue
      if (current >= percentage) {
        setProgress(percentage)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setProgress(current)
      }
    }, stepDuration)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [percentage, isVisible])

  // Reset progress when becoming invisible
  useEffect(() => {
    if (!isVisible) {
      const resetTimer = setTimeout(() => setProgress(0), 0)
      return () => clearTimeout(resetTimer)
    }
  }, [isVisible])

  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      className={cn('transform -rotate-90', className)}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-200 dark:text-navy-700"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="text-brass-500 transition-all duration-100 ease-out"
      />
    </svg>
  )
}
