import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { HomePage } from '@/pages/public/HomePage'
import { ProjectsPage } from '@/pages/public/ProjectsPage'
import { ProjectDetailPage } from '@/pages/public/ProjectDetailPage'
import { CatalogPage } from '@/pages/public/CatalogPage'
import { HouseDetailPage } from '@/pages/public/HouseDetailPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { PhasePlaceholderPage } from '@/pages/public/PhasePlaceholderPage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminLoginPage } from '@/pages/auth/AdminLoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { UnauthorizedPage } from '@/pages/auth/UnauthorizedPage'
import { ProfilePage } from '@/pages/auth/ProfilePage'
import { CustomerShellLayout } from '@/pages/customer/CustomerShellLayout'
import { CustomerOverviewPage } from '@/pages/customer/CustomerOverviewPage'
import { CustomerReservationsPage } from '@/pages/customer/CustomerReservationsPage'
import { NewReservationPage } from '@/pages/customer/NewReservationPage'
import { CustomerPaymentsPage } from '@/pages/customer/CustomerPaymentsPage'
import { AdminShellLayout } from '@/pages/admin/AdminShellLayout'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminPaymentVerificationPage } from '@/pages/admin/AdminPaymentVerificationPage'
import { AdminProjectsPage } from '@/pages/admin/crud/AdminProjectsPage'
import { AdminHouseTypesPage } from '@/pages/admin/crud/AdminHouseTypesPage'
import { AdminUnitsPage } from '@/pages/admin/crud/AdminUnitsPage'
import { AdminCustomersPage } from '@/pages/admin/crud/AdminCustomersPage'
import { AdminReservationsPage } from '@/pages/admin/crud/AdminReservationsPage'
import { AdminPaymentAccountsPage } from '@/pages/admin/crud/AdminPaymentAccountsPage'
import { AdminBannersPage } from '@/pages/admin/crud/AdminBannersPage'
import { AdminGalleriesPage } from '@/pages/admin/crud/AdminGalleriesPage'
import { AdminFacilitiesPage } from '@/pages/admin/crud/AdminFacilitiesPage'
import { AdminAdministratorsPage } from '@/pages/admin/crud/AdminAdministratorsPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { GuestRoute } from '@/routes/GuestRoute'
import { STAFF_ROLES } from '@/types/auth'

export function AppRoutes() {
  return (
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
          <Route
            path="notifikasi"
            element={
              <PhasePlaceholderPage
                title="Notifikasi Pelanggan"
                phase="Dijadwalkan pada Phase 9"
                description="Notifikasi status reservasi, pengingat kedaluwarsa, dan hasil verifikasi pembayaran akan dibangun pada Phase 9."
              />
            }
          />
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
            <Route
              path="laporan"
              element={
                <PhasePlaceholderPage
                  title="Laporan & Ekspor CSV"
                  phase="Dijadwalkan pada Phase 9"
                  description="Laporan reservasi, pembayaran, penjualan, unit tersedia, dan pelanggan dengan filter periode serta ekspor CSV akan dibangun pada Phase 9."
                />
              }
            />
            <Route
              path="logs"
              element={
                <PhasePlaceholderPage
                  title="Activity Logs"
                  phase="Dijadwalkan pada Phase 8 & Phase 9"
                  description="Riwayat audit seluruh aktivitas administrator dan transaksi akan ditampilkan pada Phase 8."
                />
              }
            />
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
            <Route
              path="pengaturan"
              element={
                <PhasePlaceholderPage
                  title="Pengaturan Sistem"
                  phase="Dijadwalkan pada Phase 8"
                  description="Konfigurasi masa berlaku reservasi dan profil developer akan dibangun pada Phase 8."
                />
              }
            />
          </Route>
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
