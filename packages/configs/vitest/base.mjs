import { defineConfig } from "vitest/config";

export { defineConfig, mergeConfig } from "vitest/config";

export const defaultConfig = {
    test: {
        globals: true,
        include: ["**/*.{test,spec}.ts"],
        exclude: ["**/node_modules/**", "**/dist/**", "**/lib/**"],
        server: {
            deps: {
                fallbackCJS: true
            }
        },
        reporters: process.env.CI ? [["default", { summary: false }], "github-actions"] : ["default"],
        maxConcurrency: 10,
        passWithNoTests: true
    }
};

export default defineConfig(defaultConfig);
