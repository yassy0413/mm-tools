import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useWorld } from './WorldContext'
import Api from '../utils/Api'

type GuildBpRawRecord = {
  bp: number
  id: number
  name: string
}

type GuildBpRecord = GuildBpRawRecord & {
  world_id: number
}

type GuildRankingData = {
  guildBpRanking: GuildBpRecord[]
}

const initialGuildRankingData: GuildRankingData = {
  guildBpRanking: [],
}

export type GuildRankingContextType = GuildRankingData & {
  loading: boolean
}

type Props = {
  children: ReactNode
  worldId: number
  regionId: number
}

const GuildRankingContext = createContext<GuildRankingContextType | null>(null)

export function GuildRankingProvider({ children, regionId, worldId }: Props) {
  const worldData = useWorld()
  const [loading, setLoading] = useState(true)
  const [guildRankingData, setGuildRankingData] = useState(
    initialGuildRankingData,
  )

  useEffect(() => {
    if (worldData.loading) {
      return
    }

    const invoke = async () => {
      const group = worldData.groupMap[worldData.makeGroupId(regionId, worldId)]
      if (group == undefined) {
        return []
      }

      // 任意グループに属する全ワールドの、ギルドランキングを取得
      const jsonDataList = await Api.Requests(
        group.map((worldId) => `${worldId}/guild_ranking/latest`),
      )

      // ギルドデータに対象の属するワールド番号を付与
      const guildBpRanking: GuildBpRecord[] = jsonDataList
        .flatMap((jsonData) => {
          const worldId = jsonData.data.world_id

          return jsonData.data.rankings.bp.map((x: GuildBpRawRecord[]) => ({
            ...x,
            world_id: worldId,
          }))
        })
        .sort((a, b) => b.bp - a.bp)

      setGuildRankingData({
        guildBpRanking: guildBpRanking,
      })

      setLoading(false)
    }
    invoke()
  }, [worldData, regionId, worldId])

  return (
    <GuildRankingContext.Provider value={{ loading, ...guildRankingData }}>
      {children}
    </GuildRankingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGuildRanking() {
  const context = useContext(GuildRankingContext)

  if (!context) {
    throw new Error('useGuildRanking must be used within GuildRankingProvider')
  }

  return context
}
