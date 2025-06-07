// Exemplo de App.jsx com roteamento
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import Header from './components/layout/Header';
import MyRatingsPage from './pages/MyRatingsPage'; // Adicionar import
import './index.css'; // Tailwind CSS

function App() {
  return (
    <Router>
      <Header />
      <main className="pt-4 pb-8"> {/* Adicionar um padding ao main */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/my-ratings" element={<MyRatingsPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
