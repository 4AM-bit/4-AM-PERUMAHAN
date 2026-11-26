-- ============================================================================
-- PERUMAHAN — Migration 0005: Initial App Settings & Sample Developer Accounts
-- Opsional: jalankan pada proyek Supabase baru agar data awal langsung siap
-- ============================================================================

INSERT INTO public.app_settings (key, value, description)
VALUES
  (
    'reservation_expiry_hours',
    '{"hours": 24}'::jsonb,
    'Masa berlaku default penguncian unit sementara sebelum bukti transfer diunggah (jam).'
  ),
  (
    'developer_contact',
    '{
      "brandName": "PERUMAHAN",
      "legalName": "PT Perumahan Nusantara Properti",
      "phone": "+62 21 5088 9400",
      "whatsapp": "6281294008800",
      "email": "halo@perumahan.co.id",
      "officeAddress": "Marketing Gallery PERUMAHAN, Jl. Boulevard Hijau Kav. 18, BSD City, Tangerang Selatan 15345"
    }'::jsonb,
    'Informasi kontak resmi developer yang ditampilkan pada website publik.'
  )
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.payment_accounts (bank_name, account_number, account_holder, branch, instructions, display_order)
SELECT * FROM (
  VALUES
    (
      'Bank Central Asia (BCA)',
      '6880452190',
      'PT Perumahan Nusantara Properti',
      'KCU BSD City',
      'Cantumkan nomor reservasi (contoh: RSV-20261126-1001) pada berita transfer.',
      1
    ),
    (
      'Bank Mandiri',
      '1280009451120',
      'PT Perumahan Nusantara Properti',
      'KC Tangerang Selatan',
      'Transfer sesuai nominal tepat hingga digit terakhir dan unggah struk pada portal pelanggan.',
      2
    ),
    (
      'Bank Syariah Indonesia (BSI)',
      '7198450023',
      'PT Perumahan Nusantara Properti',
      'KC Serpong',
      'Tersedia untuk transaksi pembiayaan syariah maupun tunai bertahap.',
      3
    )
) AS seed_accounts(bank_name, account_number, account_holder, branch, instructions, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts LIMIT 1);
