/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "(.+)\.js$": "$1",
    },
    setupFilesAfterEnv: ["<rootDir>/src/test-packagePath/tests/mock-server/setup.ts"],
};
