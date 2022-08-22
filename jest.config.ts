import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  roots: ['<rootDir>/src/tests/integration'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageReporters: ["text"],
  setupFilesAfterEnv: ['<rootDir>/src/tests/integration/setup.ts'],
};
export default config;
