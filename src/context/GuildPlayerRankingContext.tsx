import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useWorld } from './WorldContext'
import Api from '../utils/Api'

// eslint-disable-next-line react-refresh/only-export-components
export const guildBpRankingMap: Record<number, PlayerRecord[]> = {}
// eslint-disable-next-line react-refresh/only-export-components
export const guildWorldIdSet = new Set<number>()

type PlayerBpRecord = {
  bp: number
  id: number
  name: string
}

type PlayerInfoRecord = {
  guild_id: number
  guild_name: string
  icon_id: number
  quest_id: number
  rank: number
  tower_id: number
}

type PlayerRecord = PlayerBpRecord & PlayerInfoRecord

type GuildPlayerRanking = {
  guildName: string
  playerBpRanking: PlayerRecord[]
}

const initialData: GuildPlayerRanking = {
  guildName: '',
  playerBpRanking: [],
}

export type GuildPlayerRankingContextType = GuildPlayerRanking & {
  loading: boolean
}

type Props = {
  children: ReactNode
  worldId: number
  guildId: number
  guildName: string
}

const GuildPlayerRankingContext =
  createContext<GuildPlayerRankingContextType | null>(null)

export default function GuildPlayerRankingProvider({
  children,
  worldId,
  guildId,
  guildName,
}: Props) {
  const worldData = useWorld()
  const [loading, setLoading] = useState(true)
  const [guildPlayerRankingData, setGuildPlayerRankingData] =
    useState(initialData)

  const clearCache = () => {
    for (const key in guildBpRankingMap) {
      delete guildBpRankingMap[key]
    }
    guildWorldIdSet.clear()
  }

  useEffect(() => {
    if (worldData.loading) {
      return
    }

    const invoke = async () => {
      if (!guildWorldIdSet.has(worldId)) {
        // 任意ワールドの戦闘力ランキングにエントリーしているプレーヤー情報を回収
        const jsonData = await Api.Request(`${worldId}/player_ranking/latest`, {
          onFresh: clearCache,
        })

        const playerBpRanking: PlayerBpRecord[] =
          jsonData.data.rankings.bp ?? []
        const playerInfoMap: Record<number, PlayerInfoRecord> =
          jsonData.data.player_info ?? {}

        const players: PlayerRecord[] = playerBpRanking.map((x) => {
          return {
            ...x,
            ...(playerInfoMap[x.id] || {}),
          }
        })

        // ギルド単位のプレーヤー情報を取得
        for (const player of players) {
          const guildId = player.guild_id
          if (!guildBpRankingMap[guildId]) {
            guildBpRankingMap[guildId] = []
          }
          guildBpRankingMap[guildId].push(player)
        }

        // このワールドは取得済みの状態にする
        guildWorldIdSet.add(worldId)
      } else {
        console.log(`cache hit! wid:${worldId}`)
      }

      const targetGuildPlayerBpRanking = guildBpRankingMap[guildId]
      if (targetGuildPlayerBpRanking?.length) {
        setGuildPlayerRankingData({
          guildName: guildName,
          playerBpRanking: targetGuildPlayerBpRanking,
        })
      } else {
        setGuildPlayerRankingData({
          guildName: guildName,
          playerBpRanking: [],
        })
      }

      setLoading(false)
    }
    invoke()
  }, [worldData.loading, worldId, guildId, guildName])

  return (
    <GuildPlayerRankingContext.Provider
      value={{ loading, ...guildPlayerRankingData }}
    >
      {children}
    </GuildPlayerRankingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGuildPlayerRanking() {
  const context = useContext(GuildPlayerRankingContext)

  if (!context) {
    throw new Error(
      'useGuildPlayerRanking must be used within GuildPlayerRankingProvider',
    )
  }

  return context
}
