export class UI {
  rankingCellTemplate = document.querySelector("#ranking-cell");
  guildRankingCellContainer1 = $("#ranking-cells-1");
  guildRankingCellContainer2 = $("#ranking-cells-2");
  guildRankingCellContainer3 = $("#ranking-cells-3");
  playerRankingCellContainer = $("#bp-cells");
  worldIdInputField = $("#number_input");
  submitButton = $("#Submit");
  submitButtonLabel = $("#Submit i.material-icons");
  headerTitleLabelA = $("#header-title-a");
  headerTitleLabelB = $("#header-title-b");
  guildNameLabel = $("#guild-name");
  groupLabel = $("#group-label");
  contentExplain = $("#content-explain");
  contentTools = $("#content-tools");
  contentResources = $("#content-resources");
  contentRankings = $("#content-rankings");
  contentBpList = $("#content-bplist");

  guildRankingCellList = [];
  playerRankingCellList = [];

  constructor() {
    this.contentExplain.hide();
    this.contentTools.hide();
    this.contentResources.hide();
    this.contentBpList.hide();
    this.contentRankings.hide();
    this.headerTitleLabelA.show();
    this.headerTitleLabelB.hide();

    M.AutoInit();

    $("#content-root").show();
    this.contentExplain.fadeIn(500);
    this.contentTools.fadeIn(500);
    this.contentResources.fadeIn(500);
  }

  updateGroupLabel(groupId) {
    if (groupId < 1) {
      this.groupLabel.text(`Not\nExists`);
      return;
    }

    this.groupLabel.text(`Group\n${groupId}`);
  }

  setSubmitButtonEnabled(enabled) {
    this.submitButton.prop("disabled", !enabled);
  }

  clearElementList(list) {
    for (const cell of list) {
      if (cell.parentNode) {
        cell.parentNode.removeChild(cell);
      }
    }
    list.length = 0;
  }

  renderGuildCell(
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

  renderPlayerCell(container, rank, playerName, bp) {
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
