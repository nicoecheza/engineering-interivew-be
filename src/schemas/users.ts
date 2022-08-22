import { gql } from "apollo-server";

export default gql`
  type User {
    _id: ID!
    email: String!
    password: String!
  }

  # doing this 👇 for excluding a prop it's wrong, but again, I think this
  # should be shared with TS interfaces so I can just Omit<User, 'password'>...
  type UserOutput {
    _id: ID!
    email: String!
  }

  type Mutation {
    login(email: String!, password: String!): String!
    createUser(email: String!, password: String!): UserOutput
  }
`;
