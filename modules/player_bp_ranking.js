("use strict");
import { GSheet } from "./gsheet.js";
import { initGuardedDropdown } from "./materialize-dropdown-guard.js";

const CURRENT_REGION_KEY = "player_bp_ranking_region";
const WORLD_ID_KEY = "player_bp_ranking_world_id";
const GUILD_NAME_KEY = "player_bp_ranking_guild_name";

let $rankingCellTemplate;
let $playerBpRankingContainer;
let $lastUpdatedLabel;
let bpRankingList = [];
let currentRegion = "";
let currentWorldId = "";
let currentGuildName = "";

const formatNumber = (value) => Number(value).toLocaleString();
const formatTowerNumber = (value) => Number(value) === 0 ? "" : value;
const getRegionText = (value) =>
  String(value ?? "")
    .match(/[a-zA-Z]+/)?.[0]
    ?.toUpperCase() ?? "";

const playerDataColumns = [
  { key: "ranking", className: "ranking" },
  { key: "world", className: "world" },
  { key: "name", className: "name" },
  { key: "bp", className: "bp", format: formatNumber },
  { key: "rank", className: "player-rank" },
  { key: "quest", className: "quest" },
  { key: "tower", className: "tower", format: formatTowerNumber },
  { key: "towerRed", className: "tower-red", format: formatTowerNumber },
  { key: "towerBlue", className: "tower-blue", format: formatTowerNumber },
  { key: "towerGreen", className: "tower-green", format: formatTowerNumber },
  { key: "towerYellow", className: "tower-yellow", format: formatTowerNumber },
  { key: "guildName", className: "guild-name" },
  { key: "leagueUnit1", className: "league-unit-1" },
  { key: "leagueUnit2", className: "league-unit-2" },
  { key: "leagueUnit3", className: "league-unit-3" },
  { key: "leagueUnit4", className: "league-unit-4" },
  { key: "leagueUnit5", className: "league-unit-5" },
];

const createPlayerDataRow = (playerData) => {
  const clone = $rankingCellTemplate.content.cloneNode(true);
  const row = clone.querySelector("tr");
  const cells = row.children;

  playerDataColumns.forEach((column, index) => {
    const value = playerData[column.key];
    cells[index].textContent = column.format ? column.format(value) : value;
  });

  return clone;
};

const clearPlayerData = () => {
  $playerBpRankingContainer.replaceChildren();
};

const initRegionDropdown = (regionList) => {
  const $dropdown = $("#dropdown-servers");
  const $dropdownButton = $("#dropdownButton");
  $dropdown.empty();

  regionList = bpRankingList.map((playerData) => playerData.world);
  regionList = [...new Set(regionList.map(getRegionText).filter(Boolean))];
  regionList.unshift("");
  for (const region of regionList) {
    $dropdown.append(`<li><a href="#!">${region}</a></li>`);
  }

  const setCurrentRegion = (region) => {
    currentRegion = region;
    localStorage.setItem(CURRENT_REGION_KEY, currentRegion);
    $dropdownButton.contents().first()[0].nodeValue = currentRegion;
  };

  const savedRegionValue = localStorage.getItem(CURRENT_REGION_KEY);
  const savedRegion = getRegionText(savedRegionValue);
  const buttonRegion = getRegionText($dropdownButton.contents().first()[0]?.nodeValue);
  const initialRegion = savedRegionValue !== null ? savedRegion : buttonRegion;
  setCurrentRegion(regionList.includes(initialRegion) ? initialRegion : "");

  initGuardedDropdown($dropdownButton, $dropdown);

  $("#dropdown-servers li a")
    .off("click.region")
    .on("click.region", (event) => {
      setCurrentRegion($(event.currentTarget).text());
      refreshPlayerList();
    });
};

const initWorldIdInputField = () => {
  const $inputField = $("#number_input");

  $inputField.on("input", (event) => {
    currentWorldId = $(event.currentTarget).val();
    localStorage.setItem(WORLD_ID_KEY, currentWorldId);
    refreshPlayerList();
  });

  currentWorldId = localStorage.getItem(WORLD_ID_KEY) || "";
  $inputField.val(currentWorldId);
  $inputField.siblings("label").addClass("active");
};

const initGuildNameInputField = () => {
  const $inputField = $("#guild_name_input");

  $inputField.on("input", (event) => {
    currentGuildName = $(event.currentTarget).val();
    localStorage.setItem(GUILD_NAME_KEY, currentGuildName);
    refreshPlayerList();
  });

  currentGuildName = localStorage.getItem(GUILD_NAME_KEY) || "";
  $inputField.val(currentGuildName);
  if (currentGuildName) {
    $inputField.siblings("label").addClass("active");
  }
};

const refreshPlayerList = () => {
  const fragment = document.createDocumentFragment();
  const worldId = String(currentWorldId ?? "").trim();
  const region = getRegionText(currentRegion);
  const guildName = String(currentGuildName ?? "")
    .trim()
    .toLowerCase();

  clearPlayerData();

  let count = 0;
  for (const playerData of bpRankingList) {
    const world = String(playerData.world ?? "");
    const playerGuildName = String(playerData.guildName ?? "").toLowerCase();
    if (region && getRegionText(world) !== region) continue;
    if (worldId && world.match(/\d+/)?.[0] !== worldId) continue;
    if (guildName && !playerGuildName.includes(guildName)) continue;

    fragment.append(createPlayerDataRow(playerData));

    if (++count >= 1000) break;
  }

  $playerBpRankingContainer.append(fragment);
};

$(document).ready(async () => {
  const { bpRankingList: bpRankingListData = [], lastUpdated = "" } = (await GSheet.RequestBpRanking()) || {};
  bpRankingList = bpRankingListData;

  $rankingCellTemplate = document.querySelector("#player-bp-ranking-cell");
  $playerBpRankingContainer = document.querySelector("#player-bp-ranking-container");
  $lastUpdatedLabel = $("#player-bp-ranking-last-updated");
  $lastUpdatedLabel.text(lastUpdated);

  initRegionDropdown();
  initWorldIdInputField();
  initGuildNameInputField();
  refreshPlayerList();
});
