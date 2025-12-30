import { useEffect, useRef, useState } from 'react'

interface UseAnimatedCounterOptions {
  end: number
  duration?: number
  startOnView?: boolean
  isVisible?: boolean
}

export function useAnimatedCounter({
  end,
  duration = 2000,
  startOnView = true,
  isVisible = true,
}: UseAnimatedCounterOptions) {
  const [count, setCount] = useState(0)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (startOnView && !isVisible) return
    if (hasAnimatedRef.current) return

    hasAnimatedRef.current = true

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Ease out expo
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      setCount(Math.floor(easeOutExpo * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration, startOnView, isVisible])

  return count
}
