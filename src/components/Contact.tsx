import { useState, useRef, useEffect } from 'react'
import { Mail, Linkedin, MapPin, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { contact, footer } from '@/config/loader'
import { cn } from '@/lib/utils'

export function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brass-600 dark:text-brass-400 uppercase tracking-wider mb-3">
            {contact.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-navy-900 dark:text-slate-100 mb-4">
            {contact.headline}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {contact.description}
          </p>
        </div>

        {/* Contact Card */}
        <div ref={sectionRef} className="max-w-2xl mx-auto">
          <Card
            className={cn(
              'border-border overflow-hidden',
              isVisible && 'animate-fade-in-up'
            )}
          >
            <CardContent className="p-0">
              {/* Contact details */}
              <div className="p-8 space-y-6">
                {/* Email */}
                <button
                  onClick={() => copyToClipboard(contact.email, 'email')}
                  className="w-full group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-navy-900 shadow-sm dark:shadow-none flex items-center justify-center">
                      <Mail className="w-5 h-5 text-navy-600 dark:text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-base font-medium text-navy-900 dark:text-slate-100">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-navy-600 dark:group-hover:text-brass-400 transition-colors">
                    {copiedField === 'email' ? (
                      <Check className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* LinkedIn */}
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-navy-800 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-navy-900 shadow-sm dark:shadow-none flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-navy-600 dark:text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                        LinkedIn
                      </p>
                      <p className="text-base font-medium text-navy-900 dark:text-slate-100">
                        {contact.linkedin}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-navy-600 dark:group-hover:text-brass-400 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </a>

                {/* Location - only if configured */}
                {contact.location && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-800">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-navy-900 shadow-sm dark:shadow-none flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-navy-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                        Location
                      </p>
                      <p className="text-base font-medium text-navy-900 dark:text-slate-100">
                        {contact.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Section */}
              <div className="p-8 bg-gradient-to-br from-navy-900 to-navy-950 text-white">
                <p className="text-center text-slate-300 mb-6">
                  {contact.ctaText}
                </p>
                <div className="flex justify-center">
                  <Button variant="accent" size="lg" asChild>
                    <a href={`mailto:${contact.email}?subject=Let's Connect`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-500">
            <p>{footer.copyrightText}</p>
          </div>
        </footer>
      </div>
    </section>
  )
}
