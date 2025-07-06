import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name,
      email
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!, $turnstileToken: String!) {
    account {
      login(email: $email, password: $password, turnstileToken: $turnstileToken) {
        accessToken
        refreshToken
        user {
          created
        }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $turnstileToken: String!) {
    account {
      register(name: $name, email: $email, password: $password, turnstileToken: $turnstileToken) {
        accessToken
        refreshToken
        user {
          created
        }
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    account {
      refreshToken(refreshToken: $refreshToken) {
        accessToken
        refreshToken
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout($refreshToken: String!) {
    account {
      logout(refreshToken: $refreshToken)
    }
  }
`;

export const APPS_QUERY = gql`
  query Me {
    me {
      apps {
        id
        name
        clientId
        clientSecret
        redirectUri
        created
      }
    }
  }
`;

export const CREATE_APP_MUTATION = gql`
  mutation CreateApp($name: String!, $redirectUri: String!) {
    app {
      create(name: $name, redirectUri: $redirectUri) {
        id
        name
        clientId
        clientSecret
        redirectUri
        created
        ownerUser {
          apps {
            id
            name
            clientId
            clientSecret
            redirectUri
            created
          }
        }
      }
    }
  }
`;

export const EDIT_APP_MUTATION = gql`
  mutation EditApp($appId: Int!, $name: String, $redirectUri: String) {
    app {
      edit(appId: $appId, name: $name, redirectUri: $redirectUri) {
        id
        name
        clientId
        clientSecret
        redirectUri
        created
        ownerUser {
          apps {
            id
            name
            clientId
            clientSecret
            redirectUri
            created
          }
        }
      }
    }
  }
`;

export const DELETE_APP_MUTATION = gql`
  mutation DeleteApp($appId: Int!) {
    app {
      delete(appId: $appId) {
        apps {
          id
          name
          clientId
          clientSecret
          redirectUri
          created
        }
      }
    }
  }
`;

export const APP_INFO_QUERY = gql`
  query AppInfo($clientId: String!) {
    app(clientId: $clientId) {
      id
      name
      clientId
      redirectUri
      created
    }
  }
`;

export const APP_OAUTH_QUERY = gql`
  query AppAgree($clientId: String!, $turnstileToken: String!) {
    agree(clientId: $clientId, turnstileToken: $turnstileToken)
  }
`;

export const GENERATE_WEBAUTHN_REGISTRATION_OPTIONS_QUERY = gql`
  query GenerateWebAuthnRegistrationOptions {
    generateRegistrationOptions {
      challenge
      rpId
      userId
      userName
      userDisplayName
      pubKeyCredParams {
        type
        alg
      }
      excludeCredentials {
        type
        id
      }
      authenticatorSelection {
        userVerification
        residentKey
      }
      timeout
      attestation
    }
  }
`;

export const GENERATE_WEBAUTHN_ASSERTION_OPTIONS_QUERY = gql`
  query GenerateWebAuthnAssertionOptions {
    generateAssertionOptionsForLogin {
      challengeId
      challenge
      rpId
      allowCredentials {
        type
        id
      }
      timeout
      userVerification
    }
  }
`;

export const REGISTER_WEBAUTHN_CREDENTIAL_MUTATION = gql`
  mutation RegisterWebAuthnCredential($input: CredentialAttestationInput!) {
    account {
      registerWebAuthnCredential(input: $input)
    }
  }
`;

export const LOGIN_WITH_WEBAUTHN_MUTATION = gql`
  mutation LoginWithWebAuthn($input: CredentialAssertionInput!) {
    account {
      loginWithWebAuthn(input: $input) {
        accessToken
        refreshToken
        user {
          name
          email
          created
        }
      }
    }
  }
`;

