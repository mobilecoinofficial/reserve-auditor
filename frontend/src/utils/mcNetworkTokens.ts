export function formatNumber(number: number): string {
  return number.toLocaleString('en-us', {
    style: 'decimal',
    minimumFractionDigits: 2,
    currency: 'USD',
  })
}

export function formatEUSD(eUSDAmount: number): string {
  return formatNumber(eUSDAmount / 10 ** 6)
}
