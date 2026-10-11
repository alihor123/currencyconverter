import { StyleSheet, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function Index() {
  const colors = useThemeColors()
  const styles = getStyles(colors)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Конвертер валют</Text>
    </View>
  )
}

function getStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.operationBackground,
      textAlign: 'center',
    },
  })
}
