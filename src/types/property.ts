export type ProjectStatus = 'launching' | 'available' | 'limited' | 'sold_out'

export type AvailabilityStatus = 'available' | 'limited' | 'reserved' | 'sold'

export type UnitStatus = 'available' | 'reserved' | 'sold' | 'inactive'

export interface ProjectMapInfo {
  address: string
  lat: number
  lng: number
  embedUrl: string
  googleMapsUrl: string
  nearbyAccess: string[]
}

export interface Project {
  id: string
  slug: string
  name: string
  tagline: string
  location: string
  city: string
  description: string
  fullDescription: string
  coverImage: string
  galleryImages: string[]
  totalUnits: number
  availableUnits: number
  reservedUnits: number
  soldUnits: number
  startingPrice: number
  status: ProjectStatus
  featured: boolean
  landAreaRange: string
  totalAreaHectares: string
  completionTarget: string
  highlights: string[]
  facilities: string[]
  map: ProjectMapInfo
}

export interface BuildingSpecification {
  label: string
  value: string
}

export interface FloorplanRoom {
  id: string
  name: string
  dimensions: string
  x: number
  y: number
  w: number
  h: number
  tone: 'living' | 'bedroom' | 'service' | 'outdoor' | 'circulation'
}

export interface FloorplanFloor {
  level: number
  title: string
  areaLabel: string
  rooms: FloorplanRoom[]
}

export interface SampleUnit {
  id: string
  unitCode: string
  block: string
  price: number
  landArea: number
  facing: string
  status: UnitStatus
}

export interface HouseType {
  id: string
  slug: string
  projectId: string
  projectSlug: string
  projectName: string
  projectLocation: string
  name: string
  category: string
  price: number
  bookingFee: number
  reservationHoldHours: number
  landArea: number
  buildingArea: number
  bedrooms: number
  bathrooms: number
  floors: number
  carport: number
  availableUnits: number
  totalUnits: number
  status: AvailabilityStatus
  coverImage: string
  galleryImages: string[]
  featured: boolean
  shortDescription: string
  fullDescription: string
  specs: string[]
  buildingSpecs: BuildingSpecification[]
  floorplans: FloorplanFloor[]
  sampleUnits: SampleUnit[]
}

export interface Facility {
  id: string
  title: string
  category: string
  description: string
  iconName: 'shield' | 'trees' | 'waves' | 'wifi' | 'building' | 'zap'
  highlight: string
}

export interface GalleryItem {
  id: string
  title: string
  category: 'Eksterior' | 'Kawasan' | 'Fasilitas' | 'Interior'
  projectName: string
  imageUrl: string
  caption: string
}

export interface Testimonial {
  id: string
  customerName: string
  role: string
  projectName: string
  houseType: string
  quote: string
  rating: number
  initials: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: string
}

export interface PropertySearchQuery {
  keyword: string
  location: string
  priceRange: string
  bedrooms: string
}
