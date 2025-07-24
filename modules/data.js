import { Api } from "./api.js";

export class Data {
  groups = {};
  worlds = {};
  regionMap = {};
  groupMap = {};
  worldMap = {};
  guildMap = {};
  guildWorldIdSet = new Set();
  regionId = 1;
  groupId = 0;
  worldId = 0;

  updateGroupId() {
    this.groupId = this.worldMap[this.worldId + this.regionId * 1000] ?? 0;
  }

  setWorldId(id) {
    if (isNaN(id)) {
      return;
    }
    this.worldId = id;
    this.updateGroupId();
  }

  setRegionId(id) {
    if (isNaN(id)) {
      return;
    }
    this.regionId = id;
    this.updateGroupId();
  }

  async loadWorld() {
    const [wgroupsData, worldsData] = await Api.Requests(["wgroups", "worlds"]);

    this.groups = wgroupsData;
    this.worlds = worldsData;

    this.regionMap = {};
    for (const world of this.worlds.data) {
      const regionId = Math.floor(world.world_id / 1000);
      if (!(regionId in this.regionMap)) {
        this.regionMap[regionId] = world.server;
      }
    }

    this.groupMap = {};
    this.worldMap = {};
    for (const group of this.groups.data) {
      this.groupMap[group.group_id] = group.worlds;
      for (const worldId of group.worlds) {
        this.worldMap[worldId] = group.group_id;
      }
    }
  }

  async loadGuildRanking() {
    const group = this.groupMap[this.groupId];
    if (group == undefined) {
      return [];
    }

    const jsonDataList = await Api.Requests(
      group.map((worldId) => `${worldId}/guild_ranking/latest`)
    );

    let bpList = [];
    $.each(jsonDataList, (_, jsonData) => {
      const worldId = jsonData.data.world_id;
      bpList = bpList.concat(
        $.map(jsonData.data.rankings.bp, (bpEntry) => {
          return {
            ...bpEntry,
            world_id: worldId,
          };
        })
      );
    });
    bpList.sort((a, b) => b.bp - a.bp);

    return bpList;
  }

  async loadPlayerRanking(worldId, guildId) {
    if (!this.guildWorldIdSet.has(worldId)) {
      const jsonData = await Api.Request(`${worldId}/player_ranking/latest`);

      const bpRankings = jsonData.data.rankings.bp ?? [];
      const playerInfoMap = jsonData.data.player_info ?? {};

      const players = bpRankings.map((x) => {
        return {
          ...x,
          ...(playerInfoMap[String(x.id)] || {}),
        };
      });

      Object.assign(
        this.guildMap,
        players.reduce((groups, player) => {
          const guildId = player.guild_id;
          if (!groups[guildId]) {
            groups[guildId] = [];
          }
          groups[guildId].push(player);
          return groups;
        }, {})
      );

      this.guildWorldIdSet.add(worldId);
    }

    if (!this.guildMap[guildId]) {
      return null;
    }

    return this.guildMap[guildId];
  }
}
