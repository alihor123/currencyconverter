import { ArrowDownUp } from '@/assets/icons'
import { Selector } from '@/components/Selector'
import { useDelayedLoading } from '@/hooks/useDelayedLoading'
import { useStyles } from '@/hooks/useStyles'
import { ApiError } from '@/services/api'
import { getCurrencies, getExchangeRate, type Currency, type ExchangeRate } from '@/services/currency.api'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

type ConversionResult = {
  amount: number
  value: number
  currency: Currency
  exchangeRate: ExchangeRate
}

export default function Index() {
  const styles = useStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    DataLoader: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center'
    },
    dataLoaderIndicator: {
      color: colors.primary
    },
    dataError: {
      backgroundColor: colors.background,
      alignSelf: 'center',
      alignItems: 'center',
      maxWidth: '90%',
      marginVertical: 'auto',
      justifyContent: 'center',
      padding: 24
    },
    dataErrorText: {
      color: colors.error,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20
    },
    dataErrorButton: {
      alignSelf: 'stretch',
      height: 50,
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: colors.primary
    },

    content: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 60,
      paddingBottom: 60,
      padding: 24
    },

    wrapper: {
      width: '100%',
      gap: 10,
      marginBottom: 20
    },

    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 30
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text
    },
    input: {
      width: '100%',
      height: 50,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 16,
      borderColor: colors.border,
      borderWidth: 2,
      backgroundColor: colors.surface,
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: '500'
    },
    swapButton: {
      alignItems: 'center',
      justifyContent: 'center'
      
    },
    buttonPressed: {
      opacity: 0.6
    },
    buttonDisabled: {
      opacity: 0.5
    },
    swapIcon: {
      width: 30,
      height: 30,
      tintColor: colors.primary
    },
    convertButton: {
      width: '100%',
      marginBottom: 25,
      minHeight: 50,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      backgroundColor: colors.primary
    },
    convertButtonPressed: {
      backgroundColor: colors.primaryPressed
    },
    convertButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onPrimary
    },
    result: {
      width: '100%',
      minHeight: 100,
      justifyContent: 'center',
      gap: 8,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.surfaceSoft
    },
    resultValue: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.text
    },
    resultHint: {
      fontSize: 12,
      color: colors.textSecondary
    },
    resultMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center'
    }
  }))

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null)
  const [inCurrency, setInCurrency] = useState<Currency | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)
  const [amount, setAmount] = useState('1')
  const [isConvertLoading, setIsConvertLoading] = useState(false)
  const [showConvertLoading, onConvertLoadingChange] = useDelayedLoading(300, false)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)

  const disabled = !amount
  const formattedResult = result?.value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  // Поле для результата, загрузки и обработки ошибок
  let resultMessage: string | null = null

  if (showConvertLoading) {
    resultMessage = 'Загрузка'
  } else if (disabled) {
    resultMessage = 'Введите сумму'
  } else if (convertError) {
    resultMessage = convertError
  } else if (!result && !isConvertLoading) {
    resultMessage = 'Введите сумму'
  }

  // Загрузка валют
  async function loadData() {
    setIsDataLoading(true)
    setDataLoadError(null)

    try {
      const data = await getCurrencies()

      const fromCurrencies = data.find(currencies => currencies.code.toLowerCase() === 'usd') || data[0]
      const inCurrency = data.find(currencies => currencies.code.toLowerCase() === 'rub') || data[0]
      setCurrencies(data)
      setFromCurrency(fromCurrencies)
      setInCurrency(inCurrency)
      return { fromCurrency: fromCurrencies, inCurrency }
    }
    catch (error) {
      if (error instanceof ApiError) {
        setDataLoadError(error.message)
      }
    }
    finally {
      setIsDataLoading(false)
    }
  }

  // Конвертация суммы по курсу выбранной пары
  async function handleConvert(from = fromCurrency, to = inCurrency) {
    if (disabled || isConvertLoading) return

    setIsConvertLoading(true)
    onConvertLoadingChange(true)
    setConvertError(null)

    try {
      const numericAmount = Number(amount.replace(',', '.'))
      const exchangeRate = await getExchangeRate(from!, to!)
      const value = numericAmount * exchangeRate.rate

      setResult({ amount: numericAmount, value, currency: to!, exchangeRate })
    }
    catch (error) {
      if (error instanceof ApiError) {
        setConvertError(error.message)
        setResult(null)
      }
    }
    finally {
      setIsConvertLoading(false)
      onConvertLoadingChange(false)
    }
  }

  useEffect(() => {
    // Загрузка валют + первая конвертация
    async function init() {
      const selectedCurrencies = await loadData()

      if (selectedCurrencies) {
        await handleConvert(selectedCurrencies.fromCurrency, selectedCurrencies.inCurrency)
      }
    }

    init()
  }, [])

  // Ввод суммы с ограничением через регулярное выражение
  function handleChange(text: string) {
    if (text === '' || /^\d+([.,]\d*)?$/.test(text)) {
      setAmount(text)
    }
  }

  // Смена валют местам
  async function handleSwap() {
    if (isConvertLoading) return
    if (disabled) return

    setFromCurrency(inCurrency)
    setInCurrency(fromCurrency)

    if (!result) {
      await handleConvert(inCurrency, fromCurrency)
      return
    }

    const numericAmount = Number(amount.replace(',', '.'))
    const exchangeRate = {
      ...result.exchangeRate,
      base: result.exchangeRate.quote,
      quote: result.exchangeRate.base,
      rate: 1 / result.exchangeRate.rate
    }

    setConvertError(null)
    setResult({
      amount: numericAmount,
      value: numericAmount * exchangeRate.rate,
      currency: fromCurrency!,
      exchangeRate: exchangeRate
    })
  }

  

  if (isDataLoading) {
    return (
      <View style={styles.DataLoader}>
        <ActivityIndicator size={80} color={styles.dataLoaderIndicator.color} />
      </View>
    )
  }

  if (dataLoadError) {
    return (
      <View style={styles.container}>
        <View style={styles.dataError}>
          <Text style={styles.dataErrorText}>{dataLoadError}</Text>
          <Pressable
            onPress={async () => {
              const selectedCurrencies = await loadData()

              if (selectedCurrencies) {
                await handleConvert(selectedCurrencies.fromCurrency, selectedCurrencies.inCurrency)
              }
            }}
            style={({ pressed }) => ([styles.dataErrorButton, pressed && styles.buttonPressed ])}
          >
            <Text style={styles.convertButtonText}>Повторить</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Конвертер валют</Text>
      <View style={styles.wrapper}>
        <Text style={styles.label}>Сумма</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          editable={!isConvertLoading}
        />
      </View>

      <View style={styles.wrapper}>
        <Text style={styles.label}>Из</Text>
        <Selector
          currencies={currencies}
          value={fromCurrency!}
          onChange={setFromCurrency}
        />
      </View>

      <Pressable
        onPress={handleSwap}
        disabled={isConvertLoading}
        style={({ pressed }) => [styles.swapButton, pressed && styles.buttonPressed, showConvertLoading && styles.buttonDisabled]}
      >
        <Image
          source={ArrowDownUp}
          style={styles.swapIcon}
          tintColor={styles.swapIcon.tintColor}
          contentFit="contain"
        />
      </Pressable>

      <View style={styles.wrapper}>
        <Text style={styles.label}>В</Text>
        <Selector
          currencies={currencies}
          value={inCurrency!}
          onChange={setInCurrency}
        />
      </View>
      <Pressable
        onPress={() => handleConvert()}
        disabled={disabled || isConvertLoading}
        style={({ pressed }) => [styles.convertButton, pressed && styles.convertButtonPressed, (disabled || showConvertLoading) && styles.buttonDisabled]}
      >
        <Text style={styles.convertButtonText}>Конвертировать</Text>
      </Pressable>

      <View style={styles.wrapper}>
        <Text style={styles.label}>Результат</Text>
        <View style={styles.result}>
          {resultMessage && (
            <Text style={styles.resultMessage}>{resultMessage}</Text>
          )}

          {!resultMessage && result && (
            <>
              <Text style={styles.resultValue}>{formattedResult} {result.currency.symbol ?? result.currency.code}</Text>
              <Text style={styles.resultHint}>
                {result.amount} {result.exchangeRate.base} = {formattedResult} {result.exchangeRate.quote}
              </Text>
            </>
          )}
        </View>
      </View>
      {result && !disabled && result.exchangeRate.date && (
        <Text style={styles.resultHint}>
          Курс обновлён: {result.exchangeRate.date.split('-').reverse().join('.')}
        </Text>
      )}
    </ScrollView>
  )
}

