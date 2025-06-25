export class UI {
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