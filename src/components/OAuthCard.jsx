import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { isValidCallback } from '../utils/isValidCallback';
import axios from 'axios';
import {
  APP_INFO_QUERY,
  APP_OAUTH_QUERY
} from '../queries';

export default function OAuthCard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const turnstileRef = useRef(null);

  const clientId = searchParams.get('clientId');
  const callback = searchParams.get('callback');

  const [status, setStatus] = useState('idle'); 
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [appInfo, setAppInfo] = useState(null);

  const [loadAppInfo, { loading: infoLoading, error: infoError }] = useLazyQuery(APP_INFO_QUERY);
  const [agreeQuery] = useLazyQuery(APP_OAUTH_QUERY);

  useEffect(() => {
    if (!clientId) {
      setStatus('invalid');
      setErrorMsg('clientId가 없습니다.');
      return;
    }
    (async () => {
      try {
        const { data } = await loadAppInfo({ variables: { clientId } });
        const app = data?.app;
        if (!app) {
          setStatus('invalid');
          setErrorMsg('등록된 앱이 아닙니다.');
          return;
        }
        if (!isValidCallback(callback, app.redirectUri)) {
          setStatus('invalid');
          setErrorMsg('callback URL이 올바르지 않습니다.');
          return;
        }
        setAppInfo(app);
      } catch {
        setStatus('invalid');
        setErrorMsg('앱 정보를 불러올 수 없습니다.');
      }
    })();
  }, [clientId, callback, loadAppInfo]);

  useEffect(() => {
    if (window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (token) => setTurnstileToken(token),
      });
    }
  }, []);

  const handleAgree = async () => {
    if (status === 'loading' || status === 'invalid') return;
    if (!turnstileToken) {
      setErrorMsg('Turnstile 검증이 필요합니다.');
      return;
    }
    setStatus('loading');

    try {
      const { data } = await agreeQuery({
        variables: { clientId, turnstileToken },
      });
      if (!data?.agree) throw new Error('동의 처리 실패');

      await axios.post(
        callback,
        { status: 'OK', token: data.agree },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || '알 수 없는 에러');
      setStatus('error');
    }
  };

  const handleCancel = async () => {
    if (status === 'loading' || !callback) return;
    try {
      axios.post(
        callback,
        { status: 'CANCEL', idToken: null },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );
    } catch {}
    setStatus('cancelled');
  };

  if (status === 'invalid' || infoError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">잘못된 접근</h1>
        <p className="text-gray-700">{errorMsg}</p>
      </div>
    );
  }
  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-green-600">로그인 성공</h1>
        <p>서비스 접근이 허가되었습니다.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
          홈으로 이동
        </button>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">로그인 실패</h1>
        <p className="text-gray-700">{errorMsg}</p>
        <button onClick={() => { setStatus('idle'); setErrorMsg(''); }} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold">
          다시 시도
        </button>
      </div>
    );
  }
  if (status === 'cancelled') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-600">취소되었습니다</h1>
        <p className="text-gray-700">사용자의 요청으로 취소되었습니다.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">
          홈으로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-6 text-center">
      <h1 className="text-2xl font-bold">
        {infoLoading ? '로딩 중…' : `${appInfo?.name || ''} 정보 제공 동의`}
      </h1>
      <p className="text-gray-700">
        {infoLoading
          ? '앱 정보를 불러오는 중입니다.'
          : `${appInfo?.name || ''}이(가) 귀하의 프로필 정보를 제공합니다.`}
      </p>

      {/* Turnstile 위젯 */}
      <div ref={turnstileRef} className="mt-4" />

      {/* 에러 메시지 */}
      {status === 'idle' && errorMsg && (
        <p className="text-red-500 mt-2">{errorMsg}</p>
      )}

      {status !== 'loading' && (
        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleAgree}
            disabled={infoLoading}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            동의
          </button>
          <button
            onClick={handleCancel}
            disabled={infoLoading}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold disabled:opacity-50"
          >
            취소
          </button>
        </div>
      )}

      {/* 로딩 스피너 */}
      {status === 'loading' && (
        <div className="mt-4">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-4 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  );
}
