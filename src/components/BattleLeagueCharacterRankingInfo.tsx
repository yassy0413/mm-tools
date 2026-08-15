import { useBattleLeagueCharacterRanking } from '../context/BattleLeagueCharacterRankingContext'
import styles from './PlayerBpRankingInfo.module.css'

export default function BattleLeagueCharacterRankingInfo() {
  const battleLeagueCharacterRanking = useBattleLeagueCharacterRanking()

  if (battleLeagueCharacterRanking.loading) {
    return null
  }

  return (
    <div className="wrapper">
      <div className={styles.playerBpRankingExplain}>
        <p className={styles.playerBpRankingLastUpdated}>
          データ最終更新
          <br />
          {battleLeagueCharacterRanking.lastUpdated}
        </p>
        <p className={styles.playerBpRankingRemark}>
          バトリランキング２０位までで、活躍しているキャラクターランキング
        </p>
      </div>
    </div>
  )
}
