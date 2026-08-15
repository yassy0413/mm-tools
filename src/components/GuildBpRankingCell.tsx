import { useLayoutEffect, useRef, useState } from 'react'
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
  const guildNameRef = useRef<HTMLDivElement>(null)
  const [guildNameFontSize, setGuildNameFontSize] = useState<number | null>(
    null,
  )

  useLayoutEffect(() => {
    const element = guildNameRef.current
    if (!element) {
      return
    }

    const fitGuildName = () => {
      element.style.fontSize = ''
      const baseFontSize = Number.parseFloat(getComputedStyle(element).fontSize)
      const fittedFontSize = Math.max(
        8,
        Math.min(baseFontSize, (element.clientWidth / element.scrollWidth) * baseFontSize),
      )
      setGuildNameFontSize(fittedFontSize)
    }

    const resizeObserver = new ResizeObserver(fitGuildName)
    resizeObserver.observe(element)
    fitGuildName()

    return () => resizeObserver.disconnect()
  }, [name])

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
      <div
        ref={guildNameRef}
        className={styles.guildRankingCellGuildName}
        style={
          guildNameFontSize === null
            ? undefined
            : { fontSize: `${guildNameFontSize}px` }
        }
      >
        {name}
      </div>
      <div className={styles.guildRankingCellBp}>{bp.toLocaleString()}</div>
    </div>
  )
}
