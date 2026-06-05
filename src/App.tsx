import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { ROUTE } from './Const'
import HomePage from './pages/HomePage'
import GuildBpRankingPage from './pages/GuildBpRankingPage'
import GuildPlayerBpRankingPage from './pages/GuildPlayerBpRankingPage'
import EquipmentComparePage from './pages/EquipmentComparePage'
import PlayerBpRankingPage from './pages/PlayerBpRankingPage'

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path={ROUTE.HOME} element={<HomePage />}></Route>
          <Route
            path={ROUTE.GUILD_BP_RANKING}
            element={<GuildBpRankingPage />}
          ></Route>
          <Route
            path={ROUTE.GUILD_PLAYER_BP_RANKING}
            element={<GuildPlayerBpRankingPage />}
          ></Route>
          <Route
            path={ROUTE.EQUIPMENT_COMPARE}
            element={<EquipmentComparePage />}
          ></Route>
          <Route
            path={ROUTE.PLAYER_BP_RANKING}
            element={<PlayerBpRankingPage />}
          ></Route>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
