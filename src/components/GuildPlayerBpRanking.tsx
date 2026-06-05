import styles from './GuildPlayerBpRanking.module.css'
import { useGuildPlayerRanking } from '../context/GuildPlayerRankingContext'
import GuildBpRankingCell from './GuildBpRankingCell'
import LoadingIndicator from './LoadingIndicator'

export default function GuildPlayerBpRanking() {
  const guildPlayerRanking = useGuildPlayerRanking()

  if (guildPlayerRanking.loading) {
    return <LoadingIndicator />
  }

  return (
    <section className={styles.guildPlayerBpRankingTableRoot}>
      <table
        className={`wrapper highlight ${styles.guildPlayerBpRankingTable}`}
      >
        <thead>
          <tr>
            <th className={styles.guildPlayerBpRankingHeader}>
              {guildPlayerRanking.guildName}
            </th>
          </tr>
        </thead>
        <tbody>
          {guildPlayerRanking.playerBpRanking.map((item, i) => (
            <tr key={i}>
              <td>
                <GuildBpRankingCell
                  rank={i + 1}
                  worldId={0}
                  guildId={0}
                  name={item.name}
                  bp={item.bp}
                  onClick={() => {}}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
