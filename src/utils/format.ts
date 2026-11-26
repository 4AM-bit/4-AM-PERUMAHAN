export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactPrice(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billions = amount / 1_000_000_000
    const formatted = Number.isInteger(billions)
      ? billions.toString()
      : billions.toFixed(2).replace(/\.?0+$/, '').replace('.', ',')
    return `Rp ${formatted} M`
  }
  if (amount >= 1_000_000) {
    const millions = Math.round(amount / 1_000_000)
    return `Rp ${millions} Jt`
  }
  return formatCurrency(amount)
}

export function formatArea(squareMeters: number): string {
  return `${squareMeters} m²`
}
