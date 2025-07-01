/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "<rootDir>/tests/BrowserTestEnvironment.ts",
    moduleNameMapper: {
        "^(\.{1,2}/.*)\.js$": "$1",
    },
    roots: ["<rootDir>/src/test-packagePath/tests"],
    testMatch: ["<rootDir>/tests/unit/**/?(*.)+(browser).(spec|test).[jt]s?(x)"],
    workerThreads: false,
    passWithNoTests: true,
};
