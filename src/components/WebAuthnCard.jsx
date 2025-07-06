import { useState } from 'react';

export default function WebAuthnCard() {
  const [registrationResult, setRegistrationResult] = useState(null);
  const [authenticationResult, setAuthenticationResult] = useState(null);

  const exampleChallenge = Uint8Array.from(
    'random-challenge-1234',
    c => c.charCodeAt(0)
  );
  const exampleUserId = Uint8Array.from(
    'user-id-1234',
    c => c.charCodeAt(0)
  );

  const publicKeyCredentialCreationOptions = {
    challenge: exampleChallenge.buffer,
    rp: { name: 'Example RP' },
    user: {
      id: exampleUserId.buffer,
      name: 'user@example.com',
      displayName: 'User Test',
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
    timeout: 5 * 60 * 1000,
    attestation: 'none',
  };

  const publicKeyCredentialRequestOptions = {
    challenge: exampleChallenge.buffer,
    timeout: 5 * 60 * 1000,
    allowCredentials: [],
    userVerification: 'preferred',
  };

  const handleRegister = async () => {
    try {
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      });
      console.log('Registration credential:', credential);
      setRegistrationResult(credential);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleAuthenticate = async () => {
    try {
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });
      console.log('Authentication credential:', assertion);
      setAuthenticationResult(assertion);
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  const bufferToArray = buf =>
    Array.from(new Uint8Array(buf || new ArrayBuffer(0)));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 space-y-6">
      <h1 className="text-2xl font-bold">WebAuthn Playground</h1>

      <div className="flex space-x-4">
        <button
          onClick={handleRegister}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          등록(Register)
        </button>
        <button
          onClick={handleAuthenticate}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
        >
          인증(Authenticate)
        </button>
      </div>

      {registrationResult && (
        <div className="w-full max-w-xl bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
          <h2 className="font-semibold mb-2">등록 결과:</h2>
          <pre>
            {JSON.stringify(
              {
                id: registrationResult.id,
                type: registrationResult.type,
                rawId: bufferToArray(registrationResult.rawId),
                response: {
                  attestationObject: bufferToArray(
                    registrationResult.response.attestationObject
                  ),
                  clientDataJSON: bufferToArray(
                    registrationResult.response.clientDataJSON
                  ),
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {authenticationResult && (
        <div className="w-full max-w-xl bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
          <h2 className="font-semibold mb-2">인증 결과:</h2>
          <pre>
            {JSON.stringify(
              {
                id: authenticationResult.id,
                type: authenticationResult.type,
                rawId: bufferToArray(authenticationResult.rawId),
                response: {
                  authenticatorData: bufferToArray(
                    authenticationResult.response.authenticatorData
                  ),
                  clientDataJSON: bufferToArray(
                    authenticationResult.response.clientDataJSON
                  ),
                  signature: bufferToArray(
                    authenticationResult.response.signature
                  ),
                  userHandle: authenticationResult.response.userHandle
                    ? bufferToArray(authenticationResult.response.userHandle)
                    : null,
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
