export default {
  Mutation: {
    login: async (_: any, args: any, { dataSources }: any) => {
      return dataSources.users.login(args);
    },
    createUser: async (_: any, args: any, { dataSources }: any) => {
      return dataSources.users.createUser(args);
    },
  }
};
