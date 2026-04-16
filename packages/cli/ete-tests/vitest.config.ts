import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default defineConfig(
    mergeConfig(defaultConfig, {
        test: {
            // ETE tests spawn heavy child processes (Node CLI, Docker containers).
            // Limit parallelism to avoid resource contention on CI runners.
            maxConcurrency: 5,
            // Retry failed tests in CI to handle transient Docker/network issues
            // that cause intermittent timeouts.
            retry: process.env.CI ? 2 : 0,
            poolOptions: {
                threads: {
                    maxThreads: 3
                },
                forks: {
                    maxForks: 3
                }
            }
        }
    })
);
