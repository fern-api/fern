// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    // preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    // extensionsToTreatAsEsm: [".ts"],
    // globals: {
    //     "ts-jest": {
    //         useESM: true,
    //     },
    // },
    // moduleNameMapper: {
    //     "^(\\.{1,2}/.*)\\.js$": "$1",
    // },
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
    // transform: {
    //     ".*\\.ts$": ["babel-jest", { rootMode: "upward" }],
    // },
    // extensionsToTreatAsEsm: [".ts"],
    // extensionsToTreatAsEsm: [".ts"],
    // globals: {
    //     "ts-jest": {
    //         useESM: true,
    //     },
    // },
};

export default config;
