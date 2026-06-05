import Header from '../components/Header'
import EquipmentDataProvider from '../context/EquipmentDataContext'
import EquipmentCompare from '../components/EquipmentCompare'

export default function EquipmentComparePage() {
  return (
    <>
      <Header title="装備効果値 比較" />
      <EquipmentDataProvider>
        <EquipmentCompare />
      </EquipmentDataProvider>
    </>
  )
}
