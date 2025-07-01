/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^(\.{1,2}/.*)\.js$": "$1",
    },
    roots: ["<rootDir>/tests"],
    testPathIgnorePatterns: ["\\.browser\\.(spec|test)\\.[jt]sx?$", "/tests/wire/"],
    setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts"],
    workerThreads: true,
    passWithNoTests: true,
};
