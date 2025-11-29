import { Routes, Route, BrowserRouter } from 'react-router-dom'
import PrincInterface from './Pages/PrincInterface'
import Home from './Pages/Home'
import Wallet from './Pages/MyWallet'
import Marketplace from './Pages/Marketplace'

/*C'est le composant parent, la racine de ton application.
C'est ici que tu organises tes pages, routes, layout, header, etc. */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<PrincInterface />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App