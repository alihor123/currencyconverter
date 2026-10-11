import { useStyles } from '@/hooks/useStyles'
import { Text, View } from 'react-native'

export default function Index() {

  const styles = useStyles((colors) => ({
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
  }))

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Конвертер валют</Text>
    </View>
  )
}

