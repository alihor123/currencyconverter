import { wait } from '@/helpers/wait'
import { FetchError } from 'expo/src/winter/fetch/FetchErrors'
import { ZodError, type ZodType } from 'zod'

type ErrorCode =
  | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409
  | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421
  | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 500
  | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511

export type Errors = Partial<Record<ErrorCode, string>> & {
  default?: string
  network?: string
  response?: string
}

// класс обертка для кастомных апи ошибок
export class ApiError extends Error {
  status?: number | 'network'

  constructor(message: string, status?: number | 'network') {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

//обертка над fetch для удобного управления запросами
export class Api {
  private static readonly baseUrl = process.env.EXPO_PUBLIC_API_URL

  private static readonly defaultErrors: Errors = {
    default: 'Не удалось выполнить запрос. Попробуйте позже',
    network: 'Не удалось связаться с сервером. Проверьте соединение с интернетом или попробуйте позже',
    response: 'Не удалось обработать ответ сервера. Попробуйте позже',
    400: 'Не удалось выполнить запрос. Проверьте данные и попробуйте снова',
    401: 'Необходимо повторно войти в систему',
    403: 'Недостаточно прав для выполнения этого действия',
    404: 'Запрошенные данные не найдены',
    409: 'Данные уже изменились или конфликтуют с текущим состоянием',
    413: 'Объем отправляемых данных слишком большой',
    422: 'Не удалось обработать отправленные данные',
    429: 'Слишком много запросов. Попробуйте немного позже',
    500: 'На сервере произошла ошибка. Попробуйте позже',
    503: 'Сервис временно недоступен. Попробуйте позже',
    504: 'Сервер не ответил вовремя. Попробуйте позже'
  }

  // Выбираем сообщение по статусу. Сообщения конкретного запроса дополняют стандартные,
  // а при errorsReplace полностью заменяют их.
  private static getErrorMessage(
    status: number | 'network' | 'response',
    errors: Errors = {},
    errorsReplace: boolean = false
  ): string {
    const errorMessages = errorsReplace ? errors : { ...Api.defaultErrors, ...errors }
    return errorMessages[status as keyof Errors] ?? errorMessages.default ?? Api.defaultErrors.default!
  }

  //Создание заголовка для запроса
  private static getHeaders(requestType: 'json' | 'file' = 'json'): Record<string, string> {
    const headers: Record<string, string> = {}

    if (requestType === 'json') {
      headers['Content-Type'] = 'application/json'
    }

    return headers
  }

  private static readonly maxRetries = 4
  private static readonly retryDelay = 1500
  private static readonly requestTimeout = 15000
  private static readonly slowRequestTimeout = 30000

  // Общая обертка запросов, ретраи, таймаут
  private static async request(
    path: string,
    init: RequestInit,
    errors: Errors = {},
    errorsReplace: boolean = false,
    requestType: 'json' | 'file' = 'json'
  ): Promise<Response> {

    if (!Api.baseUrl) {
      throw new ApiError('Не задан адрес API в EXPO_PUBLIC_API_URL')
    }

    const url = `${Api.baseUrl}${path}`
    const method = init.method ?? 'GET'

    // больше временя для POST и PATHС
    const timeout = method === 'POST' || method === 'PATCH' ? Api.slowRequestTimeout : Api.requestTimeout

    // Обертка для цикличного запроса
    async function doFetch(controller: AbortController) {
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        return await fetch(url, {
          ...init,
          headers: Api.getHeaders(requestType),
          signal: controller.signal
        })
      }
      finally {
        clearTimeout(timeoutId)
      }
    }

    //Защита от дублирования данных
    const retries =
      method === 'GET' ? Api.maxRetries :
      method === 'PUT' || method === 'DELETE' ? 1 :
      0

    //Задержка для имитации долгого ответа сервера
    const requestDelay = Number(process.env.EXPO_PUBLIC_API_DELAY_MS) || 0
    if (requestDelay > 0) {
      await wait(requestDelay)
    }

    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController()

      try {
        const response = await doFetch(controller)

        if (!response.ok) {
          throw new ApiError(Api.getErrorMessage(response.status, errors, errorsReplace), response.status)
        }

        return response
      }
      catch (error) {
        const isTimeout = controller.signal.aborted
        const isNetwork = error instanceof TypeError || error instanceof FetchError
        const isServerError = error instanceof ApiError && Number(error.status) >= 500

        // Повторяем при ошибке сети, таймауте или 5xx
        if (attempt < retries && (isNetwork || isTimeout || isServerError)) {
          await wait(Api.retryDelay * (attempt + 1))
          continue
        }

        
        if (isTimeout) {
          throw new ApiError(Api.getErrorMessage(504, errors, errorsReplace), 504)
        }

        if (isNetwork) {
          throw new ApiError(Api.getErrorMessage('network', errors, errorsReplace), 'network')
        }

        throw error
      }
    }
  }

  
  static async fetchGet(
    path: string,
    errors: Errors = {},
    errorsReplace: boolean = false
  ): Promise<Response> {
    return Api.request(path, { method: 'GET' }, errors, errorsReplace)
  }


  static async fetchPost(
    path: string,
    body: unknown,
    errors: Errors = {},
    errorsReplace: boolean = false
  ): Promise<Response> {
    return Api.request(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body)
      },
      errors,
      errorsReplace
    )
  }


  static async fetchPostFile(
    path: string,
    body: FormData,
    errors: Errors = {},
    errorsReplace: boolean = false
  ): Promise<Response> {
    return Api.request(
      path,
      {
        method: 'POST',
        body
      },
      errors,
      errorsReplace,
      'file'
    )
  }

 
  static async fetchDelete(
    path: string,
    errors: Errors = {},
    errorsReplace: boolean = false
  ): Promise<Response> {
    return Api.request(path, { method: 'DELETE' }, errors, errorsReplace)
  }


  static async fetchPut(
    path: string,
    body: unknown,
    errors: Errors = {},
    errorsReplace: boolean = false
  ): Promise<Response> {
    return Api.request(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(body)
      },
      errors,
      errorsReplace
    )
  }


  static async fetchPatch(
    path: string,
    body: unknown,
    errors: Errors = {},
    errorsReplace: boolean = false
  ): Promise<Response> {
    return Api.request(
      path,
      {
        method: 'PATCH',
        body: JSON.stringify(body)
      },
      errors,
      errorsReplace
    )
  }

  // Чтение данных и проверка при помощи DTO
  static async parseResponse<T>(response: Response, schema: ZodType<T>): Promise<T> {
    const data = await response.json()
    return schema.parse(data)
  }

  // Фильтрация ошибок. При DTO ошибке сообщение по умолчанию
  static throwResponseError(error: unknown, errors: Errors = {}, errorsReplace: boolean = false): never {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      throw new ApiError(Api.getErrorMessage('response', errors, errorsReplace))
    }

    throw error
  }
}
