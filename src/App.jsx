// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import EditAnimePage from './pages/EditAnimePage';
import Header from './components/layout/Header';
import MyRatingsPage from './pages/MyRatingsPage';
import PlanToWatchPage from './pages/PlanToWatchPage';
import WatchingPage from './pages/WatchingPage';
import CompletedPage from './pages/CompletedPage';
import DroppedPage from './pages/DroppedPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import TestComponent from './components/TestComponent';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/anime/:id/edit" element={<EditAnimePage />} />
            <Route path="/my-ratings" element={<MyRatingsPage />} />
            <Route path="/plan-to-watch" element={<PlanToWatchPage />} />
            <Route path="/watching" element={<WatchingPage />} />
            <Route path="/completed" element={<CompletedPage />} />
            <Route path="/dropped" element={<DroppedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/test" element={<TestComponent />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
