import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["src/__e2e__/**/*.e2e.test.ts"],
        server: {
            deps: {
                fallbackCJS: true
            }
        },
        reporters: ["default"],
        testTimeout: 30_000,
        passWithNoTests: true
    }
});
