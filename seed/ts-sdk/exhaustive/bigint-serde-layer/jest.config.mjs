/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "(.+)\.js$": "$1",
    },
    setupFilesAfterEnv: ["<rootDir>/tests/bigint.setup.ts", "<rootDir>/tests/mock-server/setup.ts"],
    workerThreads: true,
};
