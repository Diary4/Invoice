export const CURRENCIES = {
  USD: { symbol: "$", name: "US Dollar", code: "USD" },
  IQD: { symbol: "د.ع", name: "Iraqi Dinar", code: "IQD" },
} as const

export type Currency = keyof typeof CURRENCIES

export function formatCurrency(amount: number, currency: Currency): string {
  const currencyInfo = CURRENCIES[currency]

  if (currency === "IQD") {
    // Format IQD without decimals and with proper thousand separators
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} ${currencyInfo.symbol}`
  }

  // Format USD with 2 decimal places
  return `${currencyInfo.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatCurrencyForPDF(amount: number, currency: Currency): string {
  // PDF formatter that uses Latin characters for better compatibility with jsPDF
  if (currency === "IQD") {
    // Format IQD without decimals and use "IQD" instead of Arabic symbol
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} IQD`
  }

  // Format USD with 2 decimal places
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function parseCurrency(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0
}

export function getExchangeRate(from: Currency, to: Currency): number {
  // Simple exchange rates - in a real app, you'd fetch from an API
  const rates = {
    USD_TO_IQD: 1310, // 1 USD = 1310 IQD (approximate)
    IQD_TO_USD: 1 / 1310,
  }

  if (from === to) return 1
  if (from === "USD" && to === "IQD") return rates.USD_TO_IQD
  if (from === "IQD" && to === "USD") return rates.IQD_TO_USD

  return 1
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const rate = getExchangeRate(from, to)
  return amount * rate
}
