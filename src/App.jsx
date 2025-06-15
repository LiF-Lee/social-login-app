import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaygroundPage from './pages/PlaygroundPage';
import OAuthPage from './pages/OAuthPage';
import AppPage from './pages/AppPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={import.meta.env.VITE_DEFAULT_APP_PATH} replace />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/oauth" element={<OAuthPage />} />
      </Route>

      <Route path="*" element={<Navigate to={import.meta.env.VITE_DEFAULT_APP_PATH} replace />} />
    </Routes>
  );
}
