import { ArrowDownUp } from '@/assets/icons'
import { Selector } from '@/components/Selector'
import { useStyles } from '@/hooks/useStyles'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

const currencies = [
  { code: 'USD', name: 'USD', description: 'Доллар США' },
  { code: 'EUR', name: 'EUR', description: 'Евро' },
  { code: 'RUB', name: 'RUB', description: 'Российский рубль' }
]

export default function Index() {
  const [fromCurrency, setFromCurrency] = useState(currencies[0])
  const [inCurrency, setInCurrency] = useState(currencies[0])

  const styles = useStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
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
    swapButtonPressed: {
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

  function handleReverse() {
    setFromCurrency
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Конвертер валют</Text>
      <View style={styles.wrapper}>
        <Text style={styles.label}>Сумма</Text>
        <TextInput style={styles.input} defaultValue="100" />
      </View>

      <View style={styles.wrapper}>
        <Text style={styles.label}>Из</Text>
        <Selector
          currencies={currencies}
          value={fromCurrency}
          onChange={setFromCurrency}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.swapButton, pressed && styles.swapButtonPressed]}
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
          value={inCurrency}
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

