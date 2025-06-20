export const CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar", code: "USD" },
  IQD: { symbol: "د.ع", name: "Iraqi Dinar", code: "IQD" },
} as const

export type Currency = keyof typeof CURRENCIES

export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = CURRENCIES[currency]

  if (currency === "IQD") {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currencyInfo.symbol}`
  }

  return `${currencyInfo.symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0
}
