import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import Gacha, { type GachaAppearanceCharacter } from '../utils/Gacha'

type GachaAppearanceContextType = {
  characters: GachaAppearanceCharacter[]
  loading: boolean
}

const GachaAppearanceContext = createContext<GachaAppearanceContextType | null>(null)

export default function GachaAppearanceProvider({ children }: PropsWithChildren) {
  const [characters, setCharacters] = useState<GachaAppearanceCharacter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Gacha.RequestAppearances().then((data) => {
      setCharacters(data)
      setLoading(false)
    })
  }, [])

  return (
    <GachaAppearanceContext.Provider value={{ characters, loading }}>
      {children}
    </GachaAppearanceContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGachaAppearance() {
  const context = useContext(GachaAppearanceContext)
  if (!context) {
    throw new Error('useGachaAppearance must be used within GachaAppearanceProvider')
  }

  return context
}
