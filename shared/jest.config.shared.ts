// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
};

export default config;
