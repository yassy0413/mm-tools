import styles from './Links.module.css'
import link_weapon from '../assets/link_weapon.png'
import link_bp_rank from '../assets/link_bp_rank.png'

export default function Links() {
  return (
    <div className="wrapper">
      <div id="link_weapon" className={styles.linkCard}>
        <a
          href="https://docs.google.com/spreadsheets/d/15bxBeoWfO4R1b1u5OlohpwCsZLmWEUOaXwrsT9h0eYg/edit?gid=1002246187#gid=1002246187"
          target="_blank"
        >
          <img src={link_weapon} alt="" />
        </a>
      </div>

      <div id="link_bp_rank" className={styles.linkCard}>
        <a
          href="https://docs.google.com/spreadsheets/d/15bxBeoWfO4R1b1u5OlohpwCsZLmWEUOaXwrsT9h0eYg/edit?gid=0#gid=0"
          target="_blank"
        >
          <img src={link_bp_rank} alt="" />
        </a>
      </div>

      <div id="link_youtube_yassy" className={styles.linkCard}>
        <iframe
          className={styles.youtubeFrame}
          src="https://www.youtube.com/embed/videoseries?si=bxRKvKTPz6q_r5IE&amp;list=PLv9V6VF7SsQWPt5W-jEePL2g_WIIIMksq"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}
