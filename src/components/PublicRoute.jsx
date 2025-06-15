import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    return <Navigate to={import.meta.env.VITE_DEFAULT_APP_PATH} replace />;
  }

  return <Outlet />;
}
