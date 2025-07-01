/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\.{1,2}/.*)\.js$": "$1",
    },
    roots: ["<rootDir>/tests"],
    testMatch: ["<rootDir>/tests/wire/**/?(*.)+(spec|test).[jt]s?(x)"],
    setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts", "<rootDir>/tests/mock-server/setup.ts"],
    workerThreads: true,
    passWithNoTests: true,
};
