import { useEffect, useState } from 'react'
import { DEMO_HOUSE_TYPES, DEMO_PROJECTS, PROJECT_LOCATIONS } from '@/lib/demo-data'
import {
  publicCatalogService,
  type PublicCatalogSnapshot,
} from '@/services/publicCatalogService'

const INITIAL_SNAPSHOT: PublicCatalogSnapshot = {
  projects: DEMO_PROJECTS,
  houseTypes: DEMO_HOUSE_TYPES,
  locations: [...PROJECT_LOCATIONS],
  source: 'demo',
}

export function usePublicCatalog() {
  const [snapshot, setSnapshot] = useState<PublicCatalogSnapshot>(INITIAL_SNAPSHOT)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    void publicCatalogService
      .load()
      .then((data) => {
        if (active) setSnapshot(data)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { ...snapshot, isLoading }
}
