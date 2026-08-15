import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '../Const'
import { useGachaAppearance } from '../context/GachaAppearanceContext'
import styles from './GachaAppearanceFilter.module.css'

type Props = {
  characterName: string
}

export default function GachaAppearanceFilter({ characterName }: Props) {
  const { loading } = useGachaAppearance()
  const navigate = useNavigate()
  const [name, setName] = useState(characterName)

  const updateFilter = (nextName: string) => {
    const args = new URLSearchParams({ characterName: nextName })
    navigate(`${ROUTE.GACHA_APPEARANCE}?${args}`)
  }

  return (
    <section className="wrapper">
      <div className={styles.gachaAppearanceFilter}>
        <input
          className="validate"
          disabled={loading}
          placeholder="キャラクター名でフィルタ..."
          type="text"
          value={name}
          onChange={(event) => {
            const value = event.target.value
            setName(value)
            updateFilter(value)
          }}
        />
      </div>
    </section>
  )
}
