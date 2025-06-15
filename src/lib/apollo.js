import { ApolloClient, InMemoryCache, createHttpLink, from, fromPromise } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { REFRESH_TOKEN_MUTATION } from '../queries';
import graphqlClient from './graphqlRequestClient';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.message.includes('not authorized') || err.message.includes('Unauthorized') || err.message.includes('jwt expired')) {
        console.warn('AccessToken 만료 감지, Refresh 시도');

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error('RefreshToken 없음');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return;
        }

        return fromPromise(
          graphqlClient.request(REFRESH_TOKEN_MUTATION, { refreshToken })
            .then((res) => {
              const { accessToken, refreshToken } = res.account.refreshToken;
              console.log('새 토큰 발급 성공', res);

              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', refreshToken);

              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  Authorization: `Bearer ${accessToken}`,
                },
              }));

              return forward(operation);
            })
            .catch(error => {
              console.error('Refresh 실패', error);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              throw error;
            })
        ).flatMap(result => result);
      }
      else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.error('오류 발생:', err);
      }
    }
  }
});

onError(({ graphQLErrors, operation, forward }) => {
  const refreshToken = localStorage.getItem('refreshToken');
  return fromPromise(
    graphqlClient.request(REFRESH_TOKEN_MUTATION, { refreshToken })
      .then((res) => {
        const { accessToken, refreshToken } = res.account.refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            Authorization: `Bearer ${accessToken}`,
          },
        }));

        return forward(operation);
      })
  ).flatMap(result => result);
});

const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

export default client;
