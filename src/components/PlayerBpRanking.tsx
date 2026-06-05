import { usePlayerBpRanking } from '../context/PlayerBpRankingContext'
import { useWorld } from '../context/WorldContext'
import LoadingIndicator from './LoadingIndicator'
import styles from './PlayerBpRanking.module.css'
import type { PlayerBpRankingFilterParam } from './PlayerBpRankingFilter'

type Props = {
  filterParam: PlayerBpRankingFilterParam
}

export default function PlayerBpRanking({ filterParam }: Props) {
  const worldData = useWorld()
  const playerBpRanking = usePlayerBpRanking()

  if (playerBpRanking.loading) {
    return <LoadingIndicator />
  }

  const filterdList = () => {
    let count = 0
    return playerBpRanking.bpRankingList.filter((x) => {
      const regionId = Number(filterParam.regionId)
      if (regionId > 0) {
        if (!x.world.startsWith(worldData.regionMap[regionId])) {
          return false
        }
      }

      const worldId = Number(filterParam.worldId)
      if (worldId > 0) {
        if (worldId !== x.worldId) {
          return false
        }
      }

      if (filterParam.guildName) {
        if (!x.guildName.includes(filterParam.guildName)) {
          return false
        }
      }

      return ++count <= 1000
    })
  }

  return (
    <section className={styles.playerBpRanking}>
      <table className={`${styles.playerBpRankingTable} highlight`}>
        <thead>
          <tr className={styles.playerBpRankcellHeader}>
            <th>順位</th>
            <th>ﾜｰﾙﾄﾞ</th>
            <th>ユーザー名</th>
            <th>戦闘力</th>
            <th>ランク</th>
            <th>クエスト</th>
            <th>塔</th>
            <th>紅塔</th>
            <th>藍塔</th>
            <th>翠塔</th>
            <th>黄塔</th>
            <th>ギルド</th>
            {/* <th className="player-bp-rankcell-league-unit">レジェリ 1</th>
            <th className="player-bp-rankcell-league-unit">レジェリ 2</th>
            <th className="player-bp-rankcell-league-unit">レジェリ 3</th>
            <th className="player-bp-rankcell-league-unit">レジェリ 4</th>
            <th className="player-bp-rankcell-league-unit">レジェリ 5</th> */}
          </tr>
        </thead>
        <tbody className={styles.playerBpRankingContainer}>
          {filterdList().map((player) => (
            <tr
              key={`player-ranking-${player.ranking}`}
              className={styles.playerBpRankcell}
            >
              <td className={styles.playerBpRankcellRanking}>
                {player.ranking}
              </td>
              <td className={styles.playerBpRankcellWorld}>{player.world}</td>
              <td className={styles.playerBpRankcellName}>{player.name}</td>
              <td className={styles.playerBpRankcellBp}>
                {player.bp.toLocaleString()}
              </td>
              <td className="player-bp-rankcell-player-rank">{player.rank}</td>
              <td className="player-bp-rankcell-quest">{player.quest}</td>
              <td className="player-bp-rankcell-tower">{player.tower}</td>
              <td className="player-bp-rankcell-tower-red">
                {player.towerRed}
              </td>
              <td className="player-bp-rankcell-tower-blue">
                {player.towerBlue}
              </td>
              <td className="player-bp-rankcell-tower-green">
                {player.towerGreen}
              </td>
              <td className="player-bp-rankcell-tower-yellow">
                {player.towerYellow}
              </td>
              <td className={styles.playerBpRankcellGuildName}>
                {player.guildName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
