import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import Api from '../utils/Api'

type WorldData = {
  regionMap: Record<number, string>
  // groupId to worldIds
  groupMap: Record<number, number[]>
  // worldId to groupId
  worldMap: Record<number, number>
  makeGroupId: (regionId: number, worldId: number) => number
  makeServerName: (worldId: number) => string
}

const initialWorldData: WorldData = {
  regionMap: {},
  groupMap: {},
  worldMap: {},
  makeGroupId: () => 0,
  makeServerName: () => '',
}

export type WorldContextType = WorldData & {
  loading: boolean
}

const WorldContext = createContext<WorldContextType | null>(null)

export function WorldProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [worldData, setWorldData] = useState(initialWorldData)

  useEffect(() => {
    const invoke = async () => {
      const [wgroups, worlds] = await Api.Requests(['wgroups', 'worlds'])

      const regionMap: Record<number, string> = {}
      for (const world of worlds.data) {
        const regionId = Math.floor(world.world_id / 1000)
        if (!(regionId in regionMap)) {
          regionMap[regionId] = world.server
        }
      }

      // const regionStringMap: Record<string, string> = Object.fromEntries(
      //   Object.entries(regionMap).map(([key, value]) => [key, String(value)]),
      // )

      const groupMap: Record<number, number[]> = {}
      const worldMap: Record<number, number> = {}
      for (const group of wgroups.data) {
        groupMap[group.group_id] = group.worlds
        for (const worldId of group.worlds) {
          worldMap[worldId] = group.group_id
        }
      }

      setWorldData({
        regionMap: regionMap,
        groupMap: groupMap,
        worldMap: worldMap,
        makeGroupId: (regionId: number, worldId: number) => {
          return worldMap[worldId + regionId * 1000] ?? 0
        },
        makeServerName: (worldId: number) => {
          return `${regionMap[Math.floor(worldId / 1000)]}${worldId % 1000}`
        },
      })

      setLoading(false)
    }
    invoke()
  }, [])

  return (
    <WorldContext.Provider value={{ loading, ...worldData }}>
      {children}
    </WorldContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorld() {
  const context = useContext(WorldContext)

  if (!context) {
    throw new Error('useWorld must be used within WorldProvider')
  }

  return context
}
