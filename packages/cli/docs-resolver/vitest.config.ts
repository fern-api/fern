import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["**/*.{test,spec}.ts"],
        server: {
            deps: {
                fallbackCJS: true,
                inline: ["@fern-api/ui-core-utils"]
            }
        },
        maxConcurrency: 10,
        passWithNoTests: true
    }
});
