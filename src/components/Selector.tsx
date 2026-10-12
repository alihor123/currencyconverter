import { ArrowDown } from '@/assets/icons'
import { useStyles } from '@/hooks/useStyles'
import type { Currency } from '@/services/currency.api'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'

type SelectorProps = {
  currencies: Currency[]
  value: Currency
  disabled?: boolean
  onChange: (currency: Currency) => void
}

export function Selector({ currencies, value, disabled, onChange }: SelectorProps) {

  const styles = useStyles((colors) => ({
    field: {
      width: '100%',
      minHeight: 64,
      paddingHorizontal: 12,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.surface
    },
    list: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      marginTop: 4
    },
    selectedContent: {
      flex: 1,
      paddingVertical: 12
    },
    item: {
      paddingHorizontal: 12,
      paddingVertical: 12
    },
    selectedItem: {
      backgroundColor: colors.surfaceSoft
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface
    },
    description: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4
    },
    hiddenText: {
      display: 'none'
    },
    arrow: {
      width: 25,
      height: 25,
      marginLeft: 12,
      tintColor: colors.onSurface
    }
  }))

  return (
    <Dropdown
      style={styles.field}
      containerStyle={styles.list}
      data={currencies}
      labelField="name"
      valueField="code"
      value={value.code}
      disable={disabled}
      onChange={onChange}
      activeColor={styles.selectedItem.backgroundColor}
      selectedTextStyle={styles.hiddenText}
      maxHeight={260}
      autoScroll={false}

      renderLeftIcon={() => (
        <View style={styles.selectedContent}>
          <Text style={styles.name}>{value.name}</Text>
          <Text style={styles.description}>{value.description}</Text>
        </View>
      )}
      renderRightIcon={() => (
        <Image
          source={ArrowDown}
          style={styles.arrow}
          contentFit="contain"
          tintColor={styles.arrow.tintColor}
        />
      )}
      renderItem={(item, selected) => (
        <View style={[styles.item, selected && styles.selectedItem]}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
    />
  )
}
