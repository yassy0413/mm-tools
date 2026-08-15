import { useBattleLeagueCharacterRanking } from '../context/BattleLeagueCharacterRankingContext'
import { useWorld } from '../context/WorldContext'
import CharacterIcon from './CharacterIcon'
import LoadingIndicator from './LoadingIndicator'
import styles from './BattleLeagueCharacterRanking.module.css'
import type { BattleLeagueCharacterRankingFilterParam } from './BattleLeagueCharacterRankingFilter'

type Props = {
  filterParam: BattleLeagueCharacterRankingFilterParam
}

const extractWorldId = (world: string) => Number(world.replace(/^\D+/, ''))

export default function BattleLeagueCharacterRanking({ filterParam }: Props) {
  const worldData = useWorld()
  const battleLeagueCharacterRanking = useBattleLeagueCharacterRanking()

  if (battleLeagueCharacterRanking.loading) {
    return <LoadingIndicator />
  }

  const filterdList = () => {
    return battleLeagueCharacterRanking.rankingList.filter((x) => {
      const regionId = Number(filterParam.regionId)
      if (regionId > 0) {
        if (!x.world.startsWith(worldData.regionMap[regionId])) {
          return false
        }
      }

      const worldId = Number(filterParam.worldId)
      if (worldId > 0) {
        if (worldId !== extractWorldId(x.world)) {
          return false
        }
      }

      if (filterParam.characterName) {
        if (
          !x.rankings.some((ranking) =>
            ranking.name.includes(filterParam.characterName),
          )
        ) {
          return false
        }
      }

      return true
    })
  }

  return (
    <section className={styles.battleLeagueCharacterRanking}>
      <table
        className={`${styles.battleLeagueCharacterRankingTable} highlight`}
      >
        <thead>
          <tr className={styles.battleLeagueCharacterRankcellHeader}>
            <th>ワールド</th>
            {Array.from({ length: 10 }, (_, index) => (
              <th key={`battle-league-character-ranking-head-${index + 1}`}>
                {index + 1}位
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.battleLeagueCharacterRankingContainer}>
          {filterdList().map((worldRanking) => (
            <tr
              key={`battle-league-character-ranking-${worldRanking.world}`}
              className={styles.battleLeagueCharacterRankcell}
            >
              <td className={styles.battleLeagueCharacterRankcellWorld}>
                {worldRanking.world}
              </td>
              {worldRanking.rankings.map((ranking) => (
                <td
                  key={`battle-league-character-ranking-${worldRanking.world}-${ranking.rank}`}
                  className={`${styles.battleLeagueCharacterRankcellCharacter} ${
                    filterParam.characterName &&
                    ranking.name.includes(filterParam.characterName)
                      ? styles.battleLeagueCharacterRankcellCharacterHighlight
                      : ''
                  }`}
                >
                  <div className={styles.battleLeagueCharacterRankcellContent}>
                    <CharacterIcon
                      characterId={ranking.characterId}
                      name={ranking.name}
                      className={styles.battleLeagueCharacterRankcellIcon}
                    />
                    <span className={styles.battleLeagueCharacterRankcellCount}>
                      {ranking.count.toLocaleString()}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
