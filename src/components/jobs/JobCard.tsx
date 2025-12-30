import { useState, useMemo, memo } from 'react'
import DOMPurify from 'dompurify'
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  MapPin,
  Globe,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MatchScoreBadge } from './MatchScoreBadge'
import type { ParsedJob } from '@/types/hn'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: ParsedJob
  className?: string
  style?: React.CSSProperties
}

function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Sanitize HTML content from HN API to prevent XSS attacks
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'a',
      'b',
      'i',
      'strong',
      'em',
      'ul',
      'ol',
      'li',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ADD_ATTR: ['target', 'rel'],
  })
}

export const JobCard = memo(function JobCard({
  job,
  className,
  style,
}: JobCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Memoize sanitization - only runs when htmlText/rawText changes
  // Use rawText as fallback since htmlText may not be cached
  const sanitizedHtml = useMemo(
    () => sanitizeHtml(job.htmlText || job.rawText || ''),
    [job.htmlText, job.rawText]
  )

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md hover:border-accent/50 overflow-hidden',
        className
      )}
      style={style}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">
              {job.company}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {job.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(job.postedAt)}
              </span>
              {job.isRemote && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Globe className="h-3 w-3" />
                  Remote
                </Badge>
              )}
              {job.location && !job.isRemote && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <MatchScoreBadge
              score={job.matchScore}
              matchedSkills={job.matchedSkills}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Job description */}
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none overflow-hidden break-words',
            '[&_a]:text-accent [&_a]:no-underline hover:[&_a]:underline [&_a]:break-all',
            '[&_p]:my-2 [&_ul]:my-2 [&_li]:my-0.5',
            !expanded && 'line-clamp-4'
          )}
          {...(!expanded && { inert: true })}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 gap-1 text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show more
            </>
          )}
        </Button>

        {/* Matched skills and actions */}
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-1 min-w-0 flex-1">
            {job.matchedSkills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.matchedSkills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{job.matchedSkills.length - 5} more
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 gap-1"
          >
            <a href={job.hnUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
