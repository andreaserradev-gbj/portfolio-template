import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, MapPin, Database } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import type { JobFilters as JobFiltersType, LocationFilter } from '@/types/hn'
import { PROVIDERS, type JobProviderId } from '@/types/providers'
import { userLocation } from '@/config/loader'
import { getRegionFromCountry, getRegionLabel } from '@/lib/skillMatcher'

interface JobFiltersProps {
  filters: JobFiltersType
  onChange: (filters: JobFiltersType) => void
  layout?: 'horizontal' | 'vertical'
}

export function JobFilters({
  filters,
  onChange,
  layout = 'horizontal',
}: JobFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.searchQuery)

  const updateFilter = useCallback(
    <K extends keyof JobFiltersType>(key: K, value: JobFiltersType[K]) => {
      onChange({ ...filters, [key]: value })
    },
    [filters, onChange]
  )

  // Debounce search - update parent after 300ms of no typing
  useEffect(() => {
    // Skip if values already match
    if (searchInput === filters.searchQuery) return

    const timer = setTimeout(() => {
      updateFilter('searchQuery', searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, filters.searchQuery, updateFilter])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  // Handle Clear Filters - reset local input state
  const handleClearFilters = () => {
    setSearchInput('')
    onChange({
      minMatchScore: 0,
      sortBy: 'match',
      searchQuery: '',
      location: 'any-eu', // Default to Any EU for best user experience
      temperature: 0.4,
      provider: 'hn',
      providerOptions: { arbeitnow: { remoteOnly: true } },
    })
  }

  const hasActiveFilters =
    filters.minMatchScore > 0 ||
    filters.searchQuery.length > 0 ||
    filters.sortBy !== 'match' ||
    filters.location !== 'any-eu' ||
    Math.abs(filters.temperature - 0.4) > 0.01 ||
    filters.provider !== 'hn'

  // Temperature label based on value
  const getTemperatureLabel = (temp: number): string => {
    if (temp <= 0.2) return 'Strict'
    if (temp <= 0.5) return 'Balanced'
    if (temp <= 0.8) return 'Exploratory'
    return 'Loose'
  }

  const getTemperatureDescription = (temp: number): string => {
    if (temp <= 0.2) return 'Only near-perfect skill matches'
    if (temp <= 0.5) return 'Good balance of relevance and variety'
    if (temp <= 0.8) return 'Partial matches welcome, more variety'
    return 'Show everything with any relevance'
  }

  const userRegion = getRegionFromCountry(userLocation.country)
  const regionLabel = getRegionLabel(userRegion)

  // Vertical layout for Sheet
  if (layout === 'vertical') {
    return (
      <div className="space-y-6">
        {/* Provider selector */}
        <div className="space-y-2">
          <Label>Source</Label>
          <Select
            value={filters.provider}
            onValueChange={(value: string) =>
              updateFilter('provider', value as JobProviderId)
            }
          >
            <SelectTrigger className="w-full">
              <Database className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(PROVIDERS).map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Arbeitnow-specific: Remote only toggle */}
        {filters.provider === 'arbeitnow' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="remote-only-v">Remote jobs only</Label>
            <Switch
              id="remote-only-v"
              checked={filters.providerOptions?.arbeitnow?.remoteOnly ?? true}
              onCheckedChange={(checked: boolean) =>
                onChange({
                  ...filters,
                  providerOptions: {
                    ...filters.providerOptions,
                    arbeitnow: { remoteOnly: checked },
                  },
                })
              }
            />
          </div>
        )}

        {/* Search input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="text"
              placeholder="Search jobs..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
        </div>

        {/* Location filter */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Select
            value={filters.location}
            onValueChange={(value: string) =>
              updateFilter('location', value as LocationFilter)
            }
          >
            <SelectTrigger className="w-full">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote-global">Remote (Global)</SelectItem>
              <SelectItem value="remote-eu">Remote ({regionLabel})</SelectItem>
              <SelectItem value="onsite-eu">On-site ({regionLabel})</SelectItem>
              <SelectItem value="any-eu">Any ({regionLabel})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort dropdown */}
        <div className="space-y-2">
          <Label>Sort by</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: string) =>
              updateFilter('sortBy', value as 'match' | 'recent')
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min match score slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="min-score">Minimum Match Score</Label>
            <span className="text-sm text-muted-foreground">
              {filters.minMatchScore}%
            </span>
          </div>
          <Slider
            id="min-score"
            min={0}
            max={100}
            step={5}
            value={[filters.minMatchScore]}
            onValueChange={([value]: number[]) =>
              updateFilter('minMatchScore', value)
            }
          />
          <p className="text-xs text-muted-foreground">
            Only show jobs with at least this match percentage
          </p>
        </div>

        {/* Temperature slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">Match Sensitivity</Label>
            <span className="text-sm font-medium text-foreground">
              {getTemperatureLabel(filters.temperature)}
            </span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={100}
            step={5}
            value={[filters.temperature * 100]}
            onValueChange={([value]: number[]) =>
              updateFilter('temperature', value / 100)
            }
          />
          <p className="text-xs text-muted-foreground">
            {getTemperatureDescription(filters.temperature)}
          </p>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleClearFilters}
          >
            Clear All Filters
          </Button>
        )}
      </div>
    )
  }

  // Horizontal layout (default)
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Provider selector */}
      <Select
        value={filters.provider}
        onValueChange={(value: string) =>
          updateFilter('provider', value as JobProviderId)
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <Database className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(PROVIDERS).map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search jobs..."
          value={searchInput}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* Location filter */}
      <Select
        value={filters.location}
        onValueChange={(value: string) =>
          updateFilter('location', value as LocationFilter)
        }
      >
        <SelectTrigger className="w-full sm:w-48">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          <SelectItem value="remote-global">Remote (Global)</SelectItem>
          <SelectItem value="remote-eu">Remote ({regionLabel})</SelectItem>
          <SelectItem value="onsite-eu">On-site ({regionLabel})</SelectItem>
          <SelectItem value="any-eu">Any ({regionLabel})</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort dropdown */}
      <Select
        value={filters.sortBy}
        onValueChange={(value: string) =>
          updateFilter('sortBy', value as 'match' | 'recent')
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="match">Best Match</SelectItem>
          <SelectItem value="recent">Most Recent</SelectItem>
        </SelectContent>
      </Select>

      {/* Advanced filters popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            size="icon"
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Filters</h4>

            {/* Min match score slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="min-score">Minimum Match Score</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.minMatchScore}%
                </span>
              </div>
              <Slider
                id="min-score"
                min={0}
                max={100}
                step={5}
                value={[filters.minMatchScore]}
                onValueChange={([value]: number[]) =>
                  updateFilter('minMatchScore', value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Only show jobs with at least this match percentage
              </p>
            </div>

            {/* Temperature slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Match Sensitivity</Label>
                <span className="text-sm font-medium text-foreground">
                  {getTemperatureLabel(filters.temperature)}
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={100}
                step={5}
                value={[filters.temperature * 100]}
                onValueChange={([value]: number[]) =>
                  updateFilter('temperature', value / 100)
                }
              />
              <p className="text-xs text-muted-foreground">
                {getTemperatureDescription(filters.temperature)}
              </p>
            </div>

            {/* Arbeitnow-specific: Remote only toggle */}
            {filters.provider === 'arbeitnow' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="remote-only-h">Remote jobs only</Label>
                <Switch
                  id="remote-only-h"
                  checked={
                    filters.providerOptions?.arbeitnow?.remoteOnly ?? true
                  }
                  onCheckedChange={(checked: boolean) =>
                    onChange({
                      ...filters,
                      providerOptions: {
                        ...filters.providerOptions,
                        arbeitnow: { remoteOnly: checked },
                      },
                    })
                  }
                />
              </div>
            )}

            {/* Clear filters button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
