import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import Character from '../utils/Character'
import GSheet from '../utils/GSheet'

const BATTLE_LEAGUE_CHARACTER_RANKING_GID = 310090299

export type BattleLeagueCharacterRankingRecord = {
  rank: number
  count: number
  name: string
  characterId?: number
}

export type BattleLeagueCharacterRankingWorldRecord = {
  world: string
  rankings: BattleLeagueCharacterRankingRecord[]
}

type BattleLeagueCharacterRankingData = {
  rankingList: BattleLeagueCharacterRankingWorldRecord[]
  lastUpdated: string
}

const initialData: BattleLeagueCharacterRankingData = {
  rankingList: [],
  lastUpdated: '',
}

export type BattleLeagueCharacterRankingContextType =
  BattleLeagueCharacterRankingData & {
    loading: boolean
  }

const BattleLeagueCharacterRankingContext =
  createContext<BattleLeagueCharacterRankingContextType | null>(null)

const parseRankingCell = (
  cell: string,
  rank: number,
  nameMap: Record<string, number>,
): BattleLeagueCharacterRankingRecord | null => {
  const lines = cell
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return null
  }

  const name = lines.slice(1).join('\n')
  return {
    rank,
    count: Number(lines[0].replace(/,/g, '')),
    name,
    characterId: Character.GetId(nameMap, name),
  }
}

export default function BattleLeagueCharacterRankingProvider({
  children,
}: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [rankingData, setRankingData] = useState(initialData)

  useEffect(() => {
    const invoke = async () => {
      const [csv, nameMap] = await Promise.all([
        GSheet.Request(BATTLE_LEAGUE_CHARACTER_RANKING_GID),
        Character.RequestNameMap(),
      ])
      if (!csv) {
        setLoading(false)
        return
      }

      const rows = GSheet.ParseCsv(csv)
      const dataRows = rows.slice(2).filter((row) => row[0])

      setRankingData({
        rankingList: dataRows.map((row) => ({
          world: row[0],
          rankings: row
            .slice(1)
            .map((cell, index) => parseRankingCell(cell, index + 1, nameMap))
            .filter((ranking) => ranking !== null),
        })),
        lastUpdated: rows[0]?.[0]?.replace('LastUpdated:', '').trim() ?? '',
      })

      setLoading(false)
    }
    invoke()
  }, [])

  return (
    <BattleLeagueCharacterRankingContext.Provider
      value={{ loading, ...rankingData }}
    >
      {children}
    </BattleLeagueCharacterRankingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBattleLeagueCharacterRanking() {
  const context = useContext(BattleLeagueCharacterRankingContext)

  if (!context) {
    throw new Error(
      'useBattleLeagueCharacterRanking must be used within BattleLeagueCharacterRankingProvider',
    )
  }

  return context
}
