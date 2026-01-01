import { useRef, useState, useEffect } from 'react'
import { Github, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { projects, projectsSection } from '@/config/loader'
import { cn } from '@/lib/utils'

export function Projects() {
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

  if (projects.length === 0) return null

  return (
    <section id="projects" className="section-padding">
      <div className="container-wide">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brass-600 dark:text-brass-400 uppercase tracking-wider mb-3">
            {projectsSection.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-navy-900 dark:text-slate-100 mb-4">
            {projectsSection.headline}
          </h2>
          {projectsSection.description && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {projectsSection.description}
            </p>
          )}
        </div>

        <div
          ref={sectionRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {projects.map((project, index) => (
            <Card
              key={project.id}
              className={cn(
                'border-border hover:border-accent transition-all hover:shadow-lg',
                isVisible && 'animate-fade-in-up'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.featured && (
                    <Badge variant="accent" className="shrink-0">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button variant="outline" size="sm" asChild className="w-full">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                    <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
