import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './Header.module.css'
import HomeButton from './HomeButton'

type Props = {
  children?: ReactNode
  title?: string
}

export default function Header({ children, title }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [titleFontSize, setTitleFontSize] = useState<number | null>(null)

  useLayoutEffect(() => {
    const element = titleRef.current
    if (!element) {
      return
    }

    const fitTitle = () => {
      element.style.fontSize = ''
      const baseFontSize = Number.parseFloat(getComputedStyle(element).fontSize)
      const fittedFontSize = Math.max(
        11,
        Math.min(baseFontSize, (element.clientWidth / element.scrollWidth) * baseFontSize),
      )
      setTitleFontSize(fittedFontSize)
    }

    const resizeObserver = new ResizeObserver(fitTitle)
    resizeObserver.observe(element.parentElement ?? element)
    fitTitle()

    return () => resizeObserver.disconnect()
  }, [title])

  return (
    <header className={`wrapper ${styles.header}`}>
      <HomeButton />
      <div className={styles.headerTitleRoot}>
        {title && (
          <h1
            ref={titleRef}
            className={styles.headerTitle}
            style={
              titleFontSize === null
                ? undefined
                : { fontSize: `${titleFontSize}px` }
            }
          >
            {title}
          </h1>
        )}
        {children}
      </div>
    </header>
  )
}
