export function formatNumber(number: number): string {
  return number.toLocaleString('en-us', {
    style: 'decimal',
    minimumFractionDigits: 2,
    currency: 'USD',
  })
}

export function formatEUSD(eUSDAmount: number): string {
  console.log(eUSDAmount, eUSDAmount / 10 ** 6)
  return formatNumber(eUSDAmount / 10 ** 6)
}
