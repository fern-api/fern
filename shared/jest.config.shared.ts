// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";

const config: Config = {
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
    transform: {
        "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
    },
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
    modulePathIgnorePatterns: ["<rootDir>/(?:.+/)?__test__/.*/generated"],
};

export default config;
