import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["**/*.{test,spec}.ts"],
        server: {
            deps: {
                fallbackCJS: true
            }
        },
        maxConcurrency: 10,
        pool: "threads",
        poolOptions: {
            threads: {
                useAtomics: true
            }
        }
    }
});
