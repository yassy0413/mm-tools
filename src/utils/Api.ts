import TtlCache from './TtlCache'

type FreshCallback = () => void

const cache = new TtlCache<string>((x) => `api_json_${x}`)

export default class Api {
  static API_URL = 'https://api.mentemori.icu'

  static async Request(
    path: string,
    cacheMs = TtlCache.DEFAULT_CACHE_MS,
    onFresh: FreshCallback = () => {},
  ) {
    const cachedJson = cache.get(path, cacheMs)
    if (cachedJson) {
      return cachedJson
    }

    try {
      const response = await fetch(`${this.API_URL}/${path}`)
      if (!response.ok) {
        //todo: error handling
        throw new Error('Api Error')
      }

      const json = await response.json()
      cache.set(path, json)
      onFresh()
      return json
    } catch (error) {
      console.error(error)
      return cache.get(path, cacheMs, true)
    }
  }

  static async Requests(
    paths: string[],
    cacheMs = TtlCache.DEFAULT_CACHE_MS,
    onFresh: FreshCallback = () => {},
  ) {
    return await Promise.all(
      paths.map((path) => this.Request(path, cacheMs, onFresh)),
    )
  }
}
