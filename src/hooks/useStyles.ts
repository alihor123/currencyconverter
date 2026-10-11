import { Colors } from '@/constants/colors'
import { StyleSheet, useColorScheme } from 'react-native'

function getThemeColors() {
  const theme = useColorScheme()
  return theme === 'dark' ? Colors.dark : Colors.light
}

export function useStyles<T extends StyleSheet.NamedStyles<any>>(createStyles: (colors: typeof Colors.light) => T) {
  return StyleSheet.create(createStyles(getThemeColors()))
}