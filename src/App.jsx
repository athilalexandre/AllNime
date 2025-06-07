// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import Header from './components/layout/Header';
import MyRatingsPage from './pages/MyRatingsPage';
import './index.css'; // Tailwind CSS

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen"> {/* Garante que o footer (se houver) fique no final */}
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6"> {/* Padding responsivo e vertical, flex-grow */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/my-ratings" element={<MyRatingsPage />} />
          </Routes>
        </main>
        {/* Futuro Footer aqui */}
      </div>
    </Router>
  );
}

export default App;
