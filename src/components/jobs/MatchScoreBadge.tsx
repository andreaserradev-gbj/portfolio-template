import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getMatchScoreTier, type MatchScoreTier } from '@/types/hn'
import { cn } from '@/lib/utils'

interface MatchScoreBadgeProps {
  score: number
  matchedSkills: string[]
  className?: string
}

const tierStyles: Record<MatchScoreTier, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  moderate:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  excellent:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

export function MatchScoreBadge({
  score,
  matchedSkills,
  className,
}: MatchScoreBadgeProps) {
  const tier = getMatchScoreTier(score)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          className={cn(
            'cursor-pointer transition-transform hover:scale-105',
            tierStyles[tier],
            className
          )}
        >
          {score}% match
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">
            Matched Skills ({matchedSkills.length})
          </h4>
          {matchedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {matchedSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No skills matched this job posting.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
