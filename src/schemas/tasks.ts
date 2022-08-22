import { gql } from "apollo-server";

export default gql`
  enum Status {
    todo
    in_progress
    done
    archived
  }

  type Task {
    _id: ID!
    title: String!
    description: String
    status: Status
    createdBy: String
  }

  type Query {
    tasks: [Task]
    task(id: String!): Task
  }

  type Mutation {
    createTask(title: String!, status: Status!, description: String): Task
    updateTask(id: String!, status: Status!): Task
  }
`;
