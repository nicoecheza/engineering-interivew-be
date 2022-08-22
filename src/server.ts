import config from 'dos-config';
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { Db } from 'mongodb';

import typeDefs from './schemas';
import resolvers from './resolvers';
import getSources from './data-sources';
import { getToken } from './helpers/jwt';

export default async (db: Db) => {
  const apolloInstance = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    dataSources: () => getSources(db),
    context: async ({ req }) => {
      const session = getToken(req.headers.authorization);
      return { session };
    },
  });

  const server = await apolloInstance.listen({ port: config.port });
  return server;
};
