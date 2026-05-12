("use strict");
import { GSheet } from "./gsheet.js";

const SLOT_TYPE_KEY = "equipment_slottype";
const METATRON_LEVEL_KEY = "equipment_metatron_level";
const DEFAULT_METATRON_LEVEL = 240;
const slotTypeMap = ["飾", "手", "頭", "胴", "足"];
let equipmentMap = new Map();
let levelList = [];
let selectedSlotTypeIndex = 0;
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
      row.$levelControl.val(String(closestLevel));
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
    $("#dropdown-slottype").val(savedSlotType);
  }

  const metatronRow = getMetatronRow();
  const savedMetatronLevel = Number(localStorage.getItem(METATRON_LEVEL_KEY));
  const metatronLevel = levelList.includes(savedMetatronLevel) ? savedMetatronLevel : DEFAULT_METATRON_LEVEL;
  if (metatronRow && levelList.includes(metatronLevel)) {
    metatronRow.$levelControl.val(String(metatronLevel));
  }

  if (metatronRow) {
    syncLevelsByValue(metatronRow.$levelControl.val(), metatronRow.rarity);
  }
};

const cacheElements = () => {
  equipmentRows = $(".dropdown-level")
    .toArray()
    .map((dropdownLevel) => {
      const $dropdownLevel = $(dropdownLevel);
      const $row = $dropdownLevel.closest(".row");

      return {
        $levelControl: $dropdownLevel,
        $value: $row.find(".equipment-value-1"),
        $additionalValue: $row.find(".equipment-value-2"),
        rarity: getRarityFromDropdown($dropdownLevel),
      };
    });
};

const refreshValues = () => {
  for (const row of equipmentRows) {
    const level = row.$levelControl.val();
    const data = getEquipmentData(level, row.rarity);

    row.$value.empty().append($("<span>").addClass("equipment-value-tittle").text("武具固有値"), "\n", formatNumber(data?.value));
    row.$additionalValue.empty().append($("<span>").addClass("equipment-value-tittle").text("追加効果"), "\n", formatNumber(data?.additional_value));
  }
};

const initDropdownSlotType = () => {
  const $dropdown = $("#dropdown-slottype");
  $dropdown.empty();
  for (const slotType of slotTypeMap) {
    $dropdown.append(`<option value="${slotType}">${slotType}</option>`);
  }
  $dropdown.val(slotTypeMap[selectedSlotTypeIndex]);

  $dropdown.on("change", function () {
    const selectedText = $(this).val();
    selectedSlotTypeIndex = slotTypeMap.indexOf(selectedText);
    saveSlotType(selectedText);
    const baseRow = getMetatronRow();
    if (baseRow) {
      syncLevelsByValue(baseRow.$levelControl.val(), baseRow.rarity);
    }
    refreshValues();
  });
};

const initDropdownLevel = () => {
  $(".dropdown-level").each(function () {
    const $dropdown = $(this);
    $dropdown.empty();

    for (const level of levelList) {
      $dropdown.append(`<option value="${level}">${level}</option>`);
    }

    const firstLevel = levelList[0];
    if (firstLevel !== undefined) {
      $dropdown.val(String(firstLevel));
    }
  });

  $(".dropdown-level").on("change", function () {
    const $dropdownLevel = $(this);
    const selectedValue = $dropdownLevel.val();
    const changedRarity = getRarityFromDropdown($dropdownLevel);

    if (changedRarity === 1) {
      saveMetatronLevel(selectedValue);
    }
    syncLevelsByValue(selectedValue, changedRarity);
    refreshValues();
  });
};

$(document).ready(async () => {
  equipmentMap = (await GSheet.RequestEquipment()) || new Map();
  levelList = [...equipmentMap.keys()];

  initDropdownSlotType();
  initDropdownLevel();
  cacheElements();
  restoreSavedSelection();
  refreshValues();
});
