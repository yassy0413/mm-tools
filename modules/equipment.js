("use strict");
import { GSheet } from "./gsheet.js";

const SLOT_TYPE_KEY = "equipment_slottype";
const METATRON_LEVEL_KEY = "equipment_metatron_level";
const DEFAULT_METATRON_LEVEL = 240;
const slotTypeMap = ["飾", "手", "頭", "胴", "足"];
let equipmentMap = new Map();
let levelList = [];
let selectedSlotTypeIndex = 0;
let $slotTypeLabel = null;
let equipmentRows = [];

const getEquipmentData = (level, rarity) => {
  const equipmentGroup = equipmentMap.get(Number(level));
  const dataIndex = selectedSlotTypeIndex * 4 + (4 - rarity);
  return equipmentGroup?.datalist[dataIndex];
};

const formatNumber = (value) => value?.toLocaleString() ?? "-";

const getRarityFromDropdown = ($dropdownLevel) => {
  const dropdownLevelId = $dropdownLevel.attr("id");
  return Number(dropdownLevelId.split("-").pop());
};

const findClosestLevelByValue = (targetValue, rarity) => {
  let closestLevel = null;
  let closestDiff = Infinity;

  for (const level of levelList) {
    const data = getEquipmentData(level, rarity);
    if (!data) {
      continue;
    }

    const diff = Math.abs(data.value - targetValue);
    if (diff < closestDiff) {
      closestLevel = level;
      closestDiff = diff;
    }
  }

  return closestLevel;
};

const syncLevelsByValue = (changedLevel, changedRarity) => {
  const changedData = getEquipmentData(changedLevel, changedRarity);
  if (!changedData) {
    return;
  }

  for (const row of equipmentRows) {
    if (row.rarity === changedRarity) {
      continue;
    }

    const closestLevel = findClosestLevelByValue(changedData.value, row.rarity);
    if (closestLevel !== null) {
      row.$levelLabel.text(closestLevel);
    }
  }
};

const getMetatronRow = () => equipmentRows.find((row) => row.rarity === 1);

const saveSlotType = (slotType) => {
  localStorage.setItem(SLOT_TYPE_KEY, slotType);
};

const saveMetatronLevel = (level) => {
  localStorage.setItem(METATRON_LEVEL_KEY, level);
};

const restoreSavedSelection = () => {
  const savedSlotType = localStorage.getItem(SLOT_TYPE_KEY);
  if (slotTypeMap.includes(savedSlotType)) {
    selectedSlotTypeIndex = slotTypeMap.indexOf(savedSlotType);
    $slotTypeLabel.text(savedSlotType);
  }

  const metatronRow = getMetatronRow();
  const savedMetatronLevel = Number(localStorage.getItem(METATRON_LEVEL_KEY));
  const metatronLevel = levelList.includes(savedMetatronLevel) ? savedMetatronLevel : DEFAULT_METATRON_LEVEL;
  if (metatronRow && levelList.includes(metatronLevel)) {
    metatronRow.$levelLabel.text(metatronLevel);
  }

  if (metatronRow) {
    syncLevelsByValue(metatronRow.$levelLabel.text(), metatronRow.rarity);
  }
};

const cacheElements = () => {
  $slotTypeLabel = $("#dropdown-slottype-label");
  equipmentRows = $(".dropdown-level")
    .toArray()
    .map((dropdownLevel) => {
      const $dropdownLevel = $(dropdownLevel);
      const $row = $dropdownLevel.closest(".row");

      return {
        $levelLabel: $row.find(".dropdown-level-label"),
        $value: $row.find(".equipment-value-1"),
        $additionalValue: $row.find(".equipment-value-2"),
        rarity: getRarityFromDropdown($dropdownLevel),
      };
    });
};

const refreshValues = () => {
  for (const row of equipmentRows) {
    const level = row.$levelLabel.text();
    const data = getEquipmentData(level, row.rarity);

    row.$value.text(`武具固有値\n${formatNumber(data?.value)}`);
    row.$additionalValue.text(`追加効果\n${formatNumber(data?.additional_value)}`);
  }
};

const scrollLevelDropdownToSelected = ($button) => {
  const dropdownId = $button.attr("data-target");
  const $dropdown = $(`#${dropdownId}`);
  const selectedLevel = $button.find(".dropdown-level-label").text();
  const selectedItem = $dropdown
    .find("li a")
    .toArray()
    .find((item) => $(item).text() === selectedLevel);

  if (!selectedItem) {
    return;
  }

  const itemTop = selectedItem.offsetTop;
  const centerOffset = ($dropdown.innerHeight() - selectedItem.offsetHeight) / 2;
  $dropdown.scrollTop(Math.max(0, itemTop - centerOffset));
};

const initDropdownSlotType = () => {
  const $dropdown = $("#dropdown-slottype");
  $dropdown.empty();
  for (const slotType of slotTypeMap) {
    $dropdown.append(`<li><a href="#!">${slotType}</a></li>`);
  }

  $("#dropdown-slottype-button").dropdown({
    coverTrigger: false,
  });

  $("#dropdown-slottype li a").click(function () {
    const selectedText = $(this).text();
    selectedSlotTypeIndex = slotTypeMap.indexOf(selectedText);
    $slotTypeLabel.text(selectedText);
    saveSlotType(selectedText);
    const baseRow = getMetatronRow();
    if (baseRow) {
      syncLevelsByValue(baseRow.$levelLabel.text(), baseRow.rarity);
    }
    refreshValues();
  });
};

const initDropdownLevel = () => {
  $(".dropdown-level").each(function () {
    const $dropdown = $(this);
    $dropdown.empty();

    for (const level of levelList) {
      $dropdown.append(`<li><a href="#!">${level}</a></li>`);
    }

    const firstLevel = levelList[0];
    if (firstLevel !== undefined) {
      $dropdown.siblings(".dropdown-level-button").find(".dropdown-level-label").text(firstLevel);
    }
  });

  $(".dropdown-level-button").dropdown({
    coverTrigger: false,
    onOpenEnd: (trigger) => {
      scrollLevelDropdownToSelected($(trigger));
    },
  });

  $(".dropdown-level li a").click(function () {
    const selectedText = $(this).text();
    const $dropdownLevel = $(this).closest(".dropdown-level");
    const changedRarity = getRarityFromDropdown($dropdownLevel);
    $dropdownLevel.siblings(".dropdown-level-button").find(".dropdown-level-label").text(selectedText);

    if (changedRarity === 1) {
      saveMetatronLevel(selectedText);
    }
    syncLevelsByValue(selectedText, changedRarity);
    refreshValues();
  });
};

$(document).ready(async () => {
  equipmentMap = await GSheet.RequestEquipment() || new Map();
  levelList = [...equipmentMap.keys()];

  initDropdownSlotType();
  initDropdownLevel();
  cacheElements();
  restoreSavedSelection();
  refreshValues();
});
