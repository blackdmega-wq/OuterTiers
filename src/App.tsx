import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Rankings from './pages/Rankings';
import PlayerProfile from './pages/PlayerProfile';
import ApiDocs from './pages/ApiDocs';

function NotFound() {
  return (
    <div className="not-found-page">
      <h1>PAGE NOT FOUND</h1>
      <p>The page you were looking for does not exist.</p>
      <a href="/" className="go-home-btn">⬅ Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rankings" element={<Navigate to="/rankings/overall" replace />} />
            <Route path="/rankings/:category" element={<Rankings />} />
            <Route path="/player/:username" element={<PlayerProfile />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
