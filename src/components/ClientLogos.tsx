import { clients, clientsEyebrow } from '@/config/loader'
import { cn } from '@/lib/utils'

export function ClientLogos() {
  // Don't render if no clients
  if (clients.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:gap-x-8">
      <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
        {clientsEyebrow}
      </span>
      <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6">
        {clients.map((client, index) => (
          <span key={client.name} className="flex items-center gap-4 md:gap-6">
            <span
              className={cn(
                'text-sm md:text-base font-semibold transition-colors duration-200',
                client.highlight
                  ? 'text-brass-600 dark:text-brass-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-brass-500 dark:hover:text-brass-400'
              )}
            >
              {client.name}
            </span>
            {index < clients.length - 1 && (
              <span className="text-slate-300 dark:text-slate-600">•</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
