import { useState, useRef, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { safeRedirect } from '../utils/safeRedirect';
import { base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/base64';
import {
  LOGIN_MUTATION,
  GENERATE_WEBAUTHN_ASSERTION_OPTIONS_QUERY,
  LOGIN_WITH_WEBAUTHN_MUTATION
} from '../queries';

export default function LoginCard() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle');
  const turnstileContainerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const navigate = useNavigate();
  const redirect = safeRedirect(searchParams.get('redirect'));

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [assertionQuery] = useLazyQuery(GENERATE_WEBAUTHN_ASSERTION_OPTIONS_QUERY, {
    fetchPolicy: 'network-only',
  });
  const [verifyAssertion] = useMutation(LOGIN_WITH_WEBAUTHN_MUTATION);

  useEffect(() => {
    if (window.turnstile && turnstileContainerRef.current) {
      widgetIdRef.current = window.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          theme: 'light',
          callback: (token) => setTurnstileToken(token),
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error('인증을 완료해주세요.');
      return;
    }

    try {
      setStatus('loading');
      const { data } = await loginMutation({
        variables: {
          email: form.email,
          password: form.password,
          turnstileToken,
        },
      });
      toast.success('로그인 성공! 환영합니다.');
      const { accessToken, refreshToken } = data.account.login;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate(redirect);
    } catch (error) {
      console.error('로그인 실패:', error);
      toast.error('로그인에 실패했습니다.');
      setStatus('idle');
      setTurnstileToken('');
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  };

  const handleAuthenticate = async () => {
    try {
      setStatus('loading');
      const { data } = await assertionQuery();
      const options = data.generateAssertionOptionsForLogin;

      const publicKeyCredentialRequestOptions = {
        challenge: base64ToArrayBuffer(options.challenge),
        rpId: options.rpId,
        timeout: options.timeout,
        allowCredentials: (options.allowCredentials || []).map(cred => ({
          type: cred.type,
          id: base64ToArrayBuffer(cred.id),
        })),
        userVerification: options.userVerification,
      };

      console.log('Challenge:', {
        challenge: options.challenge,
        rpId: options.rpId,
        timeout: options.timeout,
        allowCredentials: (options.allowCredentials || []).map(cred => ({
          type: cred.type,
          id: cred.id,
        })),
        userVerification: options.userVerification,
      });

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      const authenticationPayload = {
        id: assertion.id,
        rawId: arrayBufferToBase64(assertion.rawId),
        response: {
          authenticatorData: arrayBufferToBase64(assertion.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64(assertion.response.clientDataJSON),
          signature: arrayBufferToBase64(assertion.response.signature),
          userHandle: assertion.response.userHandle
            ? arrayBufferToBase64(assertion.response.userHandle)
            : null,
        },
        challengeId: options.challengeId,
      };

      console.log('Authentication Payload:', authenticationPayload);

      const res = await verifyAssertion({
        variables: {
          input: authenticationPayload,
        },
      });

      toast.success('인증 성공! 환영합니다.');

      const { accessToken, refreshToken } = res.data.account.loginWithWebAuthn;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate(redirect);
    } catch (err) {
      setStatus('idle');
      console.error('Authentication failed:', err);
      toast.error('인증 실패');
    } finally {
      
    }
  };
  
  return (
    <div className="bg-[#fcf8f3] min-h-screen flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-6">계정 로그인</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <div
            ref={turnstileContainerRef}
            className="my-2 w-full"
            style={{ display: 'flex', justifyContent: 'center' }}
          />

          {status === 'idle' && (
            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-semibold text-sm transition"
            >
              로그인
            </button>
          )}

          {status === 'idle' && (
            <button
              onClick={handleAuthenticate}
              className="w-full py-3 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition"
            >
              패스키로 로그인
            </button>
          )}

          {status === 'loading' && (
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-4 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </form>

        <p className="text-sm text-gray-600 mt-6">
          계정이 없으신가요?{' '}
          <a
            href={`./register?redirect=${encodeURIComponent(redirect)}`}
            className="text-black font-semibold hover:underline"
          >
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
