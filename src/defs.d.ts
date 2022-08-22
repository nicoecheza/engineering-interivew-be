declare module 'dos-config' {
  const config: Config;

  export interface Jwt {
    expiration: string;
    secret: string;
  }

  export interface Mongo {
    db: string;
    url: string;
  }

  export interface Config {
    env: string;
    jwt: Jwt;
    mongo: Mongo;
    passwordSalt: string;
    port: string;
  }

  export default config;
}
