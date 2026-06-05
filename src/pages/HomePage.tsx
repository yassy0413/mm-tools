import styles from './HomePage.module.css'
import Header from '../components/Header'
import WorldSelector from '../components/WorldSelector'
import { WorldProvider } from '../context/WorldContext'
import Explain from '../components/Explain'
import Links from '../components/Links'
import MoreTools from '../components/MoreTools'

export default function HomePage() {
  return (
    <>
      <Header title="Group Guild BP Ranking" />
      <WorldProvider>
        <WorldSelector />
      </WorldProvider>
      <Explain />
      <section className="wrapper">
        <div className={styles.sectionTitle}>
          <h2>MORE TOOLS</h2>
        </div>
        <MoreTools />
      </section>
      <section className="wrapper">
        <div className={styles.sectionTitle}>
          <h2>LINKS</h2>
        </div>
        <Links />
      </section>

      <div className={styles.homePageFooter}></div>
    </>
  )
}
