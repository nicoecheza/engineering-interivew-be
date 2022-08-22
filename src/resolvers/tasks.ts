export default {
  Query: {
    tasks: async (_: any, _2: any, { dataSources }: any) => {
      return dataSources.tasks.getTasks();
    },
    task: async (_: any, args: any, { dataSources }: any) => {
      return dataSources.tasks.getTask(args);
    },
  },
  Mutation: {
    createTask: async (_: any, args: any, { dataSources }: any) => {
      return dataSources.tasks.createTask(args);
    },
    updateTask: async (_: any, args: any, { dataSources }: any) => {
      return dataSources.tasks.updateTask(args);
    },
  }
};
