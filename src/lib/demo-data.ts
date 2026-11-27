import type {
  BuildingSpecification,
  Facility,
  FaqItem,
  FloorplanFloor,
  GalleryItem,
  HouseType,
  Project,
  Testimonial,
} from '@/types/property'

/**
 * DATA DEMO (PHASE 1–2)
 * Seluruh data di bawah adalah data demo terlabel untuk pengujian halaman publik
 * sebelum integrasi database PostgreSQL Supabase pada Phase 3 & Phase 4.
 */

const STANDARD_BUILDING_SPECS: BuildingSpecification[] = [
  { label: 'Pondasi', value: 'Tiang pancang mini pile / batu kali bertulang (sesuai uji sondir)' },
  { label: 'Struktur', value: 'Beton bertulang standar SNI tahan gempa' },
  { label: 'Dinding', value: 'Bata ringan AAC plester aci, finishing cat weather-shield' },
  { label: 'Lantai Utama', value: 'Homogeneous Tile 60×60 cm matte warm tone' },
  { label: 'Lantai Kamar Mandi', value: 'Keramik anti-slip 30×60 cm & dinding full keramik' },
  { label: 'Atap & Rangka', value: 'Rangka baja ringan SNI, genteng beton flat warna charcoal' },
  { label: 'Plafon', value: 'Gypsum board rangka hollow galvanis + shadow line' },
  { label: 'Kusen & Pintu', value: 'Aluminium powder coating charcoal & pintu utama kayu solid + smart lock' },
  { label: 'Sanitair', value: 'TOTO / setara (kloset duduk dual-flush, wastafel, rain shower)' },
  { label: 'Listrik & Air', value: 'PLN 2.200–3.500 VA kabel bawah tanah & air bersih PDAM / WTP kawasan' },
]

const FLOORPLAN_1_STORY: FloorplanFloor[] = [
  {
    level: 1,
    title: 'Denah Lantai 1',
    areaLabel: 'LB 45 m² • LT 72 m² (6 × 12 m)',
    rooms: [
      { id: 'carport', name: 'Carport', dimensions: '3,0 × 5,0 m', x: 20, y: 20, w: 170, h: 115, tone: 'outdoor' },
      { id: 'garden-front', name: 'Taman Depan', dimensions: '3,0 × 3,5 m', x: 200, y: 20, w: 180, h: 85, tone: 'outdoor' },
      { id: 'terrace', name: 'Teras', dimensions: '3,0 × 1,5 m', x: 200, y: 110, w: 180, h: 25, tone: 'circulation' },
      { id: 'living', name: 'Ruang Tamu & Makan', dimensions: '3,0 × 5,5 m', x: 200, y: 145, w: 180, h: 145, tone: 'living' },
      { id: 'bed-1', name: 'Kamar Utama', dimensions: '3,0 × 3,2 m', x: 20, y: 145, w: 170, h: 95, tone: 'bedroom' },
      { id: 'bath', name: 'K. Mandi', dimensions: '1,6 × 2,0 m', x: 20, y: 248, w: 80, h: 52, tone: 'service' },
      { id: 'kitchen', name: 'Dapur', dimensions: '2,2 × 2,0 m', x: 108, y: 248, w: 82, h: 52, tone: 'service' },
      { id: 'bed-2', name: 'Kamar Anak', dimensions: '3,0 × 2,8 m', x: 20, y: 308, w: 170, h: 82, tone: 'bedroom' },
      { id: 'garden-back', name: 'Taman Belakang', dimensions: '3,0 × 3,0 m', x: 200, y: 298, w: 180, h: 92, tone: 'outdoor' },
    ],
  },
]

