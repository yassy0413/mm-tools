import TtlCache from './TtlCache'

const cache = new TtlCache<number>((x) => `gsheet_csv_${x}`)

export default class GSheet {
  static URL =
    'https://docs.google.com/spreadsheets/d/15bxBeoWfO4R1b1u5OlohpwCsZLmWEUOaXwrsT9h0eYg/export?format=csv&gid='

  static async Request(
    gid: number,
    cacheMs = TtlCache.DEFAULT_CACHE_MS,
  ): Promise<string> {
    const cachedCsv = cache.get(gid, cacheMs)
    if (cachedCsv) {
      return cachedCsv
    }

    try {
      const response = await fetch(`${this.URL}${gid}`)
      console.log(`${this.URL}${gid}`)

      if (!response.ok) {
        throw new Error('Api Error')
      }

      const csv = await response.text()
      cache.set(gid, csv)
      return csv
    } catch (error) {
      console.error(error)
      return cache.get(gid, cacheMs, true)
    }
  }

  static ParseCsv(csvText: string) {
    const rows: string[][] = []
    let row: string[] = []
    let cell = ''
    let inQuotes = false

    const pushCell = () => {
      row.push(cell)
      cell = ''
    }

    const pushRow = () => {
      pushCell()
      rows.push(row)
      row = []
    }

    for (let index = 0; index < csvText.length; index += 1) {
      const char = csvText[index]
      const nextChar = csvText[index + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"'
          index += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        pushCell()
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        pushRow()
        if (char === '\r' && nextChar === '\n') {
          index += 1
        }
      } else {
        cell += char
      }
    }

    if (cell !== '' || row.length > 0) {
      pushRow()
    }

    return rows
  }
}
