import { useRef, useState, useEffect } from 'react'
import {
  Code2,
  Cloud,
  Database,
  Plug,
  Wrench,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  skillCategories,
  skillsSection,
  skillsDescription,
  skillsSummary,
} from '@/config/loader'
import { cn } from '@/lib/utils'

const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  'Languages & Frameworks': Code2,
  'Cloud & Infrastructure': Cloud,
  Databases: Database,
  'APIs & Integration': Plug,
  'Development Tools': Wrench,
  'AI Development': Sparkles,
  Leadership: Users,
}

export function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Return null if no skills to display
  if (skillCategories.length === 0) return null

  return (
    <section
      id="skills"
      className="section-padding bg-slate-50 dark:bg-navy-950"
    >
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brass-600 dark:text-brass-400 uppercase tracking-wider mb-3">
            {skillsSection.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-navy-900 dark:text-slate-100 mb-4">
            {skillsSection.headline}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {skillsDescription}
          </p>
        </div>

        {/* Skills Grid */}
        <div
          ref={sectionRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {skillCategories.map((category, index) => {
            const Icon = categoryIcons[category.name] || Code2
            return (
              <Card
                key={category.name}
                className={cn(
                  'border-border hover:border-accent transition-colors',
                  isVisible && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 dark:bg-navy-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-navy-600 dark:text-slate-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-navy-900 dark:text-slate-100">
                      {category.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => {
                      // skill is now always an object with { name, context?, level?, years? }

                      // If skill has context, wrap in popover
                      if (skill.context) {
                        return (
                          <Popover key={skill.name}>
                            <PopoverTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                              >
                                {skill.name}
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="w-72">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-foreground">
                                  {skill.name}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {skill.context}
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )
                      }

                      // Otherwise, render plain badge
                      return (
                        <Badge
                          key={skill.name}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill.name}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary Card - auto-generated from skill categories */}
        {skillsSummary.length > 0 && (
          <Card
            className={cn(
              'mt-12 max-w-3xl mx-auto border-navy-800 dark:border-navy-600 bg-gradient-to-br from-navy-900 to-navy-950 text-white',
              isVisible && 'animate-fade-in-up'
            )}
            style={{ animationDelay: '500ms' }}
          >
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-3 gap-8 text-center">
                {skillsSummary.map((summary) => (
                  <div key={summary.title}>
                    <p className="text-3xl font-display font-bold text-brass-400 mb-1">
                      {summary.title.split(' & ')[0]}
                    </p>
                    <p className="text-sm text-slate-300">{summary.subtitle}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
