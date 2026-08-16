import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ROUTE } from '../Const'

const PAGE_NAME_MAP: Record<string, string> = {
  [ROUTE.HOME]: 'トップページ',
  [ROUTE.GUILD_BP_RANKING]: 'Group Guild BP Ranking',
  [ROUTE.GUILD_PLAYER_BP_RANKING]: 'ギルド所属プレーヤー戦力ランキング',
  [ROUTE.EQUIPMENT_COMPARE]: '装備効果値 比較',
  [ROUTE.PLAYER_BP_RANKING]: '全鯖プレーヤー戦力ランキング！',
  [ROUTE.BATTLE_LEAGUE_CHARACTER_RANKING]: 'バトルリーグ使用キャラランキング',
  [ROUTE.GACHA_APPEARANCE]: 'ピックアップガチャ登場日',
}

type Gtag = (...args: unknown[]) => void

export default function AnalyticsPageView() {
  const location = useLocation()

  useEffect(() => {
    const pageName = PAGE_NAME_MAP[location.pathname] ?? 'ページが見つかりません'
    const pageTitle = `${pageName} | MM Tools`
    document.title = pageTitle

    const gtag = (window as typeof window & { gtag?: Gtag }).gtag
    gtag?.('event', 'page_view', {
      page_title: pageTitle,
      page_location: `${window.location.origin}${window.location.pathname}#${location.pathname}`,
      page_path: location.pathname,
    })
  }, [location.pathname])

  return null
}
