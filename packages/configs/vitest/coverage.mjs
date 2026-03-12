import { defineConfig } from "vitest/config";

import { defaultConfig } from "./base.mjs";

export const coverageConfig = {
    ...defaultConfig,
    test: {
        ...defaultConfig.test,
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary", "html"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
            exclude: [
                "**/node_modules/**",
                "**/dist/**",
                "**/lib/**",
                "**/__test__/**",
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/index.ts"
            ]
        }
    }
};

export default defineConfig(coverageConfig);
