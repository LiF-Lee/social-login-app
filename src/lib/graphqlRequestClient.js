import { GraphQLClient } from 'graphql-request';

const graphqlClient = new GraphQLClient(import.meta.env.VITE_API_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export default graphqlClient;
