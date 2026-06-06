import styles from './GuildBpRanking.module.css'
import { useGuildRanking } from '../context/GuildRankingContext'
import GuildBpRankingCell from './GuildBpRankingCell'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '../Const'
import LoadingIndicator from './LoadingIndicator'

export default function GuildBpRanking() {
  const guildRanking = useGuildRanking()
  const navigate = useNavigate()

  if (guildRanking.loading) {
    return <LoadingIndicator />
  }

  const bpList = guildRanking.guildBpRanking
  console.log(bpList)

  const onClickCell = (worldId: number, guildId: number, guildName: string) => {
    const args = new URLSearchParams({
      worldId: worldId.toString(),
      guildId: guildId.toString(),
      guildName: guildName,
    })
    navigate(`${ROUTE.GUILD_PLAYER_BP_RANKING}?${args.toString()}`)
  }

  return (
    <section className={styles.guildBpRankingTableRoot}>
      <table className={styles.guildBpRankingTable}>
        <thead>
          <tr>
            <th className={styles.guildBpRankingHeader}>グランドマスター級</th>
            <th className={styles.guildBpRankingHeader}>エキスパート級</th>
            <th className={styles.guildBpRankingHeader}>エリート級</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }, (_, i) => (
            <tr key={i}>
              <td>
                <GuildBpRankingCell
                  rank={i + 1}
                  worldId={bpList[i].world_id}
                  guildId={bpList[i].id}
                  name={bpList[i].name}
                  bp={bpList[i].bp}
                  onClick={onClickCell}
                />
              </td>
              <td>
                <GuildBpRankingCell
                  rank={i + 16 + 1}
                  worldId={bpList[i + 16].world_id}
                  guildId={bpList[i + 16].id}
                  name={bpList[i + 16].name}
                  bp={bpList[i + 16].bp}
                  onClick={onClickCell}
                />
              </td>
              <td>
                <GuildBpRankingCell
                  rank={i + 32 + 1}
                  worldId={bpList[i + 32].world_id}
                  guildId={bpList[i + 32].id}
                  name={bpList[i + 32].name}
                  bp={bpList[i + 32].bp}
                  onClick={onClickCell}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
