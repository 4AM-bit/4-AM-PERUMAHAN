/**
 * Mengekspor array data menjadi file CSV dengan UTF-8 BOM
 * agar tampil rapi di Microsoft Excel, sekaligus mencegah CSV Formula Injection.
 */
function sanitizeCsvCell(value: unknown): string {
  let str = value === null || value === undefined ? '' : String(value)
  // Cegah spreadsheet formula injection (=, +, -, @ di awal sel)
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`
  }
  const escaped = str.replace(/"/g, '""')
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<unknown>>,
): void {
  const csvLines = [
    headers.map(sanitizeCsvCell).join(','),
    ...rows.map((row) => row.map(sanitizeCsvCell).join(',')),
  ]
  const csvContent = `\uFEFF${csvLines.join('\r\n')}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
