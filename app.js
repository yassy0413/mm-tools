"use strict";

class Api {
  static API_URL = "https://api.mentemori.icu";

  static async Request(path) {
    try {
      const response = await fetch(`${this.API_URL}/${path}`);

      if (!response.ok) {
        //todo: error handling
        throw new Error("Api Error");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  static async Requests(paths) {
    try {
      const responses = await Promise.all(
        paths.map((path) => fetch(`${this.API_URL}/${path}`))
      );

      if (responses.some((response) => !response.ok)) {
        //todo: error handling
        throw new Error("Api Error");
      }

      return await Promise.all($.map(responses, (response) => response.json()));
    } catch (error) {
      console.error(error);
    }
  }
}

class Data {
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
      const players = Object.values(jsonData.data.player_info).sort(
        (a, b) => b.bp - a.bp
      );

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

    return this.guildMap[guildId];
  }
}

class UI {
  rankingCellTemplate = document.querySelector("#ranking-cell");
  guildRankingCellContainer1 = $("#ranking-cells-1");
  guildRankingCellContainer2 = $("#ranking-cells-2");
  guildRankingCellContainer3 = $("#ranking-cells-3");
  playerRankingCellContainer = $("#bp-cells");
  worldIdInputField = $("#number_input");
  submitButtonLabel = $("#Submit i.material-icons");
  headerTitleLabel = $("#header-title");
  guildNameLabel = $("#guild-name");
  groupLabel = $("#group-label");
  contentExplain = $("#content-explain");
  contentRankings = $("#content-rankings");
  contentBpList = $("#content-bplist");

  guildRankingCellList = [];
  playerRankingCellList = [];

  constructor() {
    M.AutoInit();
    this.contentExplain.hide();
    this.contentBpList.hide();
    this.contentRankings.hide();
    this.contentExplain.fadeIn(500);
  }

  updateGroupLabel(groupId) {
    if (groupId < 1) {
      this.groupLabel.text("");
      return;
    }

    this.groupLabel.text(`Group${groupId}`);
  }

  clearElementList(list) {
    for (const cell of list) {
      if (cell.parentNode) {
        cell.parentNode.removeChild(cell);
      }
    }
    list.length = 0;
  }

  createGuildCell(
    container,
    rank,
    worldId,
    guildName,
    guildId,
    bp,
    serverName,
    onSelect
  ) {
    const clone = this.rankingCellTemplate.content.cloneNode(true);
    const li = clone.querySelector("li");
    li.querySelector(".rankcell-rank").innerHTML = `${rank}`;
    li.querySelector(".rankcell-world").innerHTML = serverName;
    li.querySelector(".rankcell-guildname").innerHTML = guildName;
    li.querySelector(".rankcell-bp").innerHTML = Number(bp).toLocaleString();
    li.addEventListener("click", onSelect);
    this.guildRankingCellList.push(li);
    container.append(clone);
  }

  createPlayerCell(container, rank, playerName, bp) {
    const clone = this.rankingCellTemplate.content.cloneNode(true);
    const li = clone.querySelector("li");
    li.querySelector(".rankcell-rank").innerHTML = `${rank}`;
    li.querySelector(".rankcell-world").innerHTML = ``;
    li.querySelector(".rankcell-guildname").innerHTML = playerName;
    li.querySelector(".rankcell-bp").innerHTML = Number(bp).toLocaleString();
    this.playerRankingCellList.push(li);
    container.append(clone);
  }
}

$(document).ready(async () => {
  const WORLD_ID_KEY = "world_id";

  const data = new Data();
  const ui = new UI();

  await data.loadWorld();
  ui.submitButtonLabel.text("refresh");

  // World number input field
  ui.worldIdInputField.on("input", function () {
    data.setWorldId(parseInt($(this).val(), 10));
    ui.updateGroupLabel(data.groupId);
  });

  const value = localStorage.getItem(WORLD_ID_KEY);
  if (value != undefined) {
    data.setWorldId(parseInt(value, 10));
    ui.worldIdInputField.val(value);
    ui.worldIdInputField.siblings("label").addClass("active");
    ui.updateGroupLabel(data.groupId);
  }

  // // Submit button
  $("#Submit").on("click", async (event) => {
    if (ui.submitButtonLabel.text() == "close") {
      ui.contentBpList.hide();
      ui.contentRankings.show();
      ui.submitButtonLabel.text("refresh");
      ui.headerTitleLabel.text("Group Guild Bp Ranking");
    } else {
      localStorage.setItem(WORLD_ID_KEY, data.worldId);
      const bpList = await data.loadGuildRanking();

      const createGuildRanking = (container, startIndex) => {
        for (var index = startIndex; index < startIndex + 16; ++index) {
          if (bpList.length <= index) {
            break;
          }

          const v = bpList[index];
          const serverName = `${data.regionMap[Math.floor(v.world_id / 1000)]}${
            v.world_id % 1000
          }`;
          ui.createGuildCell(
            container,
            index + 1,
            v.world_id,
            v.name,
            v.id,
            v.bp,
            serverName,
            async () => {
              const playerBpList = await data.loadPlayerRanking(
                v.world_id,
                v.id
              );

              ui.clearElementList(ui.playerRankingCellList);

              let count = 0;
              for (const player of playerBpList) {
                ui.createPlayerCell(
                  ui.playerRankingCellContainer,
                  ++count,
                  player.name,
                  player.bp
                );
              }

              ui.guildNameLabel.text(v.name);

              ui.contentRankings.hide();
              ui.contentBpList.show();
              ui.submitButtonLabel.text("close");
              ui.headerTitleLabel.html(
                '何らかのランキングにエントリー<br>しているプレーヤーのリスト'
              );
            }
          );
        }
      };

      ui.clearElementList(ui.guildRankingCellList);
      createGuildRanking(ui.guildRankingCellContainer1, 0);
      createGuildRanking(ui.guildRankingCellContainer2, 16);
      createGuildRanking(ui.guildRankingCellContainer3, 32);

      ui.contentExplain.hide();
      ui.contentRankings.show();
    }
  });

  // // DropDown Region
  const $dropdown = $("#dropdown-servers");
  $dropdown.empty();
  for (const key in data.regionMap) {
    $dropdown.append(`<li><a href="#!">${data.regionMap[key]}</a></li>`);
  }

  $(".dropdown-trigger").dropdown();

  $("#dropdown-servers li a").click(function () {
    const selectedText = $(this).text();
    $("#dropdownButton").contents().first()[0].nodeValue = selectedText;

    data.setRegionId(
      Object.keys(data.regionMap).find(
        (key) => data.regionMap[key] === selectedText
      )
    );
    ui.updateGroupLabel(data.groupId);
  });
});
