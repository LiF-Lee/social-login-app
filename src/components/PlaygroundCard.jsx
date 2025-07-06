import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useUser } from '../contexts/UserContext';
import { REFRESH_TOKEN_MUTATION, LOGOUT_MUTATION } from '../queries';
import { decodeJwt } from '../utils/jwt';

export default function PlaygroundCard() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));

  const decodedAccessToken = decodeJwt(accessToken);

  const handleLogout = () => {
    logoutMutation({ variables: { refreshToken } });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleRefreshToken = async () => {
    try {
      const { data } = await refreshTokenMutation({ variables: { refreshToken } });

      localStorage.setItem('accessToken', data.account.refreshToken.accessToken);
      localStorage.setItem('refreshToken', data.account.refreshToken.refreshToken);

      setAccessToken(data.account.refreshToken.accessToken);
      setRefreshToken(data.account.refreshToken.refreshToken);

      console.log('토큰 갱신 성공', data);
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      handleLogout();
    }
  };

  const handleOauth = () => {
    navigate('/oauth?clientId=1ADDD848A0796219E1938079FB93F9CD&callback=http://127.0.0.1:3443/callback/');
  }

  const handleAppManagement = () => {
    navigate('/app');
  }

  const handleWebAuthn = () => {
    navigate('/webauthn');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center font-sans space-y-6">
      <h1 className="text-2xl font-bold mb-4">{user.name}님 환영합니다!</h1>

      <div className="text-left w-full max-w-xl space-y-6">

        {/* 유저 */}
        {user && (
          <div>
            <h2 className="text-lg font-semibold mb-2">유저 정보:</h2>
            <div className="bg-gray-100 p-4 rounded text-sm break-all whitespace-pre-wrap">
              {JSON.stringify(user, null, 2)}
            </div>
          </div>
        )}

        <div className="h-px bg-gray-300 my-4" />

        {/* 디코딩 */}
        {decodedAccessToken && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Access Token 정보:</h2>
            <div className="bg-gray-100 p-4 rounded text-sm break-all whitespace-pre-wrap">
              {JSON.stringify(decodedAccessToken, null, 2)}
            </div>
          </div>
        )}

        <div className="h-px bg-gray-300 my-4" />

        {/* 토큰 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Access Token:</h2>
          <div className="bg-gray-100 p-2 rounded break-all text-sm">{accessToken || '없음'}</div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Refresh Token:</h2>
          <div className="bg-gray-100 p-2 rounded break-all text-sm">{refreshToken || '없음'}</div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center space-x-4 pt-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
          >
            Logout
          </button>
          <button
            onClick={handleRefreshToken}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
          >
            Refresh
          </button>
          <button
            onClick={handleAppManagement}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold"
          >
            Apps
          </button>
          <button
            onClick={handleWebAuthn}
            className="px-4 py-2 bg-yellow-500 hover:bg-purple-600 text-white rounded-lg font-semibold"
          >
            WebAuthn
          </button>
          <button
            onClick={handleOauth}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
          >
            OAuth
          </button>
        </div>
      </div>
    </div>
  );
}
