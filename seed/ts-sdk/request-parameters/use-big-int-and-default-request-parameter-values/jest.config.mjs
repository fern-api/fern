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
            roots: ["<rootDir>/tests"],
            testPathIgnorePatterns: ["\.browser\.(spec|test)\.[jt]sx?$", "/tests/wire/"],
            setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts"],
        },
        {
            displayName: "browser",
            preset: "ts-jest",
            testEnvironment: "<rootDir>/tests/BrowserTestEnvironment.ts",
            moduleNameMapper: {
                "^(\.{1,2}/.*)\.js$": "$1",
            },
            roots: ["<rootDir>/tests"],
            testMatch: ["<rootDir>/tests/unit/**/?(*.)+(browser).(spec|test).[jt]s?(x)"],
            setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts"],
        },
        ,
        {
            displayName: "wire",
            preset: "ts-jest",
            testEnvironment: "node",
            moduleNameMapper: {
                "^(\.{1,2}/.*)\.js$": "$1",
            },
            roots: ["<rootDir>/tests/wire"],
            setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts", "<rootDir>/tests/mock-server/setup.ts"],
        },
    ],
    workerThreads: true,
    passWithNoTests: true,
};
