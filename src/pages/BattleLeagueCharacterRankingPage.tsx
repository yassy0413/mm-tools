import BattleLeagueCharacterRanking from '../components/BattleLeagueCharacterRanking'
import BattleLeagueCharacterRankingFilter, {
  type BattleLeagueCharacterRankingFilterParam,
} from '../components/BattleLeagueCharacterRankingFilter'
import BattleLeagueCharacterRankingInfo from '../components/BattleLeagueCharacterRankingInfo'
import Header from '../components/Header'
import BattleLeagueCharacterRankingProvider from '../context/BattleLeagueCharacterRankingContext'
import { WorldProvider } from '../context/WorldContext'
import { useSearchParams } from 'react-router-dom'

export default function BattleLeagueCharacterRankingPage() {
  const [args] = useSearchParams()
  const filterParam: BattleLeagueCharacterRankingFilterParam = {
    worldId: args.get('worldId') ?? '',
    regionId: args.get('regionId') ?? '',
    characterName: args.get('characterName') ?? '',
  }

  return (
    <>
      <Header title="バトルリーグ使用キャラランキング" />
      <WorldProvider>
        <BattleLeagueCharacterRankingProvider>
          <BattleLeagueCharacterRankingInfo />
          <BattleLeagueCharacterRankingFilter filterParam={filterParam} />
          <BattleLeagueCharacterRanking filterParam={filterParam} />
        </BattleLeagueCharacterRankingProvider>
      </WorldProvider>
    </>
  )
}
