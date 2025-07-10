/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    projects: [
        {
            displayName: "unit",
            preset: "ts-jest",
            testEnvironment: "node",
            moduleNameMapper: {
                "^(\.{1,2}/.*)\.js$": "$1",
            },
            roots: ["<rootDir>/src/test-packagePath/tests"],
            testPathIgnorePatterns: ["\.browser\.(spec|test)\.[jt]sx?$", "/tests/wire/"],
            setupFilesAfterEnv: [],
        },
        {
            displayName: "browser",
            preset: "ts-jest",
            testEnvironment: "<rootDir>/src/test-packagePath/tests/BrowserTestEnvironment.ts",
            moduleNameMapper: {
                "^(\.{1,2}/.*)\.js$": "$1",
            },
            roots: ["<rootDir>/src/test-packagePath/tests"],
            testMatch: ["<rootDir>/tests/unit/**/?(*.)+(browser).(spec|test).[jt]s?(x)"],
            setupFilesAfterEnv: [],
        },
        ,
        {
            displayName: "wire",
            preset: "ts-jest",
            testEnvironment: "node",
            moduleNameMapper: {
                "^(\.{1,2}/.*)\.js$": "$1",
            },
            roots: ["<rootDir>/src/test-packagePath/tests/wire"],
            setupFilesAfterEnv: ["<rootDir>/src/test-packagePath/tests/mock-server/setup.ts"],
        },
    ],
    workerThreads: false,
    passWithNoTests: true,
};
