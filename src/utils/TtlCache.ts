export default class TtlCache<TKey> {
  static DEFAULT_CACHE_MS = 30 * 60 * 1000

  makeKey: (value: TKey) => string

  constructor(makeKey: (value: TKey) => string) {
    this.makeKey = makeKey
  }

  get(key: TKey, cacheMs = TtlCache.DEFAULT_CACHE_MS, allowExpired = false) {
    const uniqueKey = this.makeKey(key)
    const cacheText = localStorage.getItem(uniqueKey)
    if (cacheText === null) {
      return null
    }

    try {
      const cache = JSON.parse(cacheText)
      const isFresh = Date.now() - cache.savedAt < cacheMs
      if ((isFresh || allowExpired) && cache.data !== undefined) {
        return cache.data
      }
    } catch (error) {
      console.error(error)
      localStorage.removeItem(uniqueKey)
    }

    return null
  }

  set<T>(key: TKey, data: T) {
    const uniqueKey = this.makeKey(key)
    localStorage.setItem(
      uniqueKey,
      JSON.stringify({ data: data, savedAt: Date.now() }),
    )
  }

  remove(key: TKey) {
    localStorage.removeItem(this.makeKey(key))
  }
}
