import { Api, type Errors } from '@/services/api'
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
const CurrenciesSchema = z.array(CurrencySchema).nonempty()

// DTO курса выбранной пары валют
const ExchangeRateSchema = z.object({
  date: z.iso.date(),
  base: z.string().length(3),
  quote: z.string().length(3),
  rate: z.number().positive()
})

export type Currency = z.infer<typeof CurrencySchema>
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>

const CURRENCIES_ERRORS: Errors = {
  default: 'Не удалось загрузить список валют. Попробуйте позже',
  network: 'Не удалось подключиться к сервису валют. Проверьте интернет',
  response: 'Сервис вернул некорректный список валют',
  429: 'Слишком много запросов. Попробуйте позже',
  504: 'Сервис валют не ответил вовремя. Попробуйте позже'
}

const EXCHANGE_RATE_ERRORS: Errors = {
  default: 'Не удалось получить курс валют. Попробуйте позже',
  network: 'Не удалось подключиться к сервису валют. Проверьте интернет',
  response: 'Сервис вернул некорректный курс валют',
  404: 'Курс для выбранных валют не найден',
  422: 'Выбранная валюта не поддерживается сервисом',
  429: 'Слишком много запросов. Попробуйте позже',
  504: 'Сервис валют не ответил вовремя. Попробуйте позже'
}

// Получение списка валют
export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await Api.fetchGet('/currencies', CURRENCIES_ERRORS, true)
    return await Api.parseResponse(response, CurrenciesSchema)
  }
  catch (error) {
    Api.throwResponseError(error, CURRENCIES_ERRORS, true)
  }
}

// Получение курса из одной валюты в другую
export async function getExchangeRate(fromCurrency: Currency, inCurrency: Currency): Promise<ExchangeRate> {
  try {
    const fromCode = fromCurrency.code.toLowerCase()
    const inCode = inCurrency.code.toLowerCase()
    const response = await Api.fetchGet(`/rate/${fromCode}/${inCode}`, EXCHANGE_RATE_ERRORS, true)
    return await Api.parseResponse(response, ExchangeRateSchema)
  }
  catch (error) {
    Api.throwResponseError(error, EXCHANGE_RATE_ERRORS, true)
  }
}
