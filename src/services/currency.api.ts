import { Api } from '@/services/api'
import { z } from 'zod'

// DTO валюты + преобразование полей для селектора
const CurrencySchema = z.object({
  iso_code: z.string().length(3),
  name: z.string().min(1),
  symbol: z.string().nullable()
}).transform((currency) => ({
  code: currency.iso_code,
  name: currency.iso_code,
  description: currency.name,
  symbol: currency.symbol
}))

// DTO списка валют
const CurrenciesSchema = z.array(CurrencySchema)

// DTO курса выбранной пары валют
const ExchangeRateSchema = z.object({
  date: z.iso.date(),
  base: z.string().length(3),
  quote: z.string().length(3),
  rate: z.number().positive()
})

export type Currency = z.infer<typeof CurrencySchema>
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>

// Получение списка валют
export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await Api.fetchGet('/currencies')
    return await Api.parseResponse(response, CurrenciesSchema)
  }
  catch (error) {
    Api.throwResponseError(error)
  }
}

// Получение курса из одной валюты в другую
export async function getExchangeRate(fromCurrency: Currency, inCurrency: Currency): Promise<ExchangeRate> {
  try {
    const fromCode = fromCurrency.code.toLowerCase()
    const inCode = inCurrency.code.toLowerCase()
    const response = await Api.fetchGet(`/rate/${fromCode}/${inCode}`)
    return await Api.parseResponse(response, ExchangeRateSchema)
  }
  catch (error) {
    Api.throwResponseError(error)
  }
}
