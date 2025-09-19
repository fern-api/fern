import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    globals: true,
                    name: "unit",
                    environment: "node",
                    root: "./tests",
                    include: ["**/*.test.{js,ts,jsx,tsx}"],
                    exclude: ["**/*.browser.(spec|test).[jt]sx?", "wire/**"],
                },
            },
            {
                test: {
                    globals: true,
                    name: "browser",
                    environment: "happy-dom",
                    root: "./tests",
                    include: ["unit/**/?(*.)+(browser).(spec|test).[jt]s?(x)"],
                },
            },
            {
                test: {
                    globals: true,
                    name: "wire",
                    environment: "node",
                    root: "./tests/wire",
                    setupFiles: ["./mock-server/setup.ts"],
                },
            },
        ],
        passWithNoTests: true,
    },
});