const FLOORPLAN_2_STORY_FAMILY: FloorplanFloor[] = [
  {
    level: 1,
    title: 'Lantai 1 (Area Sosial)',
    areaLabel: 'Area Publik, Dapur & Taman Belakang',
    rooms: [
      { id: 'f1-carport', name: 'Carport 2 Mobil', dimensions: '4,5 × 5,0 m', x: 20, y: 20, w: 225, h: 110, tone: 'outdoor' },
      { id: 'f1-garden', name: 'Taman Depan', dimensions: '2,5 × 5,0 m', x: 255, y: 20, w: 125, h: 110, tone: 'outdoor' },
      { id: 'f1-living', name: 'Living & Dining Open-Plan', dimensions: '4,2 × 6,0 m', x: 20, y: 140, w: 225, h: 160, tone: 'living' },
      { id: 'f1-bed1', name: 'Kamar Tamu / Kerja', dimensions: '2,8 × 3,2 m', x: 255, y: 140, w: 125, h: 95, tone: 'bedroom' },
      { id: 'f1-bath1', name: 'Powder Room', dimensions: '1,5 × 2,2 m', x: 255, y: 243, w: 125, h: 57, tone: 'service' },
      { id: 'f1-kitchen', name: 'Dapur & Pantry', dimensions: '3,0 × 2,8 m', x: 20, y: 310, w: 155, h: 80, tone: 'service' },
      { id: 'f1-backyard', name: 'Teras & Taman Belakang', dimensions: '4,0 × 2,8 m', x: 185, y: 310, w: 195, h: 80, tone: 'outdoor' },
    ],
  },
  {
    level: 2,
    title: 'Lantai 2 (Area Privat)',
    areaLabel: 'Kamar Utama En-Suite & Balkon',
    rooms: [
      { id: 'f2-balcony', name: 'Balkon Kantilever', dimensions: '4,5 × 1,8 m', x: 20, y: 20, w: 235, h: 58, tone: 'outdoor' },
      { id: 'f2-void', name: 'Void / Tangga', dimensions: '2,5 × 4,0 m', x: 265, y: 20, w: 115, h: 145, tone: 'circulation' },
      { id: 'f2-master', name: 'Master Bedroom', dimensions: '4,5 × 4,2 m', x: 20, y: 88, w: 235, h: 140, tone: 'bedroom' },
      { id: 'f2-master-bath', name: 'En-Suite Bath', dimensions: '2,5 × 2,2 m', x: 265, y: 175, w: 115, h: 68, tone: 'service' },
      { id: 'f2-hall', name: 'Ruang Duduk Keluarga', dimensions: '2,5 × 3,5 m', x: 265, y: 253, w: 115, h: 137, tone: 'living' },
      { id: 'f2-kid1', name: 'Kamar Tidur 2', dimensions: '3,2 × 3,5 m', x: 20, y: 238, w: 115, h: 152, tone: 'bedroom' },
      { id: 'f2-kid2', name: 'Kamar Tidur 3', dimensions: '3,2 × 3,5 m', x: 143, y: 238, w: 112, h: 152, tone: 'bedroom' },
    ],
  },
]

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-serenity-bsd',
    slug: 'serenity-forest-residence',
    name: 'Serenity Forest Residence',
    tagline: 'Hunian Tropis Modern di Koridor Hijau BSD City',
    location: 'BSD City, Tangerang Selatan',
    city: 'BSD City',
    description:
      'Kawasan hunian eksklusif berkonsep biophilic living dengan 45% ruang terbuka hijau, akses 5 menit menuju tol Serbaraja, dan clubhouse privat untuk setiap klaster.',
    fullDescription:
      'Serenity Forest Residence dikembangkan di atas lahan seluas 12 hektare di koridor barat BSD City. Menggabungkan ketenangan hutan kota dengan kemudahan akses pendidikan internasional, pusat perbelanjaan, dan gerbang tol Serbaraja, kawasan ini menawarkan hunian 2 lantai berarsitektur tropis kontemporer dengan utilitas bawah tanah sepenuhnya.',
    coverImage: '/images/project-cluster-1.jpg',
    galleryImages: [
      '/images/project-cluster-1.jpg',
      '/images/hero-residence.jpg',
      '/images/interior-living.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    totalUnits: 148,
    availableUnits: 24,
    reservedUnits: 16,
    soldUnits: 108,
    startingPrice: 1250000000,
    status: 'available',
    featured: true,
    landAreaRange: '72 – 150 m²',
    totalAreaHectares: '12 Hektare',
    completionTarget: 'Tahap 2 Siap Serah Terima Q4 2027',
    highlights: ['5 Menit ke Tol Serbaraja', '45% Ruang Terbuka Hijau', 'Underground Utilities'],
    facilities: [
      'Private Clubhouse & Semi-Olympic Pool',
      'Forest Jogging Track 1,8 km',
      'One-Gate RFID & CCTV 24/7',
      'Masjid Arsitektur Tropis',
      'Children Thematic Playground',
      'Fiber Optic & Underground Electricity',
    ],
    map: {
      address: 'Jl. Boulevard Hijau Kav. 18, BSD City, Kec. Pagedangan, Kab. Tangerang, Banten 15339',
      lat: -6.3018,
      lng: 106.6414,
      embedUrl: 'https://www.google.com/maps?q=-6.3018,106.6414&z=15&output=embed',
      googleMapsUrl: 'https://www.google.com/maps?q=-6.3018,106.6414',
      nearbyAccess: [
        '5 menit ke Gerbang Tol Serbaraja',
        '7 menit ke AEON Mall BSD & ICE BSD',
        '10 menit ke Stasiun Cisauk (Intermoda)',
        '6 menit ke Sekolah & Universitas Internasional',
      ],
    },
  },
  {
    id: 'proj-verdant-sentul',
    slug: 'verdant-hills-estate',
    name: 'Verdant Hills Estate',
    tagline: 'Panorama Perbukitan Sejuk & Udara Pegunungan',
    location: 'Sentul Selatan, Bogor',
    city: 'Sentul Selatan',
    description:
      'Klaster residensial bernuansa resor di ketinggian Sentul Selatan dengan kontur berkabut pagi, lintasan lari tepi danau, dan arsitektur bukaan kaca maksimal.',
    fullDescription:
      'Berada di ketinggian 320 mdpl Sentul Selatan, Verdant Hills Estate menghadirkan kualitas udara pegunungan yang sejuk sepanjang hari. Tata klaster berundak mengikuti kontur alami perbukitan sehingga setiap rumah memiliki pemandangan lanskap hijau terbuka dan privasi terjaga.',
    coverImage: '/images/project-cluster-2.jpg',
    galleryImages: [
      '/images/project-cluster-2.jpg',
      '/images/house-type-executive.jpg',
      '/images/facility-clubhouse.jpg',
      '/images/interior-living.jpg',
    ],
    totalUnits: 112,
    availableUnits: 11,
    reservedUnits: 9,
    soldUnits: 92,
    startingPrice: 1680000000,
    status: 'limited',
    featured: true,
    landAreaRange: '90 – 180 m²',
    totalAreaHectares: '9,5 Hektare',
    completionTarget: 'Ready Stock & Indent 12 Bulan',
    highlights: ['View Perbukitan & Danau', 'Clubhouse Resort-Style', 'Smart Gate Access'],
    facilities: [
      'Lakeside Promenade & Yoga Deck',
      'Infinity Pool menghadap Lembah',
      'Smart Gate License Plate Recognition',
      'Gym & Co-Working Lounge Penghuni',
      'Sistem Resapan Biopori Terpadu',
      'Estate Management 24 Jam',
    ],
    map: {
      address: 'Jl. Bukit Verdant Raya No. 8, Sentul Selatan, Babakan Madang, Bogor, Jawa Barat 16810',
      lat: -6.5782,
      lng: 106.8655,
      embedUrl: 'https://www.google.com/maps?q=-6.5782,106.8655&z=15&output=embed',
      googleMapsUrl: 'https://www.google.com/maps?q=-6.5782,106.8655',
      nearbyAccess: [
        '8 menit ke Gerbang Tol Sentul Selatan (Jagorawi)',
        '6 menit ke AEON Mall Sentul City',
        '10 menit ke RS EMC Sentul',
        '12 menit ke Lapangan Golf & Kawasan Kuliner Sentul',
      ],
    },
  },
  {
    id: 'proj-canopy-cibubur',
    slug: 'the-canopy-park',
    name: 'The Canopy Park',
    tagline: 'Klaster Keluarga Muda Dekat Akses LRT & Tol',
    location: 'Cibubur, Depok',
    city: 'Cibubur',
    description:
      'Dirancang bagi keluarga modern yang mengutamakan efisiensi ruang, konektivitas transportasi publik LRT, serta lingkungan ramah anak dengan taman tematik terpadu.',
    fullDescription:
      'The Canopy Park menjadi pilihan ideal bagi profesional dan keluarga muda yang bekerja di Jakarta namun mendambakan lingkungan asri. Hanya 8 menit dari Stasiun LRT Harjamukti dan Gerbang Tol Cibubur, seluruh unit dirancang dengan pencahayaan alami maksimal dan fleksibilitas ruang tumbuh.',
    coverImage: '/images/hero-residence.jpg',
    galleryImages: [
      '/images/hero-residence.jpg',
      '/images/house-type-compact.jpg',
      '/images/project-cluster-1.jpg',
      '/images/interior-living.jpg',
    ],
    totalUnits: 164,
    availableUnits: 42,
    reservedUnits: 18,
    soldUnits: 104,
    startingPrice: 895000000,
    status: 'launching',
    featured: true,
    landAreaRange: '60 – 105 m²',
    totalAreaHectares: '8,2 Hektare',
    completionTarget: 'Tahap 1 Launching • Serah Terima 14 Bulan',
    highlights: ['8 Menit ke Stasiun LRT', 'Taman Bermain Edukatif', 'Cicilan KPR Fleksibel'],
    facilities: [
      'Central Canopy Park 1,2 Hektare',
      'Shuttle Bus ke Stasiun LRT Harjamukti',
      'One-Gate Security & Panic Button',
      'Lapangan Basket 3-on-3 & Jogging Path',
      'Community Hall & Ruang Ibadah',
      'Drainase Tertutup Bebas Banjir',
    ],
    map: {
      address: 'Jl. Alternatif Transyogi KM 4, Harjamukti, Cimanggis, Depok / Cibubur 16454',
      lat: -6.3738,
      lng: 106.8981,
      embedUrl: 'https://www.google.com/maps?q=-6.3738,106.8981&z=15&output=embed',
      googleMapsUrl: 'https://www.google.com/maps?q=-6.3738,106.8981',
      nearbyAccess: [
        '8 menit ke Stasiun LRT Harjamukti',
        '7 menit ke Gerbang Tol Cibubur & Cimanggis',
        '5 menit ke Trans Studio Mall Cibubur',
        '6 menit ke RS Meilia & RS Permata Cibubur',
      ],
    },
  },
]

