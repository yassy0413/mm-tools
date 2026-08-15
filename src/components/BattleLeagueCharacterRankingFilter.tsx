import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '../Const'
import { useBattleLeagueCharacterRanking } from '../context/BattleLeagueCharacterRankingContext'
import { useWorld } from '../context/WorldContext'
import Selector from './Selector'
import styles from './PlayerBpRankingFilter.module.css'

export type BattleLeagueCharacterRankingFilterParam = {
  worldId: string
  regionId: string
  characterName: string
}

type Props = {
  filterParam: BattleLeagueCharacterRankingFilterParam
}

export default function BattleLeagueCharacterRankingFilter({
  filterParam,
}: Props) {
  const worldData = useWorld()
  const battleLeagueCharacterRanking = useBattleLeagueCharacterRanking()
  const navigate = useNavigate()

  const [worldId, setWorldId] = useState(filterParam.worldId ?? '')
  const [regionId, setRegionId] = useState(filterParam.regionId ?? '0')
  const [characterName, setCharacterName] = useState(
    filterParam.characterName ?? '',
  )

  const regionMap = {
    0: 'all',
    ...worldData.regionMap,
  }

  const onAnyChanged = (params: {
    worldId?: string
    regionId?: string
    characterName?: string
  }) => {
    const nextWorldId = params.worldId ?? worldId
    const nextRegionId = params.regionId ?? regionId
    const nextCharacterName = params.characterName ?? characterName

    const args = new URLSearchParams({
      worldId: nextWorldId,
      regionId: nextRegionId,
      characterName: nextCharacterName,
    })

    navigate(`${ROUTE.BATTLE_LEAGUE_CHARACTER_RANKING}?${args}`)
  }

  return (
    <section className="wrapper">
      <div className={styles.playerBpRankingFilter}>
        <div className={styles.regionSelector}>
          <Selector
            disabled={battleLeagueCharacterRanking.loading}
            stringMap={regionMap}
            initialValue={regionId}
            onChange={(value) => {
              setRegionId(value)
              onAnyChanged({ regionId: value })
            }}
          />
        </div>
        <input
          placeholder="ワールド番号でフィルタ..."
          disabled={battleLeagueCharacterRanking.loading}
          className={`${styles.worldNumberInput} validate`}
          type="number"
          value={worldId}
          onChange={(e) => {
            setWorldId(e.target.value)
            onAnyChanged({ worldId: e.target.value })
          }}
        />
        <input
          placeholder="キャラクター名でフィルタ..."
          disabled={battleLeagueCharacterRanking.loading}
          className={`${styles.guildNameInput} validate`}
          type="text"
          value={characterName}
          onChange={(e) => {
            setCharacterName(e.target.value)
            onAnyChanged({ characterName: e.target.value })
          }}
        />
      </div>
    </section>
  )
}
