import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { REGISTER_MUTATION } from '../queries';
import { safeRedirect } from '../utils/safeRedirect';

export default function RegisterCard() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle');
  const turnstileContainerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const navigate = useNavigate();
  const redirect = safeRedirect(searchParams.get('redirect'));

  const [registerMutation] = useMutation(REGISTER_MUTATION);

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
      const { data } = await registerMutation({
        variables: {
          name: form.name,
          email: form.email,
          password: form.password,
          turnstileToken,
        },
      });
      const { accessToken, refreshToken } = data.account.register;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate(redirect);
    } catch (error) {
      console.error('회원가입 실패:', error);
      toast.error('회원가입에 실패했습니다.');
      setStatus('idle');
      setTurnstileToken('');
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  };

  return (
    <div className="bg-[#fcf8f3] min-h-screen flex items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-6">계정 생성</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
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
            className="w-full my-2"
            style={{ display: 'flex', justifyContent: 'center' }}
          />

          {status === 'idle' && (
            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg font-semibold text-sm transition"
            >
              회원가입
            </button>
          )}

          {status === 'loading' && (
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-4 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </form>

        <p className="text-sm text-gray-600 mt-6">
          계정을 가지고 계신가요?{' '}
          <a
            href={`./login?redirect=${encodeURIComponent(redirect)}`}
            className="text-black font-semibold hover:underline"
          >
            로그인
          </a>
        </p>
      </div>
    </div>
  );
}