export const DEMO_HOUSE_TYPES: HouseType[] = [
  {
    id: 'ht-akasia-45',
    slug: 'akasia-45-72',
    projectId: 'proj-canopy-cibubur',
    projectSlug: 'the-canopy-park',
    projectName: 'The Canopy Park',
    projectLocation: 'Cibubur',
    name: 'Tipe Akasia 45/72',
    category: '1 Lantai • Compact Tropical',
    price: 895000000,
    bookingFee: 5000000,
    reservationHoldHours: 24,
    landArea: 72,
    buildingArea: 45,
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    carport: 1,
    availableUnits: 16,
    totalUnits: 48,
    status: 'available',
    coverImage: '/images/house-type-compact.jpg',
    galleryImages: [
      '/images/house-type-compact.jpg',
      '/images/interior-living.jpg',
      '/images/project-cluster-1.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    featured: true,
    shortDescription:
      'Tata ruang 1 lantai tanpa sekat berlebih dengan plafon tinggi 3,6 meter dan taman belakang privat untuk keluarga muda.',
    fullDescription:
      'Tipe Akasia 45/72 memaksimalkan setiap meter persegi lahan 6×12 meter menjadi hunian yang terasa lapang dan terang. Dilengkapi plafon ruang utama setinggi 3,6 meter, sirkulasi udara silang langsung ke taman belakang, serta struktur siap kembang untuk kebutuhan keluarga di masa depan.',
    specs: ['SHM & PBG Lengkap', 'Smart Door Lock', 'Taman Belakang Privat'],
    buildingSpecs: STANDARD_BUILDING_SPECS,
    floorplans: FLOORPLAN_1_STORY,
    sampleUnits: [
      { id: 'u-ak-a02', unitCode: 'CP-A02', block: 'Blok A', price: 895000000, landArea: 72, facing: 'Timur', status: 'available' },
      { id: 'u-ak-a05', unitCode: 'CP-A05', block: 'Blok A', price: 895000000, landArea: 72, facing: 'Timur', status: 'available' },
      { id: 'u-ak-a08', unitCode: 'CP-A08', block: 'Blok A', price: 935000000, landArea: 84, facing: 'Utara (Hook)', status: 'available' },
      { id: 'u-ak-b01', unitCode: 'CP-B01', block: 'Blok B', price: 895000000, landArea: 72, facing: 'Selatan', status: 'reserved' },
    ],
  },
  {
    id: 'ht-damar-58',
    slug: 'damar-58-84',
    projectId: 'proj-canopy-cibubur',
    projectSlug: 'the-canopy-park',
    projectName: 'The Canopy Park',
    projectLocation: 'Cibubur',
    name: 'Tipe Damar 58/84',
    category: '2 Lantai • Urban Starter',
    price: 1150000000,
    bookingFee: 7500000,
    reservationHoldHours: 24,
    landArea: 84,
    buildingArea: 58,
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    carport: 1,
    availableUnits: 12,
    totalUnits: 44,
    status: 'available',
    coverImage: '/images/project-cluster-2.jpg',
    galleryImages: [
      '/images/project-cluster-2.jpg',
      '/images/interior-living.jpg',
      '/images/house-type-compact.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    featured: false,
    shortDescription:
      'Hunian 2 lantai efisien dengan 3 kamar tidur, area ruang kerja di lantai atas, dan fasad modern beraksen kayu hangat.',
    fullDescription:
      'Tipe Damar 58/84 menjawab kebutuhan keluarga muda yang menginginkan 3 kamar tidur terpisah di kawasan strategis Cibubur. Lantai dasar difokuskan sebagai area berkumpul dan makan yang menyatu dengan taman belakang, sementara lantai dua menghadirkan privasi maksimal.',
    specs: ['3 Kamar Tidur', 'Akses 8 Menit LRT', 'Smart Home Ready'],
    buildingSpecs: STANDARD_BUILDING_SPECS,
    floorplans: FLOORPLAN_2_STORY_FAMILY,
    sampleUnits: [
      { id: 'u-dm-c03', unitCode: 'CP-C03', block: 'Blok C', price: 1150000000, landArea: 84, facing: 'Timur', status: 'available' },
      { id: 'u-dm-c07', unitCode: 'CP-C07', block: 'Blok C', price: 1150000000, landArea: 84, facing: 'Utara', status: 'available' },
      { id: 'u-dm-c10', unitCode: 'CP-C10', block: 'Blok C', price: 1210000000, landArea: 96, facing: 'Timur (Hook)', status: 'reserved' },
    ],
  },
  {
    id: 'ht-cendana-68',
    slug: 'cendana-68-90',
    projectId: 'proj-serenity-bsd',
    projectSlug: 'serenity-forest-residence',
    projectName: 'Serenity Forest Residence',
    projectLocation: 'BSD City',
    name: 'Tipe Cendana 68/90',
    category: '2 Lantai • Modern Family',
    price: 1380000000,
    bookingFee: 10000000,
    reservationHoldHours: 24,
    landArea: 90,
    buildingArea: 68,
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    carport: 2,
    availableUnits: 9,
    totalUnits: 52,
    status: 'available',
    coverImage: '/images/project-cluster-1.jpg',
    galleryImages: [
      '/images/project-cluster-1.jpg',
      '/images/interior-living.jpg',
      '/images/hero-residence.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    featured: true,
    shortDescription:
      'Hunian 2 lantai berfasad kayu jati & batu alam dengan ruang keluarga menyatu ke teras taman dan pencahayaan alami optimal.',
    fullDescription:
      'Tipe Cendana 68/90 merupakan tipe terfavorit di Serenity Forest Residence BSD City. Menawarkan carport 2 mobil, tata ruang open-plan dengan pintu kaca geser lebar menuju taman belakang, serta kamar tidur utama dengan balkon pribadi menghadap koridor hijau.',
    specs: ['3 Kamar Tidur Luas', 'Carport 2 Mobil', 'Cross Ventilation System'],
    buildingSpecs: STANDARD_BUILDING_SPECS,
    floorplans: FLOORPLAN_2_STORY_FAMILY,
    sampleUnits: [
      { id: 'u-cn-b04', unitCode: 'SF-B04', block: 'Blok B', price: 1380000000, landArea: 90, facing: 'Utara', status: 'available' },
      { id: 'u-cn-b09', unitCode: 'SF-B09', block: 'Blok B', price: 1380000000, landArea: 90, facing: 'Timur', status: 'available' },
      { id: 'u-cn-b12', unitCode: 'SF-B12', block: 'Blok B', price: 1460000000, landArea: 105, facing: 'Timur (Taman)', status: 'available' },
      { id: 'u-cn-b14', unitCode: 'SF-B14', block: 'Blok B', price: 1380000000, landArea: 90, facing: 'Selatan', status: 'sold' },
    ],
  },
  {
    id: 'ht-meranti-82',
    slug: 'meranti-82-105',
    projectId: 'proj-verdant-sentul',
    projectSlug: 'verdant-hills-estate',
    projectName: 'Verdant Hills Estate',
    projectLocation: 'Sentul Selatan',
    name: 'Tipe Meranti 82/105',
    category: '2 Lantai • Resort Residence',
    price: 1680000000,
    bookingFee: 10000000,
    reservationHoldHours: 24,
    landArea: 105,
    buildingArea: 82,
    bedrooms: 3,
    bathrooms: 3,
    floors: 2,
    carport: 2,
    availableUnits: 7,
    totalUnits: 38,
    status: 'available',
    coverImage: '/images/interior-living.jpg',
    galleryImages: [
      '/images/interior-living.jpg',
      '/images/project-cluster-2.jpg',
      '/images/house-type-executive.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    featured: false,
    shortDescription:
      'Hunian bernuansa resor dengan kamar mandi di setiap kamar, teras samping luas, dan bukaan jendela penuh menghadap perbukitan.',
    fullDescription:
      'Tipe Meranti 82/105 memanfaatkan udara sejuk Sentul Selatan melalui bukaan jendela sudut penuh dan kisi-kisi kayu peneduh matahari. Setiap kamar tidur dirancang nyaman untuk dihuni jangka panjang sekaligus ideal sebagai rumah liburan keluarga.',
    specs: ['3 Kamar + 3 Kamar Mandi', 'View Perbukitan', 'Solar Water Heater Ready'],
    buildingSpecs: STANDARD_BUILDING_SPECS,
    floorplans: FLOORPLAN_2_STORY_FAMILY,
    sampleUnits: [
      { id: 'u-mr-d01', unitCode: 'VH-D01', block: 'Blok D', price: 1680000000, landArea: 105, facing: 'Timur', status: 'available' },
      { id: 'u-mr-d04', unitCode: 'VH-D04', block: 'Blok D', price: 1680000000, landArea: 105, facing: 'Utara', status: 'available' },
      { id: 'u-mr-d06', unitCode: 'VH-D06', block: 'Blok D', price: 1750000000, landArea: 115, facing: 'View Lembah', status: 'reserved' },
    ],
  },
  {
    id: 'ht-mahoni-96',
    slug: 'mahoni-96-120',
    projectId: 'proj-verdant-sentul',
    projectSlug: 'verdant-hills-estate',
    projectName: 'Verdant Hills Estate',
    projectLocation: 'Sentul Selatan',
    name: 'Tipe Mahoni 96/120',
    category: '2 Lantai • Executive Villa',
    price: 1850000000,
    bookingFee: 15000000,
    reservationHoldHours: 48,
    landArea: 120,
    buildingArea: 96,
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    carport: 2,
    availableUnits: 4,
    totalUnits: 34,
    status: 'limited',
    coverImage: '/images/house-type-executive.jpg',
    galleryImages: [
      '/images/house-type-executive.jpg',
      '/images/project-cluster-2.jpg',
      '/images/interior-living.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    featured: true,
    shortDescription:
      'Dirancang dengan balkon kantilever menghadap taman hijau, kamar utama en-suite, serta ruang kerja terpisah di lantai dasar.',
    fullDescription:
      'Tipe Mahoni 96/120 menghadirkan standar hunian eksekutif dengan proporsi fasad megah berbalut batu alam dan kisi kayu vertikal. Tersedia 4 kamar tidur termasuk kamar lantai bawah yang fleksibel digunakan sebagai kamar orang tua atau ruang kerja privat.',
    specs: ['Master Suite + Walk-in Closet', 'Home Office Area', 'Solar Water Heater Ready'],
    buildingSpecs: STANDARD_BUILDING_SPECS,
    floorplans: FLOORPLAN_2_STORY_FAMILY,
    sampleUnits: [
      { id: 'u-mh-e02', unitCode: 'VH-E02', block: 'Blok E', price: 1850000000, landArea: 120, facing: 'Timur', status: 'available' },
      { id: 'u-mh-e05', unitCode: 'VH-E05', block: 'Blok E', price: 1920000000, landArea: 128, facing: 'View Danau', status: 'available' },
      { id: 'u-mh-e08', unitCode: 'VH-E08', block: 'Blok E', price: 1850000000, landArea: 120, facing: 'Utara', status: 'sold' },
    ],
  },
  {
    id: 'ht-eboni-128',
    slug: 'eboni-128-150',
    projectId: 'proj-serenity-bsd',
    projectSlug: 'serenity-forest-residence',
    projectName: 'Serenity Forest Residence',
    projectLocation: 'BSD City',
    name: 'Tipe Eboni 128/150',
    category: '2 Lantai • Signature Estate',
    price: 2650000000,
    bookingFee: 20000000,
    reservationHoldHours: 48,
    landArea: 150,
    buildingArea: 128,
    bedrooms: 4,
    bathrooms: 4,
    floors: 2,
    carport: 2,
    availableUnits: 3,
    totalUnits: 20,
    status: 'limited',
    coverImage: '/images/hero-residence.jpg',
    galleryImages: [
      '/images/hero-residence.jpg',
      '/images/interior-living.jpg',
      '/images/project-cluster-1.jpg',
      '/images/facility-clubhouse.jpg',
    ],
    featured: true,
    shortDescription:
      'Koleksi unggulan di boulevard utama dengan double-height living room, dapur bersih-kotor terpisah, dan halaman luas berpotensi kolam renang.',
    fullDescription:
      'Tipe Eboni 128/150 adalah mahakarya residensial PERUMAHAN yang berlokasi eksklusif di boulevard utama selebar 12 meter. Dilengkapi ruang tamu berplafon ganda (double-height), area servis & kamar ART terpisah, serta halaman belakang luas yang siap dikembangkan menjadi plunge pool pribadi.',
    specs: ['Double-Height Living Room', 'Kamar ART Terpisah', 'Posisi Boulevard Utama'],
    buildingSpecs: [
      ...STANDARD_BUILDING_SPECS.slice(0, 3),
      { label: 'Lantai Utama', value: 'Homogeneous Tile 80×80 cm Marble Series & Lantai Parket Kamar Utama' },
      ...STANDARD_BUILDING_SPECS.slice(4, 9),
      { label: 'Listrik & Air', value: 'PLN 4.400 VA kabel bawah tanah, instalasi EV Charger Ready & WTP Kawasan' },
    ],
    floorplans: FLOORPLAN_2_STORY_FAMILY,
    sampleUnits: [
      { id: 'u-eb-v01', unitCode: 'SF-V01', block: 'Boulevard Utama', price: 2650000000, landArea: 150, facing: 'Timur', status: 'available' },
      { id: 'u-eb-v03', unitCode: 'SF-V03', block: 'Boulevard Utama', price: 2780000000, landArea: 165, facing: 'Timur (Hook)', status: 'available' },
      { id: 'u-eb-v05', unitCode: 'SF-V05', block: 'Boulevard Utama', price: 2650000000, landArea: 150, facing: 'Utara', status: 'reserved' },
    ],
  },
]

export const DEVELOPER_ADVANTAGES = [
  {
    number: '01',
    title: 'Legalitas SHM & PBG Terjamin',
    description:
      'Setiap unit telah melalui proses pemecahan sertifikat dan perizinan bangunan resmi sehingga aman untuk transaksi tunai maupun KPR bank nasional.',
  },
  {
    number: '02',
    title: 'Reservasi Online Transparan',
    description:
      'Ketersediaan unit diperbarui secara real-time dengan penguncian unit otomatis saat reservasi untuk mencegah pemesanan ganda (double booking).',
  },
  {
    number: '03',
    title: 'Arsitektur Tropis Berkelanjutan',
    description:
      'Mengutamakan sirkulasi udara silang, pencahayaan alami, material ramah iklim tropis, serta 45% rasio ruang terbuka hijau di setiap klaster.',
  },
  {
    number: '04',
    title: 'Garansi Konstruksi & Estate Management',
    description:
      'Didukung jaminan pemeliharaan bangunan selama 12 bulan pasca serah terima serta manajemen kawasan profesional 24 jam.',
  },
] as const

export const DEMO_FACILITIES: Facility[] = [
  {
    id: 'fac-clubhouse',
    title: 'Private Clubhouse & Lap Pool',
    category: 'Rekreasi',
    description:
      'Kolam renang semi-olympic bernuansa resor, lounge tepi kolam, dan ruang kebugaran eksklusif khusus penghuni.',
    iconName: 'waves',
    highlight: 'Khusus Penghuni',
  },
  {
    id: 'fac-security',
    title: 'One-Gate System & CCTV 24/7',
    category: 'Keamanan',
    description:
      'Akses gerbang tunggal dengan kartu RFID penghuni, patroli keamanan terlatih, dan kamera pemantau di seluruh koridor klaster.',
    iconName: 'shield',
    highlight: 'Keamanan Berlapis',
  },
  {
    id: 'fac-park',
    title: 'Forest Park & Jogging Track',
    category: 'Ruang Hijau',
    description:
      'Jalur lari sepanjang 1,8 km di bawah kanopi pepohonan rindang dilengkapi area yoga outdoor dan taman bermain anak.',
    iconName: 'trees',
    highlight: '45% Area Hijau',
  },
  {
    id: 'fac-smart',
    title: 'Smart Home & Fiber Optic Ready',
    category: 'Teknologi',
    description:
      'Setiap rumah dilengkapi smart door lock, instalasi CCTV siap pakai, dan jaringan internet fiber optik berkecepatan tinggi.',
    iconName: 'wifi',
    highlight: 'Siap Huni Digital',
  },
  {
    id: 'fac-community',
    title: 'Masjid & Community Pavilion',
    category: 'Komunitas',
    description:
      'Rumah ibadah berarsitektur kontemporer dan ruang serbaguna untuk aktivitas sosial maupun pertemuan warga.',
    iconName: 'building',
    highlight: 'Pusat Interaksi',
  },
  {
    id: 'fac-utilities',
    title: 'Underground Utilities & Drainase Modern',
    category: 'Infrastruktur',
    description:
      'Seluruh kabel listrik dan telekomunikasi tertanam di bawah tanah dengan sistem resapan biopori bebas genangan.',
    iconName: 'zap',
    highlight: 'Kawasan Rapi & Bebas Banjir',
  },
]

export const DEMO_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Fasad Signature Tipe Eboni',
    category: 'Eksterior',
    projectName: 'Serenity Forest Residence',
    imageUrl: '/images/hero-residence.jpg',
    caption: 'Komposisi fasad tropis modern dengan kisi-kisi kayu jati dan pencahayaan hangat senja hari.',
  },
  {
    id: 'gal-2',
    title: 'Boulevard Hijau Utama',
    category: 'Kawasan',
    projectName: 'Serenity Forest Residence',
    imageUrl: '/images/project-cluster-1.jpg',
    caption: 'Koridor jalan kawasan lebar 10 meter dengan jalur pedestrian batu alam dan utilitas bawah tanah.',
  },
  {
    id: 'gal-3',
    title: 'Clubhouse & Resort Lap Pool',
    category: 'Fasilitas',
    projectName: 'Verdant Hills Estate',
    imageUrl: '/images/facility-clubhouse.jpg',
    caption: 'Fasilitas kolam renang eksklusif dengan dek kayu dan lanskap tropis yang menenangkan.',
  },
  {
    id: 'gal-4',
    title: 'Tipe Akasia 1 Lantai',
    category: 'Eksterior',
    projectName: 'The Canopy Park',
    imageUrl: '/images/house-type-compact.jpg',
    caption: 'Hunian fungsional bagi keluarga muda dengan halaman depan hijau dan carport luas.',
  },
  {
    id: 'gal-5',
    title: 'Ruang Keluarga Open-Plan',
    category: 'Interior',
    projectName: 'Serenity Forest Residence',
    imageUrl: '/images/interior-living.jpg',
    caption: 'Interior lapang dengan bukaan kaca penuh yang menghadirkan cahaya matahari alami sepanjang hari.',
  },
  {
    id: 'gal-6',
    title: 'Klaster Eksekutif Tipe Mahoni',
    category: 'Kawasan',
    projectName: 'Verdant Hills Estate',
    imageUrl: '/images/project-cluster-2.jpg',
    caption: 'Lingkungan hunian bernuansa vila modern dengan privasi tinggi dan tata lanskap terawat.',
  },
]

export const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    customerName: 'Arif Budiman & Nadia',
    role: 'Penghuni sejak 2025',
    projectName: 'Serenity Forest Residence',
    houseType: 'Tipe Cendana 68/90',
    quote:
      'Proses reservasi unit hingga verifikasi pembayaran sangat rapi dan transparan. Kami bisa memantau status penguncian unit dan jadwal serah terima langsung dari dashboard tanpa perlu bolak-balik ke kantor pemasaran.',
    rating: 5,
    initials: 'AB',
  },
  {
    id: 'test-2',
    customerName: 'dr. Clarissa Wijaya',
    role: 'Pemilik Unit',
    projectName: 'Verdant Hills Estate',
    houseType: 'Tipe Mahoni 96/120',
    quote:
      'Kualitas bangunan dan kerapian lanskap sesuai ekspektasi. Sirkulasi udara di dalam rumah sangat sejuk sehingga siang hari tetap nyaman meski tanpa pendingin ruangan.',
    rating: 5,
    initials: 'CW',
  },
  {
    id: 'test-3',
    customerName: 'Rendra Pratama',
    role: 'Pembeli Pertama',
    projectName: 'The Canopy Park',
    houseType: 'Tipe Akasia 45/72',
    quote:
      'Sebagai pembeli rumah pertama, tim sales PERUMAHAN sangat komunikatif menjelaskan legalitas SHM dan skema transfer booking fee. Lingkungan klaster terasa tenang dan aman untuk anak-anak.',
    rating: 5,
    initials: 'RP',
  },
]

export const DEMO_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Reservasi',
    question: 'Bagaimana alur reservasi unit rumah di platform PERUMAHAN?',
    answer:
      'Anda cukup memilih proyek dan tipe rumah, menentukan nomor unit yang masih berstatus tersedia, mengisi data identitas melalui akun pelanggan, lalu sistem akan menerbitkan nomor reservasi otomatis dan mengunci unit sementara selama masa berlaku reservasi.',
  },
  {
    id: 'faq-2',
    category: 'Pembayaran',
    question: 'Bagaimana sistem pembayaran booking fee dilakukan?',
    answer:
      'Pembayaran dilakukan secara manual melalui transfer bank ke rekening resmi PT Abdurrahman Properti yang tertera pada instruksi pembayaran. Setelah transfer, unggah bukti pembayaran di dashboard pelanggan agar tim administrator dapat memverifikasi dalam 1×24 jam kerja.',
  },
  {
    id: 'faq-3',
    category: 'Ketersediaan Unit',
    question: 'Apakah unit yang sudah saya reservasi bisa dipesan orang lain secara bersamaan?',
    answer:
      'Tidak. Sistem kami menerapkan penguncian unit di level database (transaction locking) sehingga ketika satu pelanggan berhasil membuat reservasi, unit tersebut langsung terkunci dan tidak dapat dipesan ganda oleh pengguna lain.',
  },
  {
    id: 'faq-4',
    category: 'Legalitas',
    question: 'Apakah seluruh rumah sudah dilengkapi sertifikat SHM dan PBG?',
    answer:
      'Ya. Seluruh proyek yang dipasarkan di PERUMAHAN telah memiliki status lahan clear & clean dengan sertifikat induk terpecah menuju SHM (Sertifikat Hak Milik) dan PBG resmi dari pemerintah daerah setempat.',
  },
  {
    id: 'faq-5',
    category: 'Pembiayaan',
    question: 'Apakah tersedia skema pembiayaan KPR bank maupun cicilan bertahap?',
    answer:
      'Tersedia skema tunai keras, tunai bertahap hingga 24 bulan langsung ke developer, serta KPR bekerja sama dengan berbagai bank nasional dan syariah rekanan. Tim kami mendampingi proses pemberkasan hingga akad.',
  },
]

export const PROJECT_LOCATIONS = ['Semua Lokasi', 'BSD City', 'Sentul Selatan', 'Cibubur'] as const

export const PRICE_RANGES = [
  { label: 'Semua Harga', value: 'all' },
  { label: 'Di bawah Rp 1 M', value: 'under-1b' },
  { label: 'Rp 1 M – Rp 2 M', value: '1b-2b' },
  { label: 'Di atas Rp 2 M', value: 'above-2b' },
] as const

export function getProjectBySlug(slug: string): Project | undefined {
  return DEMO_PROJECTS.find((project) => project.slug === slug)
}

export function getHouseTypeBySlug(slug: string): HouseType | undefined {
  return DEMO_HOUSE_TYPES.find((house) => house.slug === slug)
}

export function getHouseTypesByProjectId(projectId: string): HouseType[] {
  return DEMO_HOUSE_TYPES.filter((house) => house.projectId === projectId)
}
