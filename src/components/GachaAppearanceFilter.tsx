import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE } from '../Const'
import { useGachaAppearance } from '../context/GachaAppearanceContext'
import styles from './GachaAppearanceFilter.module.css'

type Props = {
  characterName: string
  sortByLastStart: boolean
}

export default function GachaAppearanceFilter({
  characterName,
  sortByLastStart,
}: Props) {
  const { loading } = useGachaAppearance()
  const navigate = useNavigate()
  const [name, setName] = useState(characterName)
  const [sort, setSort] = useState(sortByLastStart)

  const updateFilter = (nextName: string, nextSort: boolean) => {
    const args = new URLSearchParams({
      characterName: nextName,
      sortByLastStart: String(nextSort),
    })
    navigate(`${ROUTE.GACHA_APPEARANCE}?${args}`)
  }

  return (
    <section className="wrapper">
      <div className={styles.gachaAppearanceFilter}>
        <label className={styles.sortCheckbox}>
          <input
            disabled={loading}
            type="checkbox"
            checked={sort}
            onChange={(event) => {
              const value = event.target.checked
              setSort(value)
              updateFilter(name, value)
            }}
          />
          <span>最後の登場日でソート</span>
        </label>
        <input
          className="validate"
          disabled={loading}
          placeholder="キャラクター名でフィルタ..."
          type="text"
          value={name}
          onChange={(event) => {
            const value = event.target.value
            setName(value)
            updateFilter(value, sort)
          }}
        />
      </div>
    </section>
  )
}
