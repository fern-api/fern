

            import { defineConfig } from "vitest/config";
            export default defineConfig({
                test: {
                    projects: [
                        {
                            test: {
                                globals: true,
                                name: "unit",
                                environment: "node",
                                root: "./src/test-packagePath/tests",
                                include: ["**/*.test.{js,ts,jsx,tsx}"],
                                exclude: ["wire/**"],
                                setupFiles: ["./setup.ts"]
                            }
                        },
                        {
                                    test: {
                                        globals: true,
                                        name: "wire",
                                        environment: "node",
                                        root: "./src/test-packagePath/tests/wire",
                                        setupFiles: ["../setup.ts", "../mock-server/setup.ts"]
                                    }
                                },
                    ],
                    passWithNoTests: true
                }
            });
            