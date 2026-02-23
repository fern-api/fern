import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: ["./generators/**/vitest.config.ts", "./packages/**/vitest.config.ts"]
    }
});
