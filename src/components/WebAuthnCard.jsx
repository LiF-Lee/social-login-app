import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/base64';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  GENERATE_WEBAUTHN_REGISTRATION_OPTIONS_QUERY,
  GENERATE_WEBAUTHN_ASSERTION_OPTIONS_QUERY,
  REGISTER_WEBAUTHN_CREDENTIAL_MUTATION,
  LOGIN_WITH_WEBAUTHN_MUTATION
} from '../queries';

export default function WebAuthnCard() {
  const [registrationResult, setRegistrationResult] = useState(null);
  const [authenticationResult, setAuthenticationResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingAuthenticate, setLoadingAuthenticate] = useState(false);
  const navigate = useNavigate();

  const [registrationQuery] = useLazyQuery(GENERATE_WEBAUTHN_REGISTRATION_OPTIONS_QUERY, {
    fetchPolicy: 'network-only',
  });
  const [assertionQuery] = useLazyQuery(GENERATE_WEBAUTHN_ASSERTION_OPTIONS_QUERY, {
    fetchPolicy: 'network-only',
  });
  const [registerCredential] = useMutation(REGISTER_WEBAUTHN_CREDENTIAL_MUTATION);
  const [verifyAssertion] = useMutation(LOGIN_WITH_WEBAUTHN_MUTATION);

  const handleRegister = async () => {
    setLoadingRegister(true);
    try {
      const { data } = await registrationQuery();
      const options = data.generateRegistrationOptions;

      const publicKeyCredentialCreationOptions = {
        challenge: base64ToArrayBuffer(options.challenge),
        rp: { id: options.rpId, name: options.rpId },
        user: {
          id: base64ToArrayBuffer(options.userId),
          name: options.userName,
          displayName: options.userDisplayName,
        },
        pubKeyCredParams: options.pubKeyCredParams.map(param => ({
          type: 'public-key',
          alg: param.alg,
        })),
        excludeCredentials: (options.excludeCredentials || []).map(cred => ({
          type: cred.type.toLowerCase() || 'public-key',
          id: base64ToArrayBuffer(cred.id),
        })),
        authenticatorSelection: options.authenticatorSelection && {
          userVerification: options.authenticatorSelection.userVerification.toLowerCase(),
          residentKey: options.authenticatorSelection.residentKey.toLowerCase(),
        },
        timeout: options.timeout,
        attestation: options.attestation.toLowerCase() || 'none',
      };

      console.log('Challenge:', JSON.stringify(publicKeyCredentialCreationOptions, null, 2));

      const registrationCredential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });

      const registrationPayload = {
        id: registrationCredential.id,
        rawId: arrayBufferToBase64(registrationCredential.rawId),
        type: registrationCredential.type,
        response: {
          attestationObject: arrayBufferToBase64(registrationCredential.response.attestationObject),
          clientDataJSON: arrayBufferToBase64(registrationCredential.response.clientDataJSON),
        },
      };

      setRegistrationResult(registrationPayload);

      await registerCredential({
        variables: {
          input: registrationPayload,
        },
      });

      toast.success('패스키 등록 성공!');
    } catch (err) {
      console.error('Registration failed:', err);
      toast.error('패스키 등록 실패');
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleAuthenticate = async () => {
    setLoadingAuthenticate(true);
    try {
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

      console.log('Authentication Payload:', assertion);

      setAuthenticationResult(authenticationPayload);

      const res = await verifyAssertion({
        variables: {
          input: authenticationPayload,
        },
      });

      toast.success('인증 성공! 환영합니다.');

      setUserInfo(res.data.account.loginWithWebAuthn.user);

      console.log('Authentication Result:', res.data.account.loginWithWebAuthn);
    } catch (err) {
      console.error('Authentication failed:', err);
      toast.error('인증 실패');
      setUserInfo(null);
    } finally {
      setLoadingAuthenticate(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-r from-indigo-100 via-white to-indigo-100 space-y-8">
      <h1 className="text-4xl font-extrabold text-indigo-900 drop-shadow-md mb-6">WebAuthn Playground</h1>

      <div className="flex space-x-6">
        <button
          onClick={handleRegister}
          disabled={loadingRegister}
          className={`px-8 py-3 rounded-lg text-white font-semibold transition 
                      ${loadingRegister ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loadingRegister ? '등록 중...' : '등록 (Register)'}
        </button>

        <button
          onClick={handleAuthenticate}
          disabled={loadingAuthenticate}
          className={`px-8 py-3 rounded-lg text-white font-semibold transition
                      ${loadingAuthenticate ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loadingAuthenticate ? '인증 중...' : '인증 (Authenticate)'}
        </button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
      >
        뒤로가기
      </button>

      {registrationResult && (
        <section className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md border border-indigo-200 overflow-auto text-sm font-mono whitespace-pre-wrap">
          <h2 className="text-lg font-semibold text-indigo-800 mb-3 border-b border-indigo-300 pb-1">등록 결과 (Registration Result):</h2>
          <pre>{JSON.stringify(registrationResult, null, 2)}</pre>
        </section>
      )}

      {authenticationResult && (
        <section className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md border border-green-200 overflow-auto text-sm font-mono whitespace-pre-wrap">
          <h2 className="text-lg font-semibold text-green-800 mb-3 border-b border-green-300 pb-1">인증 결과 (Authentication Result):</h2>
          <pre>{JSON.stringify(authenticationResult, null, 2)}</pre>
        </section>
      )}

      {userInfo && (
        <section className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md border border-blue-200 overflow-auto text-sm">
          <h2 className="text-lg font-semibold text-blue-800 mb-3 border-b border-blue-300 pb-1">인증된 유저 정보 (Authenticated User Info):</h2>
          <ul className="space-y-1">
            <li><strong>이름:</strong> {userInfo.name}</li>
            <li><strong>이메일:</strong> {userInfo.email}</li>
            <li><strong>가입일:</strong> {new Date(userInfo.created).toLocaleString()}</li>
          </ul>
        </section>
      )}
    </div>
  );
}
