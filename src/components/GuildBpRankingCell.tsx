import { useWorld } from '../context/WorldContext'
import styles from './GuildBpRankingCell.module.css'

type Props = {
  rank: number
  worldId: number
  guildId: number
  name: string
  bp: number
  onClick: (worldId: number, guildId: number, guildName: string) => void
}

export default function GuildBpRankingCell({
  rank,
  worldId,
  guildId,
  name,
  bp,
  onClick,
}: Props) {
  const worldData = useWorld()

  return (
    <div
      className={styles.guildRankingCell}
      onClick={() => {
        onClick(worldId, guildId, name)
      }}
    >
      <div className={styles.guildRankingCellRank}>{rank}</div>
      {worldId > 0 && (
        <div className={styles.guildRankingCellWorld}>
          {worldData.makeServerName(worldId)}
        </div>
      )}
      <div className={styles.guildRankingCellGuildName}>{name}</div>
      <div className={styles.guildRankingCellBp}>{bp.toLocaleString()}</div>
    </div>
  )
}
