import { ArrowDownUp } from '@/assets/icons'
import { Selector } from '@/components/Selector'
import { useStyles } from '@/hooks/useStyles'
import { ApiError } from '@/services/api'
import { getCurrencies, type Currency } from '@/services/currency.api'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

export default function Index() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [fromCurrency, setFromCurrency] = useState<Currency | null>(null)
  const [inCurrency, setInCurrency] = useState<Currency | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataLoadError, setDataLoadError] = useState<string | null>(null)
  const [amount, setAmount] = useState('1')

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
    }
  }))

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

  useEffect(() => {
    loadData()
  }, [])

  // Ввод суммы с ограничением через регулярное выражение
  function handleChange(text: string) {
    if (text === '' || /^\d+([.,]\d*)?$/.test(text)) {
      setAmount(text)
    }
  }

  function handleSwap() {
    setFromCurrency(inCurrency)
    setInCurrency(fromCurrency)
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
            onPress={loadData}
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
        style={({ pressed }) => [styles.swapButton, pressed && styles.buttonPressed]}
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
        style={({ pressed }) => [styles.convertButton, pressed && styles.convertButtonPressed]}
      >
        <Text style={styles.convertButtonText}>Конвертировать</Text>
      </Pressable>

      {/* Временный результат для верстки. */}
      <View style={styles.wrapper}>
        <Text style={styles.label}>Результат</Text>
        <View style={styles.result}>
          <Text style={styles.resultValue}>10 800,00 ₽</Text>
          <Text style={styles.resultHint}>100 USD = 10 800,00 RUB</Text>
        </View>
      </View>
      <Text style={styles.resultHint}>Курс обновлён: 12.10.2026, 12:00</Text>
    </ScrollView>
  )
}

