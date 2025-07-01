/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\.{1,2}/.*)\.js$": "$1",
    },
    roots: ["<rootDir>/src/test-packagePath/tests"],
    testPathIgnorePatterns: ["\\.browser\\.(spec|test)\\.[jt]sx?$", "/tests/wire/"],
    setupFilesAfterEnv: [],
    workerThreads: false,
    passWithNoTests: true,
};
