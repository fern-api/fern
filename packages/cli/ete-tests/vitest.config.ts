import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default defineConfig(
    mergeConfig(defaultConfig, {
        test: {
            // ETE tests spawn heavy child processes (Node CLI, Docker containers).
            // Running too many test files in parallel causes resource contention
            // and widespread timeouts on CI runners.
            //
            // Effective cap: 3 file-workers × 5 in-file concurrent tests = 15
            // concurrent CLI processes (down from 4 × 10 = 40).
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
