import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default defineConfig(
    mergeConfig(defaultConfig, {
        test: {
            // ETE tests spawn heavy child processes (Node CLI, Docker containers).
            // Limit parallelism to avoid resource contention on CI runners.
            maxConcurrency: 5,
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
