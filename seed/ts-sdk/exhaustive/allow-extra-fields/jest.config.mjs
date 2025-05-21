/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "(.+)\.js$": "$1",
    },
    setupFilesAfterEnv: ["<rootDir>/tests/mock-server/setup.ts"],
};
