import TtlCache from './TtlCache'

const masterCache = new TtlCache<string>((x) => `character_${x}`)

type CharacterMasterRecord = {
  Id: number
  Memo: string
}

export default class Character {
  static MASTER_URL =
    'https://raw.githubusercontent.com/ScobraCK/MementoMori-data/main/Master/CharacterMB.json'

  static ICON_BASE_URL =
    'https://raw.githubusercontent.com/ScobraCK/MementoMori-data/main/Assets/Characters/Sprites'

  static ICON_CACHE_NAME = 'mmtools-character-icons-v1'

  static NormalizeName(name: string) {
    return name.replace(/\s/g, '')
  }

  static async RequestNameMap(
    cacheMs = TtlCache.DEFAULT_CACHE_MS,
  ): Promise<Record<string, number>> {
    const cachedMap = masterCache.get('name_map', cacheMs) as
      | Record<string, number>
      | null
    if (cachedMap) {
      return cachedMap
    }

    try {
      const response = await fetch(this.MASTER_URL)
      if (!response.ok) {
        throw new Error('Character Master Error')
      }

      const characters = (await response.json()) as CharacterMasterRecord[]
      const nameMap: Record<string, number> = {}
      for (const character of characters) {
        nameMap[character.Memo] = character.Id
        nameMap[this.NormalizeName(character.Memo)] = character.Id
      }

      masterCache.set('name_map', nameMap)
      return nameMap
    } catch (error) {
      console.error(error)
      return (
        (masterCache.get('name_map', cacheMs, true) as
          | Record<string, number>
          | null) ?? {}
      )
    }
  }

  static GetId(nameMap: Record<string, number>, name: string) {
    return nameMap[name] ?? nameMap[this.NormalizeName(name)]
  }

  static IconUrl(characterId: number) {
    return `${this.ICON_BASE_URL}/CHR_${String(characterId).padStart(6, '0')}_00_s.png`
  }

  static async CacheIcon(characterId: number) {
    const url = this.IconUrl(characterId)
    if (typeof window === 'undefined' || !('caches' in window)) {
      return url
    }

    try {
      const iconCache = await caches.open(this.ICON_CACHE_NAME)
      const cachedResponse = await iconCache.match(url)
      if (cachedResponse) {
        return URL.createObjectURL(await cachedResponse.blob())
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Character Icon Error')
      }

      await iconCache.put(url, response.clone())
      return URL.createObjectURL(await response.blob())
    } catch (error) {
      console.error(error)
      return url
    }
  }
}
