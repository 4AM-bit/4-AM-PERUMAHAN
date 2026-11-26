import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import { DEMO_HOUSE_TYPES, DEMO_PROJECTS } from '@/lib/demo-data'
import { supabase } from '@/supabase/client'
import type {
  AvailabilityStatus,
  HouseType,
  Project,
  ProjectStatus,
  SampleUnit,
  UnitStatus,
} from '@/types/property'

const VALID_LOCAL_IMAGES = new Set([
  '/images/hero-residence.jpg',
  '/images/project-cluster-1.jpg',
  '/images/project-cluster-2.jpg',
  '/images/house-type-compact.jpg',
  '/images/house-type-executive.jpg',
  '/images/facility-clubhouse.jpg',
  '/images/interior-living.jpg',
])

function safeImageUrl(url: unknown, fallback: string): string {
  const str = typeof url === 'string' ? url.trim() : ''
  if (!str) return fallback
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
    return str
  }
  if (VALID_LOCAL_IMAGES.has(str)) return str
  return fallback
}

function normalizeProjectStatus(val: unknown): ProjectStatus {
  if (val === 'launching' || val === 'limited' || val === 'sold_out') return val
  return 'available'
}

export interface PublicCatalogSnapshot {
  projects: Project[]
  houseTypes: HouseType[]
  locations: string[]
  source: 'supabase' | 'demo'
}

let cachedSnapshot: PublicCatalogSnapshot | null = null
let cachedAt = 0
const CACHE_TTL_MS = 15_000

