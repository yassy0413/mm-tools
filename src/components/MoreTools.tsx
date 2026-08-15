import styles from './MoreTools.module.css'
import { Link } from 'react-router-dom'
import { ROUTE } from '../Const'

export default function MoreTools() {
  return (
    <div className={styles.toolLinks}>
      <Link
        to={ROUTE.EQUIPMENT_COMPARE}
        className="btn waves-effect waves-light"
      >
        装備効果値 比較
      </Link>
      <Link
        to={ROUTE.PLAYER_BP_RANKING}
        className="btn waves-effect waves-light"
      >
        全鯖プレーヤー戦力ランキング！
      </Link>
      <Link
        to={ROUTE.BATTLE_LEAGUE_CHARACTER_RANKING}
        className="btn waves-effect waves-light"
      >
        バトルリーグ使用キャラランキング
      </Link>
      <Link to={ROUTE.GACHA_APPEARANCE} className="btn waves-effect waves-light">
        ピックアップガチャ登場日
      </Link>
    </div>
  )
}
