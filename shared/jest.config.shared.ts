// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";

const config: Config = {
    preset: "ts-jest/presets/default-esm",
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    testEnvironment: "node",
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
};

export default config;
