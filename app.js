"use strict";

const API_URL = "https://api.mentemori.icu";
const WORLD_ID_KEY = "world_id";

$(document).ready(async () => {
  const rankingCellContainer1 = $('#ranking-cells-1');
  const rankingCellContainer2 = $('#ranking-cells-2');
  const rankingCellContainer3 = $('#ranking-cells-3');
  const bpCellContainer = $('#bp-cells');
  const submitButtonTextElement = $('#Submit i.material-icons');
  const headerTitleElement = $('#header-title');
  const guildNameElement = $('#guild-name');
  const rankingCellTemplate = document.querySelector('#ranking-cell');
  const worldIdInputField = $('#number_input');
  const groupLabel = $('#group-label')
  const contentExplain = $('#content-explain');
  const contentRankings = $('#content-rankings');
  const contentBpList = $('#content-bplist');

  let rankingCellList = [];
  let bpCellList = [];
  let groups = {};
  let worlds = {};
  let serverMap = {};
  let groupMap = {};
  let worldMap = {};
  let guildMap = {};
  let guildWorldIdSet = new Set();
  let regionId = 1;
  let groupId = 0;
  let worldId = 0;

  const loadWorld = async () => {
    try {
      const [wgroupsRes, worldsRes] = await Promise.all([
        fetch(`${API_URL}/wgroups`),
        fetch(`${API_URL}/worlds`),
      ]);

      if (!wgroupsRes.ok || !worldsRes.ok) {
        throw new Error("1つ以上のAPI呼び出しに失敗しました");
      }

      const [wgroupsData, worldsData] = await Promise.all([
        wgroupsRes.json(),
        worldsRes.json(),
      ]);

      groups = wgroupsData;
      worlds = worldsData;

      serverMap = {};
      for (const world of worlds.data){
        const regionId = Math.floor(world.world_id / 1000);
        if (!(regionId in serverMap)){
          serverMap[regionId] = world.server;
        }
      }

      groupMap = {};
      worldMap = {};
      for (const group of groups.data){
        groupMap[group.group_id] = group.worlds;
        for (const worldId of group.worlds){
          worldMap[worldId] = group.group_id;
        }
      }

      submitButtonTextElement.text('refresh');

    } catch (error) {
      console.error(error);
    }
  };

  const loadGuildRanking = async () => {
    try {
      const group = groupMap[groupId];
      if (group == undefined){
        return;
      }

      const fetchList = $.map(group, (worldId) => {
        return fetch(`${API_URL}/${worldId}/guild_ranking/latest`);
      });
      const responses = await Promise.all(fetchList);
      const jsonDataList = await Promise.all($.map(responses, response => response.json()));

      let bpList = [];
      $.each(jsonDataList, (_, jsonData) => {
        const worldId = jsonData.data.world_id;
        bpList = bpList.concat($.map(jsonData.data.rankings.bp, bpEntry => {
          return {
            ...bpEntry,
            world_id: worldId
          };
        }));
      });
      bpList.sort((a, b) => b.bp - a.bp);

      clearElementList(rankingCellList);

      for (var index = 0; index < 16; ++index){
        if (bpList.length <= index){
          break;
        }

        var v = bpList[index];
        createGuildCell(rankingCellContainer1, index + 1, v.world_id, v.name, v.id, v.bp);
      }

      for (var index = 16; index < 32; ++index){
        if (bpList.length <= index){
          break;
        }

        var v = bpList[index];
        createGuildCell(rankingCellContainer2, index + 1, v.world_id, v.name, v.id, v.bp);
      }

      for (var index = 32; index < 48; ++index){
        if (bpList.length <= index){
          break;
        }

        var v = bpList[index];
        createGuildCell(rankingCellContainer3, index + 1, v.world_id, v.name, v.id, v.bp);
      }

      contentExplain.hide();
      contentRankings.show();
      

    } catch (error) {
      console.error(error);
    }
  };

  const loadPlayerRanking = async (worldId, guildId, guildName) => {

    if (!guildWorldIdSet.has(worldId)){
      const response = await fetch(`${API_URL}/${worldId}/player_ranking/latest`);
      const jsonData = await response.json();
      const players = Object.values(jsonData.data.player_info).sort((a, b) => b.bp - a.bp);

      Object.assign(guildMap, players.reduce((groups, player) => {
        const guildId = player.guild_id;
        if (!groups[guildId]) {
          groups[guildId] = [];
        }
        groups[guildId].push(player);
        return groups;
      }, {}));

      guildWorldIdSet.add(worldId);
    }

    clearElementList(bpCellList);

    let count = 0;
    for (const player of guildMap[guildId]){
      createPlayerCell(bpCellContainer, ++count, player.name, player.bp);
    }

    guildNameElement.text(guildName);

    //
    contentRankings.hide();
    contentBpList.show();
    submitButtonTextElement.text('close');
    headerTitleElement.text('何らかのランキングにエントリーしているプレーヤーのリスト');
  };

  const clearElementList = (list) => {
    for (const cell of list) {
      if (cell.parentNode) {
        cell.parentNode.removeChild(cell);
      }
    }
    list.length = 0;
  };

  const createGuildCell = (container, rank, worldId, guildName, guildId, bp) => {
    const clone = rankingCellTemplate.content.cloneNode(true);
    const li = clone.querySelector('li');
    li.querySelector('.rankcell-rank').innerHTML = `${rank}`;
    li.querySelector('.rankcell-world').innerHTML = `${serverMap[Math.floor(worldId / 1000)]}${worldId % 1000}`;
    li.querySelector('.rankcell-guildname').innerHTML = guildName;
    li.querySelector('.rankcell-bp').innerHTML = Number(bp).toLocaleString();
    li.addEventListener('click', () => {
      loadPlayerRanking(worldId, guildId, guildName);
    });
    rankingCellList.push(li);
    container.append(clone);
  };

  const createPlayerCell = (container, rank, playerName, bp) => {
    const clone = rankingCellTemplate.content.cloneNode(true);
    const li = clone.querySelector('li');
    li.querySelector('.rankcell-rank').innerHTML = `${rank}`;
    li.querySelector('.rankcell-world').innerHTML = ``;
    li.querySelector('.rankcell-guildname').innerHTML = playerName;
    li.querySelector('.rankcell-bp').innerHTML = Number(bp).toLocaleString();
    bpCellList.push(li);
    container.append(clone);
  };

  const updateGroupLabel = () => {
    groupId = worldMap[worldId + regionId * 1000];
    if (groupId == undefined){
      groupId = 0;
    }

    if (groupId < 0){
      groupLabel.text('');
      return;
    }

    groupLabel.text(`Group${groupId}`);
  };

  contentExplain.hide();
  contentExplain.fadeIn(500);
  contentRankings.hide();
  contentBpList.hide();

  M.AutoInit();
  await loadWorld();

  // World number input field
  worldIdInputField.on('input', function(){
    const val = parseInt($(this).val(), 10);
    if (isNaN(val)) {
      return;
    }
    worldId = val;
    updateGroupLabel();
  });

  const value = localStorage.getItem(WORLD_ID_KEY);
  if (value != undefined){
    worldIdInputField.val(value);
    worldIdInputField.siblings('label').addClass('active');
    worldId = parseInt(value, 10);
    updateGroupLabel();
  }

  // Submit button
  $('#Submit').on('click', function(event) {
    if (submitButtonTextElement.text() == 'close'){
      contentBpList.hide();
      contentRankings.show();
      submitButtonTextElement.text('refresh');
      headerTitleElement.text('Group Guild Bp Ranking');
    }else{
      localStorage.setItem(WORLD_ID_KEY, worldId);
      loadGuildRanking();
    }
  });

  // Dropdown Server
  const $dropdown = $('#dropdown-servers');
  $dropdown.empty();
  for (const key in serverMap){
    $dropdown.append(`<li><a href="#!">${serverMap[key]}</a></li>`);
  }

  $('.dropdown-trigger').dropdown();

  $('#dropdown-servers li a').click(function () {
    const selectedText = $(this).text();
    $('#dropdownButton').contents().first()[0].nodeValue = selectedText;

    regionId = Object.keys(serverMap).find(key => serverMap[key] === selectedText);
    updateGroupLabel();
  });
});
