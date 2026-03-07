import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.test.ts", "cpp/src/**/*.test.ts"]
    }
});
