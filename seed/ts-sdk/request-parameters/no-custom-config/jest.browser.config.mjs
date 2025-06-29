/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "<rootDir>/tests/BrowserTestEnvironment.ts",
    testMatch: ["**/tests/**/*.browser.test.ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    passWithNoTests: true,
};
