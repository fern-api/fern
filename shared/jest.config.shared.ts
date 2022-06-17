// eslint-disable-next-line jest/no-jest-import
import { Config } from "jest";

const config: Config = {
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
    transformIgnorePatterns: ["/node_modules/(?!lodash-es)"],
    transform: {
        ".*\\.ts$": ["babel-jest", { rootMode: "upward" }],
    },
};

export default config;
