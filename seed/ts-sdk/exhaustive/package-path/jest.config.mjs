/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\.{1,2}/.*)\.js$": "$1",
    },
    testPathIgnorePatterns: ["<rootDir>/.*\\.browser\\.test\\.ts$"],
    setupFilesAfterEnv: ["<rootDir>/src/test-packagePath/tests/mock-server/setup.ts"],

    passWithNoTests: true,
};
