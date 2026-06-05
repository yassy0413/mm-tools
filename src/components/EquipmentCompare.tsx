import styles from './EquipmentCompare.module.css'
import EquipmentCompareCell from './EquipmentCompareCell'
import { useEquipmentData } from '../context/EquipmentDataContext'
import { useState } from 'react'
import LoadingIndicator from './LoadingIndicator'

export default function EquipmentCompare() {
  const SLOT_TYPE_KEY = 'equipment_slottype'
  const EQUIPMENT_VALUE_KEY = 'equipment_value'

  const equipmentData = useEquipmentData()

  const [slotType, setSlotType] = useState(
    Number(localStorage.getItem(SLOT_TYPE_KEY) || '0'),
  )
  const [value, setValue] = useState(
    localStorage.getItem(EQUIPMENT_VALUE_KEY) || '0',
  )

  if (equipmentData.loading) {
    return <LoadingIndicator />
  }

  const slotTypes = [
    { id: 0, name: '飾' },
    { id: 1, name: '手' },
    { id: 2, name: '頭' },
    { id: 3, name: '胴' },
    { id: 4, name: '足' },
  ]

  const equipments = [
    { rarity: 4, name: 'メタトロン' },
    { rarity: 3, name: 'ミカエル' },
    { rarity: 2, name: 'サタン' },
    { rarity: 1, name: 'ハニエル' },
    { rarity: 0, name: 'バアル' },
  ] as const

  // console.log(equipmentData)

  return (
    <section className="wrapper">
      <p className={styles.equipmentExplainText}>
        入力した武具固有値に1番近いレベルが、それぞれ選択されます。
        <br />
        レベルを選択すると、その装備の武具固有値で更新されます。
      </p>
      <div className={styles.equipmentTargetValue}>
        <input
          type="number"
          className="validate"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="武具固有値を入力..."
        />
      </div>
      <div className="equipmentSlotTabGroup">
        {slotTypes.map((slot) => (
          <button
            key={slot.id}
            className={`
              waves-effect waves-light
              ${styles.equipmentSlotTab} 
              ${slotType === slot.id ? styles.equipmentSlotTabActive : ''}
            `}
            onClick={() => {
              setSlotType(slot.id)
              localStorage.setItem(SLOT_TYPE_KEY, slot.id.toString())
            }}
          >
            {slot.name}
          </button>
        ))}
      </div>
      <hr className={styles.equipmentSeparator} />
      {equipments.map((equipment) => (
        <EquipmentCompareCell
          key={`equipment-r${equipment.rarity}`}
          name={equipment.name}
          slotType={slotType}
          rarity={equipment.rarity}
          value={Number(value)}
          onChangeValue={(value: number) => {
            setValue(value.toString())
            localStorage.setItem(EQUIPMENT_VALUE_KEY, value.toString())
          }}
        />
      ))}
    </section>
  )
}
