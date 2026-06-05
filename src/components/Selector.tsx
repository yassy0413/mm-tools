import styles from './Selector.module.css'

type Props = {
  disabled?: boolean
  stringMap: Record<string, string>
  initialValue: string
  onChange: (value: string) => void
}

export default function Selector({
  disabled = false,
  stringMap,
  initialValue,
  onChange,
}: Props) {
  return (
    <div className={styles.selectorWrapper}>
      <select
        id="selector"
        disabled={disabled}
        className={`browser-default ${styles.selector}`}
        value={initialValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {Object.entries(stringMap).map(([key, value]) => (
          <option key={key} value={key}>
            {value}
          </option>
        ))}
      </select>
    </div>
  )
}
