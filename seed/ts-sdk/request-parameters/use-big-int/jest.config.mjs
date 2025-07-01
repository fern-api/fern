/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\.{1,2}/.*)\.js$": "$1",
    },
    testPathIgnorePatterns: ["<rootDir>/.*\\.browser\\.test\\.ts$"],
    setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts", "<rootDir>/tests/mock-server/setup.ts"],
    workerThreads: true,
    passWithNoTests: true,
};
