import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { HomePage } from '@/pages/public/HomePage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { GuestRoute } from '@/routes/GuestRoute'
import { STAFF_ROLES } from '@/types/auth'

// Code-split secondary public, auth, customer, and admin portals for optimal initial bundle size
const ProjectsPage = lazy(() =>
  import('@/pages/public/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  import('@/pages/public/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const CatalogPage = lazy(() =>
  import('@/pages/public/CatalogPage').then((m) => ({ default: m.CatalogPage })),
)
const HouseDetailPage = lazy(() =>
  import('@/pages/public/HouseDetailPage').then((m) => ({ default: m.HouseDetailPage })),
)
const ContactPage = lazy(() =>
  import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })),
)

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const AdminLoginPage = lazy(() =>
  import('@/pages/auth/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/auth/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/auth/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)

const CustomerShellLayout = lazy(() =>
  import('@/pages/customer/CustomerShellLayout').then((m) => ({ default: m.CustomerShellLayout })),
)
const CustomerOverviewPage = lazy(() =>
  import('@/pages/customer/CustomerOverviewPage').then((m) => ({ default: m.CustomerOverviewPage })),
)
const CustomerReservationsPage = lazy(() =>
  import('@/pages/customer/CustomerReservationsPage').then((m) => ({ default: m.CustomerReservationsPage })),
)
const NewReservationPage = lazy(() =>
  import('@/pages/customer/NewReservationPage').then((m) => ({ default: m.NewReservationPage })),
)
const CustomerPaymentsPage = lazy(() =>
  import('@/pages/customer/CustomerPaymentsPage').then((m) => ({ default: m.CustomerPaymentsPage })),
)
const CustomerNotificationsPage = lazy(() =>
  import('@/pages/customer/CustomerNotificationsPage').then((m) => ({ default: m.CustomerNotificationsPage })),
)

const AdminShellLayout = lazy(() =>
  import('@/pages/admin/AdminShellLayout').then((m) => ({ default: m.AdminShellLayout })),
)
const AdminOverviewPage = lazy(() =>
  import('@/pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })),
)
const AdminPaymentVerificationPage = lazy(() =>
  import('@/pages/admin/AdminPaymentVerificationPage').then((m) => ({ default: m.AdminPaymentVerificationPage })),
)
const AdminActivityLogsPage = lazy(() =>
  import('@/pages/admin/AdminActivityLogsPage').then((m) => ({ default: m.AdminActivityLogsPage })),
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
)
const AdminReportsPage = lazy(() =>
  import('@/pages/admin/AdminReportsPage').then((m) => ({ default: m.AdminReportsPage })),
)
const AdminProjectsPage = lazy(() =>
  import('@/pages/admin/crud/AdminProjectsPage').then((m) => ({ default: m.AdminProjectsPage })),
)
const AdminHouseTypesPage = lazy(() =>
  import('@/pages/admin/crud/AdminHouseTypesPage').then((m) => ({ default: m.AdminHouseTypesPage })),
)
const AdminUnitsPage = lazy(() =>
  import('@/pages/admin/crud/AdminUnitsPage').then((m) => ({ default: m.AdminUnitsPage })),
)
const AdminCustomersPage = lazy(() =>
  import('@/pages/admin/crud/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })),
)
const AdminReservationsPage = lazy(() =>
  import('@/pages/admin/crud/AdminReservationsPage').then((m) => ({ default: m.AdminReservationsPage })),
)
const AdminPaymentAccountsPage = lazy(() =>
  import('@/pages/admin/crud/AdminPaymentAccountsPage').then((m) => ({ default: m.AdminPaymentAccountsPage })),
)
const AdminBannersPage = lazy(() =>
  import('@/pages/admin/crud/AdminBannersPage').then((m) => ({ default: m.AdminBannersPage })),
)
const AdminGalleriesPage = lazy(() =>
  import('@/pages/admin/crud/AdminGalleriesPage').then((m) => ({ default: m.AdminGalleriesPage })),
)
const AdminFacilitiesPage = lazy(() =>
  import('@/pages/admin/crud/AdminFacilitiesPage').then((m) => ({ default: m.AdminFacilitiesPage })),
)
const AdminAdministratorsPage = lazy(() =>
  import('@/pages/admin/crud/AdminAdministratorsPage').then((m) => ({ default: m.AdminAdministratorsPage })),
)

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#F5F4EF]">
      <Loader2 className="h-8 w-8 animate-spin text-[#173F35]" />
      <p className="text-xs font-medium text-[#5F6B66]">Memuat halaman...</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Dedicated Admin Login Route */}
        <Route element={<GuestRoute />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Public & Customer Auth Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/proyek" element={<ProjectsPage />} />
          <Route path="/proyek/:slug" element={<ProjectDetailPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/rumah/:slug" element={<HouseDetailPage />} />
          <Route path="/kontak" element={<ContactPage />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Protected Customer Portal */}
        <Route
          element={<ProtectedRoute allowedRoles={['customer']} loginPath="/login" />}
        >
          <Route path="/dashboard" element={<CustomerShellLayout />}>
            <Route index element={<CustomerOverviewPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="reservasi" element={<CustomerReservationsPage />} />
            <Route path="reservasi/baru" element={<NewReservationPage />} />
            <Route path="pembayaran" element={<CustomerPaymentsPage />} />
            <Route path="notifikasi" element={<CustomerNotificationsPage />} />
          </Route>
        </Route>

        {/* Protected Admin / Sales / Super Admin Portal */}
        <Route
          element={
            <ProtectedRoute allowedRoles={STAFF_ROLES} loginPath="/admin/login" />
          }
        >
          <Route path="/admin" element={<AdminShellLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="profil" element={<ProfilePage />} />

            {/* Accessible by Sales, Admin, Super Admin */}
            <Route path="unit" element={<AdminUnitsPage />} />
            <Route path="pelanggan" element={<AdminCustomersPage />} />
            <Route path="reservasi" element={<AdminReservationsPage />} />

            {/* Accessible by Admin & Super Admin */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['admin', 'super_admin']}
                  loginPath="/admin/login"
                />
              }
            >
              <Route path="proyek" element={<AdminProjectsPage />} />
              <Route path="tipe-rumah" element={<AdminHouseTypesPage />} />
              <Route path="pembayaran" element={<AdminPaymentVerificationPage />} />
              <Route path="rekening" element={<AdminPaymentAccountsPage />} />
              <Route path="banner" element={<AdminBannersPage />} />
              <Route path="galeri" element={<AdminGalleriesPage />} />
              <Route path="fasilitas" element={<AdminFacilitiesPage />} />
              <Route path="laporan" element={<AdminReportsPage />} />
              <Route path="logs" element={<AdminActivityLogsPage />} />
            </Route>

            {/* Accessible strictly by Super Admin */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['super_admin']}
                  loginPath="/admin/login"
                />
              }
            >
              <Route path="administrator" element={<AdminAdministratorsPage />} />
              <Route path="pengaturan" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
