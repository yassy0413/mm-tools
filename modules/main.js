("use strict");
import { Api } from "./api.js";
import { Data } from "./data.js";
import { UI } from "./ui.js";

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
          ui.renderGuildCell(
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
                ui.renderPlayerCell(
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
                "何らかのランキングにエントリー<br>しているプレーヤーのリスト"
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
