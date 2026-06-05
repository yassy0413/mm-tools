import styles from './HomeButton.module.css'
import { Link } from 'react-router-dom'
import { ROUTE } from '../Const'

export default function HomeButton() {
  return (
    <Link
      to={ROUTE.HOME}
      className={`btn-floating waves-effect waves-light ${styles.homeButton}`}
    >
      <i className="material-icons">home</i>
    </Link>
  )
}
