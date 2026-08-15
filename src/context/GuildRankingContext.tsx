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
  globalGvgGuildGroupMap: Record<number, number>
}

const initialGuildRankingData: GuildRankingData = {
  guildBpRanking: [],
  globalGvgGuildGroupMap: {},
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
      const groupId = worldData.makeGroupId(regionId, worldId)
      const group = worldData.groupMap[groupId]
      if (group == undefined) {
        return []
      }

      // 任意グループに属する全ワールドの、ギルドランキングを取得
      const guildRankingPaths = group.map(
        (groupWorldId) => `${groupWorldId}/guild_ranking/latest`,
      )
      const globalGvgPaths = [1, 2, 3].flatMap((gvgClass) =>
        [0, 1, 2, 3].map(
          (block) => `wg/${groupId}/globalgvg/${gvgClass}/${block}/latest`,
        ),
      )
      let jsonDataList = await Api.Requests(guildRankingPaths)
      const globalGvgDataList = worldData.globalGvgGroupIds.has(groupId)
        ? await Api.Requests(globalGvgPaths)
        : []

      // bp[]が空の時があるので、その場合はキャッシュをクリアして再取得する
      if (
        jsonDataList.some((jsonData) => jsonData.data.rankings.bp?.length === 0)
      ) {
        // retry clean
        jsonDataList = await Api.Requests(
          guildRankingPaths,
          { clean: true },
        )

        if (
          jsonDataList.some(
            (jsonData) => jsonData.data.rankings.bp?.length === 0,
          )
        ) {
          return []
        }
      }

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

      const globalGvgGuildGroupMap: Record<number, number> = {}
      for (const [index, globalGvgData] of globalGvgDataList.entries()) {
        const guilds = globalGvgData?.data?.guilds
        if (!guilds) {
          continue
        }

        const block = index % 4
        for (const guildId of Object.keys(guilds)) {
          globalGvgGuildGroupMap[Number(guildId)] = block
        }
      }

      setGuildRankingData({
        guildBpRanking: guildBpRanking,
        globalGvgGuildGroupMap: globalGvgGuildGroupMap,
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
