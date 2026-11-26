export type UserRole = 'customer' | 'sales' | 'admin' | 'super_admin'

export const STAFF_ROLES: readonly UserRole[] = ['sales', 'admin', 'super_admin']

export interface UserProfile {
  id: string
  email: string
  fullName: string
  phone: string
  nik: string
  address: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RegisterInput {
  fullName: string
  email: string
  phone: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface UpdateProfileInput {
  fullName: string
  phone: string
  nik: string
  address: string
}

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role)
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Administrator'
    case 'admin':
      return 'Administrator'
    case 'sales':
      return 'Sales Advisor'
    case 'customer':
    default:
      return 'Pelanggan'
  }
}

export function getDefaultRouteForRole(role: UserRole): string {
  return isStaffRole(role) ? '/admin' : '/dashboard'
}
