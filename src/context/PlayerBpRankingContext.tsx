import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import GSheet from '../utils/GSheet'

export type PlayerData = {
  ranking: number
  world: string
  worldId: number
  name: string
  bp: number
  rank: number
  quest: string
  tower: number
  towerRed: number
  towerBlue: number
  towerGreen: number
  towerYellow: number
  guildName: string
  leagueUnit1: string
  leagueUnit2: string
  leagueUnit3: string
  leagueUnit4: string
  leagueUnit5: string
}

export type PlayerBpRankingData = {
  bpRankingList: PlayerData[]
  lastUpdated: string
}

const initialPlayerBpRankingData: PlayerBpRankingData = {
  bpRankingList: [],
  lastUpdated: '',
}

export type PlayerBpRankingContextType = PlayerBpRankingData & {
  loading: boolean
}

const PlayerBpRankingContext = createContext<PlayerBpRankingContextType | null>(
  null,
)

export default function PlayerBpRankingProvider({
  children,
}: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [playerBpRankingData, setPlayerBpRankingData] = useState(
    initialPlayerBpRankingData,
  )

  useEffect(() => {
    const invoke = async () => {
      const csv = await GSheet.Request(0)
      if (!csv) {
        return <p>Error</p>
      }

      const rows = GSheet.ParseCsv(csv)
      const dataRows = rows.slice(2)

      setPlayerBpRankingData({
        bpRankingList: dataRows.map((row) => ({
          ranking: Number(row[0]),
          world: row[1],
          worldId: Number(row[1].slice(2)),
          name: row[2],
          bp: Number(row[3].replace(/,/g, '')),
          rank: Number(row[4]),
          quest: row[5].replace('.', '-'),
          tower: Number(row[6]),
          towerRed: Number(row[7]),
          towerBlue: Number(row[8]),
          towerGreen: Number(row[9]),
          towerYellow: Number(row[10]),
          guildName: row[11],
          leagueUnit1: row[12],
          leagueUnit2: row[13],
          leagueUnit3: row[14],
          leagueUnit4: row[15],
          leagueUnit5: row[16],
        })),
        lastUpdated: rows[0][0].replace('LastUpdated:', ''),
      })

      setLoading(false)
    }
    invoke()
  }, [loading])

  return (
    <PlayerBpRankingContext.Provider
      value={{ loading, ...playerBpRankingData }}
    >
      {children}
    </PlayerBpRankingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlayerBpRanking() {
  const context = useContext(PlayerBpRankingContext)

  if (!context) {
    throw new Error(
      'usePlayerBpRanking must be used within PlayerBpRankingProvider',
    )
  }

  return context
}
