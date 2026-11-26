import { crudService } from '@/services/crudStore'
import { paymentService, type EnrichedPayment } from '@/services/paymentService'
import type {
  HouseTypeRecord,
  ProfileRecord,
  ProjectRecord,
  ReservationRecord,
  UnitRecord,
} from '@/types/database'

export type ReportType =
  | 'reservations'
  | 'payments'
  | 'sales'
  | 'available_units'
  | 'customers'

export interface ReportFilter {
  projectId: string
  startDate: string
  endDate: string
}

export interface ReportDataset {
  projects: ProjectRecord[]
  houseTypes: HouseTypeRecord[]
  units: UnitRecord[]
  reservations: ReservationRecord[]
  payments: EnrichedPayment[]
  customers: ProfileRecord[]
}

export function isWithinDateRange(
  isoDate: string | null | undefined,
  startDate: string,
  endDate: string,
): boolean {
  if (!startDate && !endDate) return true
  if (!isoDate) return false
  const day = isoDate.slice(0, 10)
  if (startDate && day < startDate) return false
  if (endDate && day > endDate) return false
  return true
}

export const reportService = {
  async loadDataset(): Promise<ReportDataset> {
    const [projects, houseTypes, units, reservations, payments, profiles] =
      await Promise.all([
        crudService.list<ProjectRecord>('projects'),
        crudService.list<HouseTypeRecord>('house_types'),
        crudService.list<UnitRecord>('units'),
        crudService.list<ReservationRecord>('reservations').catch(() => []),
        paymentService.listPayments().catch(() => []),
        crudService.list<ProfileRecord>('profiles').catch(() => []),
      ])

    return {
      projects,
      houseTypes,
      units,
      reservations,
      payments,
      customers: profiles.filter((p) => p.role === 'customer'),
    }
  },
}
