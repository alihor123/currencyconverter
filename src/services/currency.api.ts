import { Api, type Errors } from '@/services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
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

// DTO списка валют в кэше, где поля уже преобразованы для селектора
const CachedCurrenciesSchema = z.array(z.object({
  code: z.string().length(3),
  name: z.string().length(3),
  description: z.string().min(1),
  symbol: z.string().nullable()
})).nonempty()

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


async function getCachedData<T>(key: string, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key)

    if (data === null) return null
    return schema.parse(JSON.parse(data))
  }
  catch {
    return null
  }
}

// Сохранение успешного ответа API в кэш
async function saveCachedData(key: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data))
  }
  catch {
  }
}

// Получение списка валют
export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await Api.fetchGet('/currencies', CURRENCIES_ERRORS, true)
    const data = await Api.parseResponse(response, CurrenciesSchema)
    await saveCachedData('currency:currencies', data)
    return data
  }
  catch (error) {
    const cachedData = await getCachedData('currency:currencies', CachedCurrenciesSchema)

    if (cachedData) {
      return cachedData
    }

    Api.throwResponseError(error, CURRENCIES_ERRORS, true)
  }
}

// Получение курса из одной валюты в другую
export async function getExchangeRate(fromCurrency: Currency, inCurrency: Currency): Promise<ExchangeRate> {
  const fromCode = fromCurrency.code.toLowerCase()
  const inCode = inCurrency.code.toLowerCase()
  const cacheKey = `currency:rate:${fromCode}:${inCode}`

  try {
    const response = await Api.fetchGet(`/rate/${fromCode}/${inCode}`, EXCHANGE_RATE_ERRORS, true)
    const data = await Api.parseResponse(response, ExchangeRateSchema)
    await saveCachedData(cacheKey, data)
    return data
  }
  catch (error) {
    const cachedData = await getCachedData(cacheKey, ExchangeRateSchema)

    if (cachedData &&
      cachedData.base.toLowerCase() === fromCode &&
      cachedData.quote.toLowerCase() === inCode) {
      return cachedData
    }

    Api.throwResponseError(error, EXCHANGE_RATE_ERRORS, true)
  }
}
