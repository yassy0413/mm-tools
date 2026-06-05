import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import GSheet from '../utils/GSheet'

export type EquipmentValue = {
  value: number
  additional_value: number
}

export type EquipmentData = {
  valueMap: Record<number, EquipmentValue[]>
  levelLabelMap: Record<string, string>
  getValue: (level: number, slotType: number, rarity: number) => EquipmentValue
}

const initialEquipmentData: EquipmentData = {
  valueMap: {},
  levelLabelMap: {},
  getValue: () => {
    throw new Error('not initialized')
  },
}

export type EquipmentDataContextType = EquipmentData & {
  loading: boolean
}

const EquipmentDataContext = createContext<EquipmentDataContextType | null>(
  null,
)

export default function EquipmentDataProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [equipmentData, setEquipmentData] = useState(initialEquipmentData)

  useEffect(() => {
    const invoke = async () => {
      const equipmentCsv = await GSheet.Request(1002246187)
      if (!equipmentCsv) {
        return <p>Error</p>
      }

      const rows = GSheet.ParseCsv(equipmentCsv)
      const dataRows = rows.slice(4)

      const slotTypeCount = 5

      const createEquipmentValueList = (row: string[]) => {
        const rarityCount = 5
        const columnsPerRarity = 2
        const spacerColumnCount = 1
        const columnsPerSlotType =
          rarityCount * columnsPerRarity + spacerColumnCount

        const equipmentValueList: EquipmentValue[] = []

        const addData = (
          row: string[],
          beginColumn: number,
          rarityCount: number,
        ) => {
          for (
            let rarityIndex = 0;
            rarityIndex < rarityCount;
            rarityIndex += 1
          ) {
            const valueIndex = beginColumn + rarityIndex * 2
            equipmentValueList.push({
              value: Number(row[valueIndex]),
              additional_value: Number(row[valueIndex + 1]),
            })
          }
        }

        for (
          let slotTypeIndex = 0;
          slotTypeIndex < slotTypeCount;
          slotTypeIndex += 1
        ) {
          // 1列目がLvなので、データ開始は 1
          addData(row, 1 + slotTypeIndex * columnsPerSlotType, rarityCount)
        }

        return equipmentValueList
      }

      const valueMap = Object.fromEntries(
        dataRows.map((row: string[]) => [
          Number(row[0]), // Lv
          createEquipmentValueList(row),
        ]),
      )
      const levelList = Object.keys(valueMap)

      setEquipmentData({
        valueMap: valueMap,
        levelLabelMap: Object.fromEntries(levelList.map((x) => [x, x])),
        getValue: (level: number, slotType: number, rarity: number) => {
          const values = valueMap[level]
          if (values == undefined) {
            return { value: 0, additional_value: 0 }
          }
          return values[slotTypeCount * slotType + rarity]
        },
      })

      setLoading(false)
    }
    invoke()
  }, [loading])

  return (
    <EquipmentDataContext.Provider value={{ loading, ...equipmentData }}>
      {children}
    </EquipmentDataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEquipmentData() {
  const context = useContext(EquipmentDataContext)

  if (!context) {
    throw new Error(
      'useEquipmentData must be used within EquipmentDataProvider',
    )
  }

  return context
}
