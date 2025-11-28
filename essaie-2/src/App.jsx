import { Routes, Route, BrowserRouter } from 'react-router-dom'
import PrincInterface from './Pages/PrincInterface'
import Home from './Pages/Home'


/*C'est le composant parent, la racine de ton application.
C'est ici que tu organises tes pages, routes, layout, header, etc. */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<PrincInterface />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App