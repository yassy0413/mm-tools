import { useGachaAppearance } from '../context/GachaAppearanceContext'
import CharacterIcon from './CharacterIcon'
import LoadingIndicator from './LoadingIndicator'
import styles from './GachaAppearance.module.css'

type Props = {
  characterName: string
  sortByLastStart: boolean
}

const formatDate = (dateTime: string) => dateTime.slice(0, 10).replace(/-/g, '/')

export default function GachaAppearance({
  characterName,
  sortByLastStart,
}: Props) {
  const { characters, loading } = useGachaAppearance()

  if (loading) {
    return <LoadingIndicator />
  }

  const filteredCharacters = characters.filter((character) =>
    character.name.includes(characterName),
  )
  if (sortByLastStart) {
    filteredCharacters.sort((a, b) => {
      const aLastStart = a.periods.at(-1)?.start ?? ''
      const bLastStart = b.periods.at(-1)?.start ?? ''
      return bLastStart.localeCompare(aLastStart)
    })
  }
  const maximumAppearances = Math.max(
    0,
    ...filteredCharacters.map((character) => character.periods.length),
  )

  return (
    <section className={styles.gachaAppearance}>
      <table className={`${styles.gachaAppearanceTable} highlight`}>
        <thead>
          <tr>
            <th>キャラクター</th>
            {Array.from({ length: maximumAppearances }, (_, index) => (
              <th key={`gacha-appearance-heading-${index + 1}`}>
                {index + 1}回目
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredCharacters.map((character) => (
            <tr key={`gacha-appearance-character-${character.id}`}>
              <td className={styles.character}>
                <div className={styles.characterContent}>
                  <CharacterIcon
                    characterId={character.id}
                    name={character.name}
                    className={styles.characterIcon}
                  />
                  <span>{character.name}</span>
                </div>
              </td>
              {Array.from({ length: maximumAppearances }, (_, index) => {
                const period = character.periods[index]
                return (
                  <td key={`gacha-appearance-period-${character.id}-${index}`}>
                    {period && (
                      <span className={styles.period}>
                        <span>{formatDate(period.start)}</span>
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
