import type { ReactNode } from 'react'
import styles from './Header.module.css'
import HomeButton from './HomeButton'

type Props = {
  children?: ReactNode
  title?: string
}

export default function Header({ children, title }: Props) {
  return (
    <header className={`wrapper ${styles.header}`}>
      <HomeButton />
      <div className={styles.headerTitleRoot}>
        {title && <h1 className={styles.headerTitle}>{title}</h1>}
        {children}
      </div>
    </header>
  )
}
