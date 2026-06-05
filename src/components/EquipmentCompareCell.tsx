import {
  useEquipmentData,
  type EquipmentValue,
} from '../context/EquipmentDataContext'
import styles from './EquipmentCompareCell.module.css'
import Selector from './Selector'

type Props = {
  name: string
  slotType: number
  rarity: number
  value: number
  onChangeValue: (value: number) => void
}

export default function EquipmentCompareCell({
  name,
  slotType,
  rarity,
  value,
  onChangeValue,
}: Props) {
  const equipmentData = useEquipmentData()

  // 引数の武具固有値が１番近いレベルを選ぶ
  let diff = Number.MAX_VALUE
  let equipmentValue: EquipmentValue = { value: 0, additional_value: 0 }
  let level = ''
  for (const v in equipmentData.levelLabelMap) {
    const ev = equipmentData.getValue(Number(v), slotType, rarity)
    if (ev === undefined) {
      continue
    }
    if (ev.value === 0) {
      continue
    }
    const d = Math.abs(ev.value - value)
    if (diff > d) {
      diff = d
      equipmentValue = ev
      level = v
    }
  }

  //console.log(`${rarity} ${level}`)

  const onLevelChange = (level: string) => {
    onChangeValue(equipmentData.getValue(Number(level), slotType, rarity).value)
  }

  return (
    <div className={styles.equipmentCompareTargetCell}>
      <p className={styles.equipmentCellTitle}>{name}</p>
      <div className={styles.equipmentCellLevel}>
        <Selector
          stringMap={equipmentData.levelLabelMap}
          initialValue={level}
          onChange={onLevelChange}
        />
      </div>
      <div className={styles.equipmentValue}>
        <p className={styles.equipmentValueTitle}>武具固有値</p>
        <p className={styles.equipmentValueNumber}>
          {equipmentValue.value.toLocaleString()}
        </p>
      </div>
      <div className={styles.equipmentValue}>
        <p className={styles.equipmentValueTitle}>追加効果</p>
        <p className={styles.equipmentValueNumber}>
          {equipmentValue.additional_value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
