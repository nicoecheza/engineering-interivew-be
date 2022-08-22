### Requirements for running locally (otherwise, just Docker)
* Node v18
* MongoDB (v4 or v5 should be ok)

### Commands:
* npm start (run app locally, you need Mongo installed)
* npm run docker-start (builds and run app in Docker container on localhost:80)
* npm run test
* npm run build
* npm run dev (uses nodemon)

### Disclaimer:
First time doing stuff with GraphQL, but I wanted to go for the extra credits.
Tried to keep the boilerplate/conf to the minimum.
I would have liked to have more time to invest in the challenge
since there are some things I did not have time to research/learn.

Questions/unsolved issues that have raised during implementation:

* Resolvers args typings?
* Where should business logic live? (resolvers/datasources)
* How to share TS interfaces with Schemas?
* Error handling status codes?
* Write more tests (did the basic ones...)

Also, made use of `dos-config`, a module I've been using for a while. Pretty much
the same as `dotenv` but allows having a some `json` as typing structure for env vars
that depends on `NODE_ENV` variable.
So to run it for development, you will need a `config/development.json` file that includes:
```json
{
  "mongo": {
    "url": "mongodb://127.0.0.1:27017"
  }
}

```
And for running the tests, you will need the same file, but named as `config/test.json` 👍
