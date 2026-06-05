import Header from '../components/Header'
import { WorldProvider } from '../context/WorldContext'
import GuildPlayerBpRanking from '../components/GuildPlayerBpRanking'
import { useSearchParams } from 'react-router-dom'
import WorldSelector from '../components/WorldSelector'
import GuildPlayerRankingProvider from '../context/GuildPlayerRankingContext'

export default function GuildPlayerBpRankingPage() {
  const [args] = useSearchParams()

  // gtag('event', 'select_guild', {
  //   guild_name: v.name,
  // })

  return (
    <>
      <Header>
        <b>
          <span className="red-text">戦闘力ランキング</span>
        </b>
        に<br />
        エントリーしているプレーヤーのリスト
      </Header>
      <WorldProvider>
        <WorldSelector disabled iconName="arrow_back" />
        <GuildPlayerRankingProvider
          worldId={Number(args.get('worldId') ?? '0')}
          guildId={Number(args.get('guildId') ?? '0')}
          guildName={args.get('guildName') ?? ''}
        >
          <GuildPlayerBpRanking />
        </GuildPlayerRankingProvider>
      </WorldProvider>
    </>
  )
}
