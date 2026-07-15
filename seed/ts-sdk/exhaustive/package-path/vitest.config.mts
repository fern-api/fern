import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        typecheck: {
            enabled: true,
            tsconfig: "./src/test-packagePath/tests/tsconfig.json",
        },
        projects: [
            {
                test: {
                    globals: true,
                    name: "unit",
                    environment: "node",
                    root: "./src/test-packagePath/tests",
                    include: ["**/*.test.{js,ts,jsx,tsx}"],
                    exclude: ["wire/**"],
                    setupFiles: ["./setup.ts"],
                },
            },
            {
                test: {
                    globals: true,
                    name: "wire",
                    environment: "node",
                    root: "./src/test-packagePath/tests/wire",
                    setupFiles: ["../setup.ts", "../mock-server/setup.ts"],
                },
            },
        ],
        passWithNoTests: true,
    },
});
