import TtlCache from './TtlCache'

type CharacterMasterRecord = {
  Id: number
  Memo: string
}

type GachaCaseRecord = {
  GachaCaseUiId: number
  StartTimeFixJST: string
  EndTimeFixJST: string
}

type GachaCaseUiRecord = {
  Id: number
  PickUpCharacterId: number
}

export type GachaAppearancePeriod = {
  start: string
  end: string
}

export type GachaAppearanceCharacter = {
  id: number
  name: string
  periods: GachaAppearancePeriod[]
}

const masterCache = new TtlCache<unknown>((x) => `gacha_${x}`)

const MASTER_BASE_URL =
  'https://raw.githubusercontent.com/ScobraCK/MementoMori-data/main/Master'

const isMoreThanOneDayAgo = (dateTime: string) => {
  const startTime = Date.parse(`${dateTime.replace(' ', 'T')}+09:00`)
  return startTime < Date.now() - 24 * 60 * 60 * 1000
}

const requestMaster = async <T>(path: string): Promise<T | null> => {
  const cachedData = masterCache.get(path) as T | null
  if (cachedData) {
    return cachedData
  }

  try {
    const response = await fetch(`${MASTER_BASE_URL}/${path}`)
    if (!response.ok) {
      throw new Error('Gacha Master Error')
    }

    const data = (await response.json()) as T
    masterCache.set(path, data)
    return data
  } catch (error) {
    console.error(error)
    return masterCache.get(path, undefined, true) as T | null
  }
}

export default class Gacha {
  static async RequestAppearances(): Promise<GachaAppearanceCharacter[]> {
    const [characters, gachaCases, gachaCaseUis] = await Promise.all([
      requestMaster<CharacterMasterRecord[]>('CharacterMB.json'),
      requestMaster<GachaCaseRecord[]>('GachaCaseMB.json'),
      requestMaster<GachaCaseUiRecord[]>('GachaCaseUiMB.json'),
    ])

    if (!characters || !gachaCases || !gachaCaseUis) {
      return []
    }

    const characterMap = new Map(characters.map((character) => [character.Id, character]))
    const gachaCaseUiMap = new Map(gachaCaseUis.map((gachaCaseUi) => [gachaCaseUi.Id, gachaCaseUi]))
    const appearanceMap = new Map<number, GachaAppearancePeriod[]>()

    for (const gachaCase of gachaCases) {
      const gachaCaseUi = gachaCaseUiMap.get(gachaCase.GachaCaseUiId)
      const characterId = gachaCaseUi?.PickUpCharacterId ?? 0
      if (
        !characterId ||
        !characterMap.has(characterId) ||
        !isMoreThanOneDayAgo(gachaCase.StartTimeFixJST)
      ) {
        continue
      }

      const periods = appearanceMap.get(characterId) ?? []
      periods.push({
        start: gachaCase.StartTimeFixJST,
        end: gachaCase.EndTimeFixJST,
      })
      appearanceMap.set(characterId, periods)
    }

    return [...appearanceMap.entries()]
      .map(([id, periods]) => ({
        id,
        name: characterMap.get(id)?.Memo ?? '',
        periods: periods.sort((a, b) => a.start.localeCompare(b.start)),
      }))
      .sort((a, b) => a.periods[0].start.localeCompare(b.periods[0].start))
  }
}
