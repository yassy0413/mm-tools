import Header from '../components/Header'
import WorldSelector from '../components/WorldSelector'
import { useSearchParams } from 'react-router-dom'
import { WorldProvider } from '../context/WorldContext'
import { GuildRankingProvider } from '../context/GuildRankingContext'
import GuildBpRanking from '../components/GuildBpRanking'

export default function GuildBpRankingPage() {
  const [args] = useSearchParams()

  // gtag('event', 'search_world', {
  //   world_id: data.worldId,
  // })

  return (
    <>
      <Header title="Group Guild BP Ranking" />
      <WorldProvider>
        <WorldSelector />
        <GuildRankingProvider
          worldId={Number(args.get('worldId') ?? '0')}
          regionId={Number(args.get('regionId') ?? '0')}
        >
          <GuildBpRanking />
        </GuildRankingProvider>
      </WorldProvider>
    </>
  )
}
