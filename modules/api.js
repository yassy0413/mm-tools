export class Api {
  static API_URL = "https://api.mentemori.icu";
  static DEFAULT_CACHE_MS = 30 * 60 * 1000;

  static CacheKey(path) {
    return `api_json_${path}`;
  }

  static GetCachedJson(path, cacheMs = this.DEFAULT_CACHE_MS, allowExpired = false) {
    const cacheText = localStorage.getItem(this.CacheKey(path));
    if (!cacheText) {
      return null;
    }

    try {
      const cache = JSON.parse(cacheText);
      const isFresh = Date.now() - cache.savedAt < cacheMs;
      if ((isFresh || allowExpired) && cache.json !== undefined) {
        return cache.json;
      }
    } catch (error) {
      localStorage.removeItem(this.CacheKey(path));
    }

    return null;
  }

  static SetCachedJson(path, json) {
    localStorage.setItem(
      this.CacheKey(path),
      JSON.stringify({
        json,
        savedAt: Date.now(),
      }),
    );
  }

  static async Request(path, cacheMs = this.DEFAULT_CACHE_MS) {
    const cachedJson = this.GetCachedJson(path, cacheMs);
    if (cachedJson) {
      return cachedJson;
    }

    try {
      const response = await fetch(`${this.API_URL}/${path}`);
      //console.log(`${this.API_URL}/${path}`);

      if (!response.ok) {
        //todo: error handling
        throw new Error("Api Error");
      }

      const json = await response.json();
      this.SetCachedJson(path, json);
      return json;
    } catch (error) {
      console.error(error);
      return this.GetCachedJson(path, cacheMs, true);
    }
  }

  static async Requests(paths, cacheMs = this.DEFAULT_CACHE_MS) {
    return await Promise.all(paths.map((path) => this.Request(path, cacheMs)));
  }
}
