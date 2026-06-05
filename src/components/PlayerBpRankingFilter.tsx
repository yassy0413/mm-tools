import { useState } from 'react'
import { usePlayerBpRanking } from '../context/PlayerBpRankingContext'
import styles from './PlayerBpRankingFilter.module.css'
import Selector from './Selector'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '../Const'
import { useWorld } from '../context/WorldContext'

export type PlayerBpRankingFilterParam = {
  worldId: string
  regionId: string
  guildName: string
}

type Props = {
  filterParam: PlayerBpRankingFilterParam
}

export default function PlayerBpRankingFilter({ filterParam }: Props) {
  const worldData = useWorld()
  const playerBpRanking = usePlayerBpRanking()
  const navigate = useNavigate()

  const [worldId, setWorldId] = useState(filterParam.worldId ?? '')
  const [regionId, setRegionId] = useState(filterParam.regionId ?? '0')
  const [guildName, setGuildName] = useState(filterParam.guildName ?? '')

  const regionMap = {
    0: 'all',
    ...worldData.regionMap,
  }

  const onAnyChanged = (params: {
    worldId?: string
    regionId?: string
    guildName?: string
  }) => {
    const nextWorldId = params.worldId ?? worldId
    const nextRegionId = params.regionId ?? regionId
    const nextGuildName = params.guildName ?? guildName

    const args = new URLSearchParams({
      worldId: nextWorldId,
      regionId: nextRegionId,
      guildName: nextGuildName,
    })

    navigate(`${ROUTE.PLAYER_BP_RANKING}?${args}`)
  }

  return (
    <section className="wrapper">
      <div className={styles.playerBpRankingFilter}>
        <div className={styles.regionSelector}>
          <Selector
            disabled={playerBpRanking.loading}
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
          disabled={playerBpRanking.loading}
          className={`${styles.worldNumberInput} validate`}
          type="number"
          value={worldId}
          onChange={(e) => {
            setWorldId(e.target.value)
            onAnyChanged({ worldId: e.target.value })
          }}
        />
        <input
          placeholder="ギルド名でフィルタ..."
          disabled={playerBpRanking.loading}
          className={`${styles.guildNameInput} validate`}
          type="text"
          value={guildName}
          onChange={(e) => {
            setGuildName(e.target.value)
            onAnyChanged({ guildName: e.target.value })
          }}
        />
      </div>
    </section>
  )
}
