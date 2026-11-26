import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import {
  appendDemoActivityLog,
  crudService,
  loadDemoDb,
  saveDemoDb,
} from '@/services/crudStore'
import { supabase } from '@/supabase/client'
import { storageService } from '@/supabase/storage'
import type {
  HouseTypeRecord,
  PaymentAccountRecord,
  PaymentRecord,
  ProjectRecord,
  ReservationRecord,
  UnitRecord,
} from '@/types/database'
import type { UserRole } from '@/types/auth'

export interface EnrichedPayment extends PaymentRecord {
  reservationNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  projectName: string
  houseTypeName: string
  unitCode: string
  reservationStatus: ReservationRecord['status']
  targetBankName: string
  targetAccountNumber: string
  senderAccountNumber: string
}

export interface SubmitPaymentInput {
  reservationId: string
  paymentAccountId: string
  paymentDate: string
  senderBank: string
  senderName: string
  senderAccountNumber: string
  proofFile: File
  notes?: string
}

export const paymentService = {
  async listPayments(scopeCustomerId?: string): Promise<EnrichedPayment[]> {
    const [payments, reservations, accounts, projects, houseTypes, units] =
      await Promise.all([
        crudService.list<PaymentRecord>('payments'),
        crudService.list<ReservationRecord>('reservations'),
        crudService.list<PaymentAccountRecord>('payment_accounts').catch(() => []),
        crudService.list<ProjectRecord>('projects'),
        crudService.list<HouseTypeRecord>('house_types'),
        crudService.list<UnitRecord>('units'),
      ])

    const rsvMap = Object.fromEntries(reservations.map((r) => [r.id, r]))
    const accMap = Object.fromEntries(accounts.map((a) => [a.id, a]))
    const projMap = Object.fromEntries(projects.map((p) => [p.id, p]))
    const htMap = Object.fromEntries(houseTypes.map((h) => [h.id, h]))
    const unitMap = Object.fromEntries(units.map((u) => [u.id, u]))

    return payments
      .filter((p) => (!scopeCustomerId ? true : p.customer_id === scopeCustomerId))
      .map((p) => {
        const rsv = rsvMap[p.reservation_id]
        const acc = p.payment_account_id ? accMap[p.payment_account_id] : undefined
        const rawSenderAcc = (p as unknown as Record<string, unknown>).sender_account_number
        return {
          ...p,
          reservationNumber: rsv?.reservation_number ?? '—',
          customerName: rsv?.customer_name ?? 'Pelanggan',
          customerEmail: rsv?.customer_email ?? '',
          customerPhone: rsv?.customer_phone ?? '',
          projectName: rsv ? projMap[rsv.project_id]?.name ?? '—' : '—',
          houseTypeName: rsv ? htMap[rsv.house_type_id]?.name ?? '—' : '—',
          unitCode: rsv ? unitMap[rsv.unit_id]?.unit_code ?? '—' : '—',
          reservationStatus: rsv?.status ?? 'pending',
          targetBankName: acc?.bank_name ?? '—',
          targetAccountNumber: acc?.account_number ?? '—',
          senderAccountNumber: typeof rawSenderAcc === 'string' ? rawSenderAcc : '',
        }
      })
  },

  async listActiveAccounts(): Promise<PaymentAccountRecord[]> {
    const list = await crudService.list<PaymentAccountRecord>('payment_accounts')
    return list
      .filter((a) => a.is_active)
      .sort((a, b) => a.display_order - b.display_order)
  },

  /**
   * Mengunggah file bukti transfer ke Private Storage (`payment-proofs`)
   * lalu memanggil PostgreSQL RPC `submit_manual_payment`.
   */
  async submitPaymentProof(
    input: SubmitPaymentInput,
    userId: string,
  ): Promise<void> {
    // 1. Upload ke private bucket `payment-proofs` (<userId>/<reservationId>/...)
    const uploaded = await storageService.uploadPaymentProof(
      input.proofFile,
      userId,
      input.reservationId,
    )

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const isoPaymentDate = new Date(`${input.paymentDate}T12:00:00+07:00`).toISOString()
      const { error } = await supabase.rpc('submit_manual_payment', {
        p_reservation_id: input.reservationId,
        p_payment_account_id: input.paymentAccountId,
        p_payment_date: isoPaymentDate,
        p_sender_bank: input.senderBank.trim(),
        p_sender_name: input.senderName.trim(),
        p_sender_account_number: input.senderAccountNumber.trim(),
        p_proof_storage_path: uploaded.path,
        p_notes: input.notes?.trim() || null,
      })

      if (error) {
        throw new Error(error.message || 'Gagal mengirim bukti pembayaran.')
      }
      return
    }

    // Fallback Mode Demo
    await new Promise((resolve) => setTimeout(resolve, 350))
    const db = loadDemoDb()
    const rsv = db.reservations.find(
      (r) => r.id === input.reservationId && r.customer_id === userId,
    )
    if (!rsv) throw new Error('Reservasi tidak ditemukan.')

    const now = new Date().toISOString()
    let payment = db.payments.find((p) => p.reservation_id === rsv.id)
    if (!payment) {
      payment = {
        id: `pay-${Date.now()}`,
        reservation_id: rsv.id,
        customer_id: userId,
        payment_account_id: input.paymentAccountId,
        amount: rsv.booking_fee,
        payment_date: input.paymentDate,
        sender_bank: input.senderBank.trim(),
        sender_name: input.senderName.trim(),
        proof_storage_path: uploaded.path,
        status: 'pending_verification',
        verified_by: null,
        verified_at: null,
        rejection_reason: '',
        notes: input.notes?.trim() ?? '',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      }
      db.payments.unshift(payment)
    } else {
      payment.payment_account_id = input.paymentAccountId
      payment.payment_date = input.paymentDate
      payment.sender_bank = input.senderBank.trim()
      payment.sender_name = input.senderName.trim()
      payment.proof_storage_path = uploaded.path
      payment.status = 'pending_verification'
      payment.rejection_reason = ''
      payment.notes = input.notes?.trim() ?? ''
      payment.updated_at = now
    }

    rsv.status = 'awaiting_verification'
    rsv.updated_at = now

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: userId,
      type: 'payment_submitted',
      title: 'Bukti Pembayaran Diterima',
      message: `Bukti transfer untuk ${rsv.reservation_number} telah diunggah dan menunggu verifikasi administrator.`,
      reference_type: 'payment',
      reference_id: payment.id,
      is_read: false,
      read_at: null,
      created_at: now,
      updated_at: now,
    })

    appendDemoActivityLog(db, {
      actorId: userId,
      actorRole: 'customer',
      action: 'payment.submitted',
      entityType: 'payment',
      entityId: payment.id,
      summary: `Mengunggah bukti transfer untuk reservasi ${rsv.reservation_number}`,
    })

    saveDemoDb(db)
  },

  /**
   * Verifikasi atau Penolakan Pembayaran Manual oleh Administrator
   * melalui PostgreSQL RPC `verify_manual_payment`.
   */
  async verifyPayment(
    paymentId: string,
    decision: 'verified' | 'rejected',
    rejectionReason: string,
    notes: string,
    actor: { id: string; role: UserRole },
  ): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase.rpc('verify_manual_payment', {
        p_payment_id: paymentId,
        p_decision: decision,
        p_rejection_reason: decision === 'rejected' ? rejectionReason.trim() : null,
        p_notes: notes.trim() || null,
      })

      if (error) {
        throw new Error(error.message || 'Gagal memproses verifikasi pembayaran.')
      }
      return
    }

    // Fallback Mode Demo
    await new Promise((resolve) => setTimeout(resolve, 300))
    const db = loadDemoDb()
    const pay = db.payments.find((p) => p.id === paymentId)
    if (!pay) throw new Error('Data pembayaran tidak ditemukan.')
    const rsv = db.reservations.find((r) => r.id === pay.reservation_id)
    if (!rsv) throw new Error('Reservasi terkait tidak ditemukan.')

    const now = new Date().toISOString()
    pay.status = decision
    pay.verified_by = actor.id
    pay.verified_at = now
    pay.rejection_reason = decision === 'rejected' ? rejectionReason.trim() : ''
    if (notes.trim()) pay.notes = notes.trim()
    pay.updated_at = now

    if (decision === 'verified') {
      rsv.status = 'confirmed'
      rsv.confirmed_at = now
    } else {
      rsv.status = 'rejected'
      rsv.cancellation_reason = rejectionReason.trim()
      const unit = db.units.find((u) => u.id === rsv.unit_id)
      if (unit && unit.status === 'reserved') {
        unit.status = 'available'
      }
    }
    rsv.updated_at = now

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: rsv.customer_id,
      type: decision === 'verified' ? 'payment_verified' : 'payment_rejected',
      title:
        decision === 'verified'
          ? 'Pembayaran Terverifikasi'
          : 'Bukti Pembayaran Ditolak',
      message:
        decision === 'verified'
          ? `Pembayaran untuk ${rsv.reservation_number} telah diverifikasi dan reservasi Anda dikonfirmasi.`
          : `Pembayaran ${rsv.reservation_number} ditolak. Alasan: ${rejectionReason.trim()}`,
      reference_type: 'payment',
      reference_id: pay.id,
      is_read: false,
      read_at: null,
      created_at: now,
      updated_at: now,
    })

    appendDemoActivityLog(db, {
      actorId: actor.id,
      actorRole: actor.role,
      action: `payment.${decision}`,
      entityType: 'payment',
      entityId: pay.id,
      summary: `Verifikasi pembayaran ${rsv.reservation_number} -> ${decision}`,
    })

    saveDemoDb(db)
  },

  async resolveProofUrl(storagePath: string): Promise<string> {
    if (!storagePath) return ''
    return storageService.getSignedPaymentProofUrl(storagePath, 600)
  },
}
