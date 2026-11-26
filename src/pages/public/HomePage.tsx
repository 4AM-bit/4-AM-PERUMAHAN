import { useState } from 'react'
import { HeroSection } from '@/features/home/HeroSection'
import { FeaturedProjectsSection } from '@/features/home/FeaturedProjectsSection'
import { HouseTypesSection } from '@/features/home/HouseTypesSection'
import { DeveloperAdvantagesSection } from '@/features/home/DeveloperAdvantagesSection'
import { FacilitiesSection } from '@/features/home/FacilitiesSection'
import { GallerySection } from '@/features/home/GallerySection'
import { TestimonialsSection } from '@/features/home/TestimonialsSection'
import { FaqSection } from '@/features/home/FaqSection'
import type { PropertySearchQuery } from '@/types/property'

const INITIAL_QUERY: PropertySearchQuery = {
  keyword: '',
  location: 'Semua Lokasi',
  priceRange: 'all',
  bedrooms: 'all',
}

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState<PropertySearchQuery>(INITIAL_QUERY)

  return (
    <>
      <HeroSection onSearch={setSearchQuery} />
      <FeaturedProjectsSection />
      <HouseTypesSection
        searchQuery={searchQuery}
        onResetSearch={() => setSearchQuery(INITIAL_QUERY)}
      />
      <DeveloperAdvantagesSection />
      <FacilitiesSection />
      <GallerySection />
      <TestimonialsSection />
      <FaqSection />
    </>
  )
}
