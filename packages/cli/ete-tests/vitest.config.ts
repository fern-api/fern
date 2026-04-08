import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default defineConfig(
    mergeConfig(defaultConfig, {
        test: {
            // ETE tests spawn heavy child processes (Node CLI, Docker containers).
            // Running too many test files in parallel causes resource contention
            // and widespread timeouts on CI runners.
            fileParallelism: false,
            maxConcurrency: 3,
            poolOptions: {
                threads: {
                    maxThreads: 2
                },
                forks: {
                    maxForks: 2
                }
            }
        }
    })
);
