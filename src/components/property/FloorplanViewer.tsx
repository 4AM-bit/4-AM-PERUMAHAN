import { useState } from 'react'
import { Compass, Layers } from 'lucide-react'
import type { FloorplanFloor, FloorplanRoom } from '@/types/property'
import { cn } from '@/utils/cn'

interface FloorplanViewerProps {
  floorplans: FloorplanFloor[]
  houseName: string
}

const toneStyles: Record<
  FloorplanRoom['tone'],
  { fill: string; stroke: string; text: string; badge: string; label: string }
> = {
  living: {
    fill: '#F5F4EF',
    stroke: '#173F35',
    text: '#173F35',
    badge: 'bg-[#F5F4EF] border-[#173F35]/40',
    label: 'Area Sosial',
  },
  bedroom: {
    fill: '#EFE3C6',
    stroke: '#B5924C',
    text: '#173F35',
    badge: 'bg-[#EFE3C6] border-[#B5924C]/50',
    label: 'Kamar Tidur',
  },
  service: {
    fill: '#E5ECE9',
    stroke: '#285C49',
    text: '#173F35',
    badge: 'bg-[#E5ECE9] border-[#285C49]/40',
    label: 'Dapur & Sanitair',
  },
  outdoor: {
    fill: '#DCE8E2',
    stroke: '#285C49',
    text: '#173F35',
    badge: 'bg-[#DCE8E2] border-[#285C49]/40',
    label: 'Taman & Carport',
  },
  circulation: {
    fill: '#ECEAE1',
    stroke: '#8B948F',
    text: '#242B28',
    badge: 'bg-[#ECEAE1] border-[#8B948F]/40',
    label: 'Sirkulasi / Tangga',
  },
}

export function FloorplanViewer({ floorplans, houseName }: FloorplanViewerProps) {
  const [activeLevel, setActiveLevel] = useState(floorplans[0]?.level ?? 1)
  const currentFloor =
    floorplans.find((floor) => floor.level === activeLevel) ?? floorplans[0]

  if (!currentFloor) return null

  return (
    <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E3E0D6]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Denah Arsitektur
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-[#173F35]">
            Tata Ruang {houseName}
          </h3>
          <p className="mt-1 text-xs text-[#5F6B66]">{currentFloor.areaLabel}</p>
        </div>

        {floorplans.length > 1 && (
          <div className="inline-flex rounded-xl bg-[#F5F4EF] p-1 border border-[#E3E0D6]">
            {floorplans.map((floor) => (
              <button
                key={floor.level}
                type="button"
                onClick={() => setActiveLevel(floor.level)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer',
                  activeLevel === floor.level
                    ? 'bg-[#173F35] text-white shadow-xs'
                    : 'text-[#5F6B66] hover:text-[#173F35]',
                )}
              >
                <Layers className="h-3.5 w-3.5" />
                Lantai {floor.level}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-[#FAF9F5] p-4 sm:p-6">
          <div className="flex items-center justify-between text-[11px] font-medium text-[#5F6B66] mb-3">
            <span>{currentFloor.title}</span>
            <span className="inline-flex items-center gap-1 text-[#173F35]">
              <Compass className="h-3.5 w-3.5 text-[#D8B978]" />
              Skala Ilustratif (m)
            </span>
          </div>

          <svg
            viewBox="0 0 400 410"
            className="w-full h-auto max-h-[420px]"
            role="img"
            aria-label={`Denah ${currentFloor.title} ${houseName}`}
          >
            {/* Outer blueprint frame */}
            <rect
              x="12"
              y="12"
              width="376"
              height="386"
              rx="10"
              fill="#FFFFFF"
              stroke="#173F35"
              strokeWidth="2.5"
            />

            {currentFloor.rooms.map((room) => {
              const style = toneStyles[room.tone]
              return (
                <g key={room.id}>
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    rx="6"
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth="1.5"
                  />
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 - 4}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize="10.5"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {room.name}
                  </text>
                  <text
                    x={room.x + room.w / 2}
                    y={room.y + room.h / 2 + 11}
                    textAnchor="middle"
                    fill="#5F6B66"
                    fontSize="9"
                    fontFamily="Inter, sans-serif"
                  >
                    {room.dimensions}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#285C49] mb-3">
              Rincian Dimensi Ruang ({currentFloor.title})
            </p>
            <ul className="divide-y divide-[#E3E0D6]/70 rounded-xl border border-[#E3E0D6] bg-[#FAF9F5]">
              {currentFloor.rooms.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
                >
                  <span className="font-medium text-[#242B28]">{room.name}</span>
                  <span className="font-semibold text-[#173F35] tabular-nums">
                    {room.dimensions}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6B66] mb-2">
              Legenda Zona Ruang
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.values(toneStyles).map((tone) => (
                <span
                  key={tone.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E0D6] bg-white px-2.5 py-1 text-[11px] text-[#5F6B66]"
                >
                  <span className={cn('h-2.5 w-2.5 rounded-xs border', tone.badge)} />
                  {tone.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
