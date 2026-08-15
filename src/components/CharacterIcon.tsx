import { useEffect, useState } from 'react'
import Character from '../utils/Character'

type Props = {
  characterId?: number
  name: string
  className?: string
}

export default function CharacterIcon({ characterId, className, name }: Props) {
  const [cachedIcon, setCachedIcon] = useState<{
    characterId: number
    src: string
  } | null>(null)

  useEffect(() => {
    if (!characterId) {
      return
    }

    let objectUrl = ''
    let cancelled = false

    const invoke = async () => {
      const cachedSrc = await Character.CacheIcon(characterId)
      if (cancelled) {
        if (cachedSrc.startsWith('blob:')) {
          URL.revokeObjectURL(cachedSrc)
        }
        return
      }

      objectUrl = cachedSrc.startsWith('blob:') ? cachedSrc : ''
      setCachedIcon({ characterId, src: cachedSrc })
    }
    invoke()

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [characterId])

  if (!characterId) {
    return <span className={className} aria-label={name} />
  }

  const src =
    cachedIcon?.characterId === characterId
      ? cachedIcon.src
      : Character.IconUrl(characterId)

  return <img className={className} src={src} alt={name} loading="lazy" />
}
