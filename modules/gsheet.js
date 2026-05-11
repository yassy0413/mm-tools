class EquipmentData {
  constructor(value = 0, additionalValue = 0) {
    this.value = Number(value) || 0;
    this.additional_value = Number(additionalValue) || 0;
  }
}

class EquipmentDataGroup {
  constructor(row) {
    this.datalist = [];

    // 1列目がLvなので、データ開始は 1
    this.addData(row, 1);
    this.addData(row, 10);
    this.addData(row, 19);
    this.addData(row, 28);
    this.addData(row, 37);
  }

  addData(row, beginColumn) {
    const v = row.slice(beginColumn, beginColumn + 8);

    this.datalist.push(new EquipmentData(v[0], v[1]));
    this.datalist.push(new EquipmentData(v[2], v[3]));
    this.datalist.push(new EquipmentData(v[4], v[5]));
    this.datalist.push(new EquipmentData(v[6], v[7]));
  }
}

class PlayerData {
  constructor(row) {
    this.ranking = Number(row[0]);
    this.world = row[1];
    this.name = row[2];
    this.bp = Number(row[3].replace(/,/g, ""));
    this.rank = Number(row[4]);
    this.quest = row[5];
    this.tower = Number(row[6]);
    this.towerRed = Number(row[7]);
    this.towerBlue = Number(row[8]);
    this.towerGreen = Number(row[9]);
    this.towerYellow = Number(row[10]);
    this.guildName = row[11];
    this.leagueUnit1 = row[12];
    this.leagueUnit2 = row[13];
    this.leagueUnit3 = row[14];
    this.leagueUnit4 = row[15];
    this.leagueUnit5 = row[16];
  }
}

export class GSheet {
  static URL =
    "https://docs.google.com/spreadsheets/d/15bxBeoWfO4R1b1u5OlohpwCsZLmWEUOaXwrsT9h0eYg/export?format=csv&gid=";
  static DEFAULT_CACHE_MS = 24 * 60 * 60 * 1000;

  static CacheKey(gid) {
    return `gsheet_csv_${gid}`;
  }

  static GetCachedCsv(gid, cacheMs = this.DEFAULT_CACHE_MS, allowExpired = false) {
    const cacheText = localStorage.getItem(this.CacheKey(gid));
    if (!cacheText) {
      return null;
    }

    try {
      const cache = JSON.parse(cacheText);
      const isFresh = Date.now() - cache.savedAt < cacheMs;
      if ((isFresh || allowExpired) && typeof cache.csv === "string") {
        return cache.csv;
      }
    } catch (error) {
      localStorage.removeItem(this.CacheKey(gid));
    }

    return null;
  }

  static SetCachedCsv(gid, csv) {
    localStorage.setItem(
      this.CacheKey(gid),
      JSON.stringify({
        csv,
        savedAt: Date.now(),
      }),
    );
  }

  static async Request(gid, cacheMs = this.DEFAULT_CACHE_MS) {
    const cachedCsv = this.GetCachedCsv(gid, cacheMs);
    if (cachedCsv) {
      return cachedCsv;
    }

    try {
      const response = await fetch(`${this.URL}${gid}`);
      console.log(`${this.URL}${gid}`);

      if (!response.ok) {
        throw new Error("Api Error");
      }

      const csv = await response.text();
      this.SetCachedCsv(gid, csv);
      return csv;
    } catch (error) {
      console.error(error);
      return this.GetCachedCsv(gid, cacheMs, true);
    }
  }

  static ParseCsv(csvText) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    const pushCell = () => {
      row.push(cell);
      cell = "";
    };

    const pushRow = () => {
      pushCell();
      rows.push(row);
      row = [];
    };

    for (let index = 0; index < csvText.length; index += 1) {
      const char = csvText[index];
      const nextChar = csvText[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        pushCell();
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        pushRow();
        if (char === "\r" && nextChar === "\n") {
          index += 1;
        }
      } else {
        cell += char;
      }
    }

    if (cell !== "" || row.length > 0) {
      pushRow();
    }

    return rows;
  }

  static async RequestEquipment() {
    const equipmentCsv = await this.Request("1773042965");

    if (!equipmentCsv) {
      return null;
    }

    const rows = this.ParseCsv(equipmentCsv);
    const dataRows = rows.slice(4);

    const equipmentMap = new Map(
      dataRows.map((row) => [
        Number(row[0]), // Lv
        new EquipmentDataGroup(row),
      ]),
    );
    
    return equipmentMap;
  }

  static async RequestBpRanking() {
    const bpRankingCsv = await this.Request("0");

    if (!bpRankingCsv) {
      return null;
    }

    const rows = this.ParseCsv(bpRankingCsv);
    const dataRows = rows.slice(2);

    const bpRankingList = dataRows.map((v) => new PlayerData(v));
    const lastUpdated = rows[0][0].replace("LastUpdated:", "データ最終更新：");

    return {
      bpRankingList,
      lastUpdated,
    };
  }
}
