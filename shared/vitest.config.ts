import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["**/*.{test,spec}.ts"],
        exclude: ["**/node_modules/**", "**/dist/**"],
        server: {
            deps: {
                fallbackCJS: true
            }
        },
        maxConcurrency: 10,
        passWithNoTests: true
    }
});
