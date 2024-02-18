import { Config } from "jest";

// list to add ESM to ignore
const esModules = ["lodash-es"].join("|");

const config: Config = {
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
    transform: {
        "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
        "^.+\\.(t|j)s$": ["ts-jest", { isolatedModules: true }]
    },
    transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esModules})`]
};

export default config;
