import { useState, useEffect, useRef } from 'react'
import { Link, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShareUrl } from '@/hooks/useShareUrl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type CopyState = 'idle' | 'copied' | 'error'

export function ShareButton() {
  const { copyShareUrl } = useShareUrl()
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleClick = async () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const result = await copyShareUrl()
    if (result.success) {
      setCopyState('copied')
      timeoutRef.current = setTimeout(() => setCopyState('idle'), 2000)
    } else {
      console.warn('Failed to copy URL:', result.error)
      setCopyState('error')
      timeoutRef.current = setTimeout(() => setCopyState('idle'), 3000)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            aria-label={
              copyState === 'copied'
                ? 'Link copied!'
                : copyState === 'error'
                  ? 'Failed to copy'
                  : 'Copy share link'
            }
            className="relative overflow-hidden"
          >
            {copyState === 'copied' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : copyState === 'error' ? (
              <X className="h-4 w-4 text-red-500" />
            ) : (
              <Link className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {copyState === 'copied'
              ? 'Link copied!'
              : copyState === 'error'
                ? 'Failed to copy - try again'
                : 'Copy share link'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
