import { usePlayerBpRanking } from '../context/PlayerBpRankingContext'
import styles from './PlayerBpRankingInfo.module.css'

export default function PlayerBpRankingInfo() {
  const playerBpRanking = usePlayerBpRanking()

  if (playerBpRanking.loading) {
    return null
  }

  return (
    <div className="wrapper">
      <div className={styles.playerBpRankingExplain}>
        <p className={styles.playerBpRankingLastUpdated}>
          データ最終更新
          <br />
          {playerBpRanking.lastUpdated}
        </p>
        <p className={styles.playerBpRankingRemark}>
          ※全体で10000位までが対象
          <br />
          ※属性塔は攻略20位まで取得可能
        </p>
      </div>
    </div>
  )
}
