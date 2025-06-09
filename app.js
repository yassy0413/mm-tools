"use strict";

const API_URL = "https://api.mentemori.icu";
const WORLD_ID_KEY = "world_id";

const rankingCellContainer1 = document.querySelector('#ranking-cells-1');
const rankingCellContainer2 = document.querySelector('#ranking-cells-2');
const rankingCellContainer3 = document.querySelector('#ranking-cells-3');
const rankingCellTemplate = document.querySelector('#ranking-cell');
const worldIdInputField = $('#number_input');
const groupLabel = $('#group-label')

let rankingCellList = [];
let groups = {};
let worlds = {};
let serverMap = {};
let groupMap = {};
let worldMap = {};
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

  } catch (error) {
    console.error(error);
  }
};

const loadRanking = async () => {
  try {
    clearRankingCells();

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
    console.log(bpList);

    for (var index = 0; index < 16; ++index){
      if (bpList.length <= index){
        break;
      }

      var v = bpList[index];
      createRankingCell(rankingCellContainer1, index + 1, v.world_id, v.name, v.bp);
    }

    for (var index = 16; index < 32; ++index){
      if (bpList.length <= index){
        break;
      }

      var v = bpList[index];
      createRankingCell(rankingCellContainer2, index + 1, v.world_id, v.name, v.bp);
    }

    for (var index = 32; index < 48; ++index){
      if (bpList.length <= index){
        break;
      }

      var v = bpList[index];
      createRankingCell(rankingCellContainer3, index + 1, v.world_id, v.name, v.bp);
    }
    

  } catch (error) {
    console.error(error);
  }
};

const createRankingCell = (container, rank, worldId, guildName, bp) => {
  let clone = rankingCellTemplate.content.cloneNode(true);
  clone.querySelector('.rankcell-rank').innerHTML = `${rank}`;
  clone.querySelector('.rankcell-world').innerHTML = `${serverMap[Math.floor(worldId / 1000)]}${worldId % 1000}`;
  clone.querySelector('.rankcell-guildname').innerHTML = guildName;
  clone.querySelector('.rankcell-bp').innerHTML = Number(bp).toLocaleString();
  container.appendChild(clone);

  const li = clone.querySelector('li');
  rankingCellList.push(li);
};

const clearRankingCells = () => {
  for (const cell of rankingCellList) {
    if (cell.parentNode) {
      cell.parentNode.removeChild(cell);
    }
  }
  rankingCellList.length = 0;
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

$(document).ready(async () => {
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
    localStorage.setItem(WORLD_ID_KEY, worldId);
    loadRanking();
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
