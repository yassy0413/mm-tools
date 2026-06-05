import styles from './Explain.module.css'

export default function Explain() {
  return (
    <section>
      <div className={styles.explainRoot}>
        <span className={styles.explainRedText}>ワールド番号</span>を入力して、
        <span className={styles.explainRedText}>その右の再生ボタン</span>
        をおすと
        <br />
        対象のワールドが所属するグループのギルドが
        <br />
        戦力降順で４８個(16x3)表示されます。
        <br />
        <br />
        ギルドセルをタップすると、
        <br />
        <b>
          <span className={styles.explainGreenText}>
            戦闘力ランキングにエントリー
          </span>
        </b>
        している
        <br />
        <b>
          <span className={styles.explainGreenText}>プレーヤーのリスト</span>
        </b>
        が表示されます。
        <br />
      </div>
    </section>
  )
}
