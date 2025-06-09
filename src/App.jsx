// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import Header from './components/layout/Header';
import MyRatingsPage from './pages/MyRatingsPage';
import PlanToWatchPage from './pages/PlanToWatchPage';
import WatchingPage from './pages/WatchingPage';
import CompletedPage from './pages/CompletedPage';
import DroppedPage from './pages/DroppedPage';
import ExplorePage from './pages/ExplorePage'; // Adicionar import
import SearchResultsPage from './pages/SearchResultsPage';
import EditAnimePage from './pages/EditAnimePage';
import Footer from './components/layout/Footer'; // Importar o componente Footer
import { LanguageProvider } from './contexts/LanguageContext.jsx'; // Importar LanguageProvider
import './index.css';

function App() {
  return (
    <LanguageProvider> {/* Envolver toda a aplicação com o LanguageProvider */}
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/anime/:id" element={<AnimeDetailPage />} />
              <Route path="/anime/:id/edit" element={<EditAnimePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/my-ratings" element={<MyRatingsPage />} />
              <Route path="/plan-to-watch" element={<PlanToWatchPage />} />
              <Route path="/watching" element={<WatchingPage />} />
              <Route path="/completed" element={<CompletedPage />} />
              <Route path="/dropped" element={<DroppedPage />} />
              <Route path="/explore" element={<ExplorePage />} />
            </Routes>
          </main>
          <Footer /> {/* Adicionar o Footer aqui */}
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