export const publicCatalogService = {
  async load(forceRefresh = false): Promise<PublicCatalogSnapshot> {
    if (!forceRefresh && cachedSnapshot && Date.now() - cachedAt < CACHE_TTL_MS) {
      return cachedSnapshot
    }

    if (!IS_SUPABASE_CONFIGURED || !supabase) {
      const locations = ['Semua Lokasi', ...Array.from(new Set(DEMO_PROJECTS.map((p) => p.city)))]
      return { projects: DEMO_PROJECTS, houseTypes: DEMO_HOUSE_TYPES, locations, source: 'demo' }
    }

    try {
      const [projRes, htRes, unitRes, facRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: true }),
        supabase
          .from('house_types')
          .select('*')
          .is('deleted_at', null)
          .order('price', { ascending: true }),
        supabase
          .from('units')
          .select('*')
          .is('deleted_at', null)
          .neq('status', 'inactive'),
        supabase
          .from('facilities')
          .select('project_id, title')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ])

      if (projRes.error || htRes.error || !projRes.data || projRes.data.length === 0) {
        const locations = ['Semua Lokasi', ...Array.from(new Set(DEMO_PROJECTS.map((p) => p.city)))]
        return { projects: DEMO_PROJECTS, houseTypes: DEMO_HOUSE_TYPES, locations, source: 'demo' }
      }

      const rawUnits = (unitRes.data ?? []) as Array<Record<string, unknown>>
      const rawFacilities = (facRes.data ?? []) as Array<{ project_id: string | null; title: string }>
      const defaultFloorplans1 = DEMO_HOUSE_TYPES[0].floorplans
      const defaultFloorplans2 = DEMO_HOUSE_TYPES[2].floorplans
      const defaultSpecs = DEMO_HOUSE_TYPES[0].buildingSpecs

      const projects: Project[] = (projRes.data as Array<Record<string, unknown>>).map((row, idx) => {
        const id = String(row.id)
        const projUnits = rawUnits.filter((u) => String(u.project_id) === id)
        const availableUnits = projUnits.filter((u) => u.status === 'available').length
        const reservedUnits = projUnits.filter((u) => u.status === 'reserved').length
        const soldUnits = projUnits.filter((u) => u.status === 'sold').length
        const totalUnits = Math.max(Number(row.total_units ?? 0), projUnits.length)
        const fallbackImg =
          idx % 3 === 0
            ? '/images/project-cluster-1.jpg'
            : idx % 3 === 1
              ? '/images/project-cluster-2.jpg'
              : '/images/hero-residence.jpg'
        const coverImage = safeImageUrl(row.cover_image_url, fallbackImg)
        const highlights = Array.isArray(row.highlights)
          ? (row.highlights as string[])
          : ['Legalitas SHM & PBG', 'One-Gate Security 24/7', 'Lingkungan Hijau']
        const projFacTitles = rawFacilities
          .filter((f) => f.project_id === id || f.project_id === null)
          .map((f) => f.title)
        const address = String(row.address || row.location || '')
        const embedUrl =
          typeof row.map_embed_url === 'string' && row.map_embed_url.trim()
            ? row.map_embed_url
            : `https://www.google.com/maps?q=${encodeURIComponent(address || String(row.name))}&z=14&output=embed`
        const externalUrl =
          typeof row.map_external_url === 'string' && row.map_external_url.trim()
            ? row.map_external_url
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || String(row.name))}`

        return {
          id,
          slug: String(row.slug),
          name: String(row.name),
          tagline: String(row.tagline || 'Hunian Tropis Modern Bernilai Tinggi'),
          location: String(row.location || ''),
          city: String(row.city || ''),
          description: String(row.description || ''),
          fullDescription: String(row.description || ''),
          coverImage,
          galleryImages: [
            coverImage,
            '/images/interior-living.jpg',
            '/images/facility-clubhouse.jpg',
            '/images/hero-residence.jpg',
          ],
          totalUnits,
          availableUnits: projUnits.length > 0 ? availableUnits : Math.max(1, Math.round(totalUnits * 0.2)),
          reservedUnits,
          soldUnits,
          startingPrice: Number(row.starting_price ?? 0),
          status: normalizeProjectStatus(row.status),
          featured: Boolean(row.is_featured ?? true),
          landAreaRange: String(row.land_area_total || '72 – 180 m²'),
          totalAreaHectares: String(row.land_area_total || '10 Hektare'),
          completionTarget: String(row.handover_estimate || 'Serah Terima Bertahap'),
          highlights,
          facilities:
            projFacTitles.length > 0
              ? Array.from(new Set(projFacTitles)).slice(0, 6)
              : [
                  'Private Clubhouse & Lap Pool',
                  'One-Gate RFID & CCTV 24/7',
                  'Forest Park & Jogging Track',
                  'Underground Utilities',
                ],
          map: {
            address,
            lat: -6.3018,
            lng: 106.6414,
            embedUrl,
            googleMapsUrl: externalUrl,
            nearbyAccess: [
              `Akses mudah menuju pusat ${String(row.city || 'kota')}`,
              'Dekat gerbang tol utama & transportasi publik',
              'Dekat sekolah, rumah sakit, dan pusat perbelanjaan',
              'Lingkungan klaster tenang & bebas banjir',
            ],
          },
        }
      })

      const projectById = Object.fromEntries(projects.map((p) => [p.id, p]))

      const houseTypes: HouseType[] = (htRes.data as Array<Record<string, unknown>>).map((row, idx) => {
        const id = String(row.id)
        const projectId = String(row.project_id)
        const proj = projectById[projectId]
        const typeUnits = rawUnits.filter((u) => String(u.house_type_id) === id)
        const sampleUnits: SampleUnit[] = typeUnits.map((u) => ({
          id: String(u.id),
          unitCode: String(u.unit_number ?? ''),
          block: String(u.block ?? 'Blok A'),
          price: Number(u.price ?? row.price ?? 0),
          landArea: Number(u.land_area ?? row.land_area ?? 72),
          facing: String(u.facing ?? 'Timur'),
          status: (String(u.status ?? 'available') as UnitStatus),
        }))
        const availableUnits = sampleUnits.filter((u) => u.status === 'available').length
        const totalUnits = Math.max(sampleUnits.length, 1)
        const status: AvailabilityStatus =
          availableUnits === 0
            ? 'sold'
            : availableUnits <= 2
              ? 'limited'
              : 'available'

        const fallbackImg =
          idx % 2 === 0 ? '/images/house-type-compact.jpg' : '/images/house-type-executive.jpg'
        const coverImage = safeImageUrl(row.cover_image_url, fallbackImg)
        const floors = Number(row.floors ?? 2)
        const rawFeatures = Array.isArray(row.features) ? (row.features as string[]) : []
        const rawSpecs = Array.isArray(row.specifications)
          ? (row.specifications as Array<{ label?: string; value?: string }>)
              .filter((s) => s.label && s.value)
              .map((s) => ({ label: String(s.label), value: String(s.value) }))
          : []

        return {
          id,
          slug: String(row.slug),
          projectId,
          projectSlug: proj?.slug ?? '',
          projectName: proj?.name ?? 'PERUMAHAN',
          projectLocation: proj?.city ?? proj?.location ?? '',
          name: String(row.name),
          category: String(row.category || `${floors} Lantai • Modern Tropical`),
          price: Number(row.price ?? 0),
          bookingFee: Number(row.booking_fee ?? 10000000),
          reservationHoldHours: 24,
          landArea: Number(row.land_area ?? 72),
          buildingArea: Number(row.building_area ?? 45),
          bedrooms: Number(row.bedrooms ?? 2),
          bathrooms: Number(row.bathrooms ?? 1),
          floors,
          carport: Number(row.carport ?? 1),
          availableUnits,
          totalUnits,
          status,
          coverImage,
          galleryImages: [
            coverImage,
            '/images/interior-living.jpg',
            proj?.coverImage ?? '/images/project-cluster-1.jpg',
            '/images/facility-clubhouse.jpg',
          ],
          featured: Boolean(row.is_featured ?? true),
          shortDescription: String(row.description || ''),
          fullDescription: String(row.description || ''),
          specs:
            rawFeatures.length > 0
              ? rawFeatures.slice(0, 3)
              : ['SHM & PBG Lengkap', 'Smart Door Lock', `${floors} Lantai Modern`],
          buildingSpecs: rawSpecs.length > 0 ? rawSpecs : defaultSpecs,
          floorplans: floors === 1 ? defaultFloorplans1 : defaultFloorplans2,
          sampleUnits,
        }
      })

      const locations = [
        'Semua Lokasi',
        ...Array.from(new Set(projects.map((p) => p.city).filter(Boolean))),
      ]

      cachedSnapshot = { projects, houseTypes, locations, source: 'supabase' }
      cachedAt = Date.now()
      return cachedSnapshot
    } catch {
      const locations = ['Semua Lokasi', ...Array.from(new Set(DEMO_PROJECTS.map((p) => p.city)))]
      return { projects: DEMO_PROJECTS, houseTypes: DEMO_HOUSE_TYPES, locations, source: 'demo' }
    }
  },
}
