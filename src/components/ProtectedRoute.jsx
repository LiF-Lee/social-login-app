import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { UserProvider } from '../contexts/UserContext';
import { ME_QUERY } from '../queries';

export default function ProtectedRoute() {
  const location = useLocation();
  const redirectPath = encodeURIComponent(location.pathname + location.search);
  const { data, loading, error } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return null;
  }

  if (error || !data?.me) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.warn('인증 실패, 로그인 페이지로 이동');
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  console.log('인증된 유저:', data.me);

  return (
    <UserProvider initialUser={data.me}>
      <Outlet />
    </UserProvider>
  );
}
