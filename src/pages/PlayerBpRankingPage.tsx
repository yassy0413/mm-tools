import Header from '../components/Header'
import PlayerBpRankingFilter, {
  type PlayerBpRankingFilterParam,
} from '../components/PlayerBpRankingFilter'
import PlayerBpRanking from '../components/PlayerBpRanking'
import PlayerBpRankingProvider from '../context/PlayerBpRankingContext'
import { WorldProvider } from '../context/WorldContext'
import { useSearchParams } from 'react-router-dom'
import PlayerBpRankingInfo from '../components/PlayerBpRankingInfo'

export default function PlayerBpRankingPage() {
  const [args] = useSearchParams()
  const filterParam: PlayerBpRankingFilterParam = {
    worldId: args.get('worldId') ?? '',
    regionId: args.get('regionId') ?? '',
    guildName: args.get('guildName') ?? '',
  }

  return (
    <>
      <Header title="全鯖プレーヤー戦力ランキング!" />
      <WorldProvider>
        <PlayerBpRankingProvider>
          <PlayerBpRankingInfo />
          <PlayerBpRankingFilter filterParam={filterParam} />
          <PlayerBpRanking filterParam={filterParam} />
        </PlayerBpRankingProvider>
      </WorldProvider>
    </>
  )
}
