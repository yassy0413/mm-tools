import styles from './WorldSelector.module.css'
import Selector from './Selector'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '../Const'
import { useWorld } from '../context/WorldContext'

type Props = {
  disabled?: boolean
  iconName?: string
}

export default function WorldSelector({
  disabled = false,
  iconName = 'play_arrow',
}: Props) {
  const WORLD_ID_KEY = 'world_id'
  const REGION_ID_KEY = 'region_id'

  const worldData = useWorld()
  const navigate = useNavigate()

  const [worldId, setWorldId] = useState(
    localStorage.getItem(WORLD_ID_KEY) || '',
  )
  const [regionId, setRegionId] = useState(
    localStorage.getItem(REGION_ID_KEY) || '1',
  )

  const onRegionChange = (regionId: string) => {
    console.log(regionId)
    localStorage.setItem(REGION_ID_KEY, regionId)
    setRegionId(regionId)
  }

  const onSubmit = () => {
    localStorage.setItem(WORLD_ID_KEY, worldId)

    const args = new URLSearchParams({
      regionId: regionId,
      worldId: worldId,
    })
    navigate(`${ROUTE.GUILD_BP_RANKING}?${args}`)
  }

  const worldExists =
    worldData.makeGroupId(Number(regionId), Number(worldId)) != 0

  return (
    <section className="wrapper">
      <div className={styles.worldSelector}>
        <div className={styles.worldSearchRegionSelector}>
          <Selector
            disabled={worldData.loading || disabled}
            stringMap={worldData.regionMap}
            initialValue={regionId}
            onChange={onRegionChange}
          />
        </div>
        <div className={styles.worldSearchInput}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
          >
            <input
              disabled={worldData.loading || disabled}
              type="number"
              className="validate"
              value={worldId}
              onChange={(e) => setWorldId(e.target.value)}
              placeholder="ワールド番号を入力..."
            />
          </form>
        </div>
        <div>
          <button
            className="btn waves-effect waves-light"
            type="submit"
            disabled={!worldExists}
            onClick={() => onSubmit()}
          >
            <i className="material-icons">{iconName}</i>
          </button>
        </div>
      </div>
    </section>
  )
}
