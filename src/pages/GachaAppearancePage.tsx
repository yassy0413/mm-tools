import { useSearchParams } from 'react-router-dom'
import GachaAppearance from '../components/GachaAppearance'
import GachaAppearanceFilter from '../components/GachaAppearanceFilter'
import Header from '../components/Header'
import GachaAppearanceProvider from '../context/GachaAppearanceContext'

export default function GachaAppearancePage() {
  const [args] = useSearchParams()
  const characterName = args.get('characterName') ?? ''

  return (
    <>
      <Header title="ガチャ登場日" />
      <GachaAppearanceProvider>
        <GachaAppearanceFilter characterName={characterName} />
        <GachaAppearance characterName={characterName} />
      </GachaAppearanceProvider>
    </>
  )
}
