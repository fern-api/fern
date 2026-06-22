import { describe, expect, it, vi } from "vitest";
import { retryWithBackoff } from "../retryWithBackoff.js";

function createMockLogger() {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn(),
        trace: vi.fn()
    };
}

const noDelay = async (_ms: number) => {
    // no-op: skip delay in tests
};

describe("retryWithBackoff", () => {
    it("should return the result when fn succeeds on first try", async () => {
        const logger = createMockLogger();
        const result = await retryWithBackoff({
            fn: async () => "success",
            maxRetries: 3,
            baseDelayMs: 1000,
            logger,
            delayFn: noDelay
        });
        expect(result).toBe("success");
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should retry and succeed after transient failures", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        const result = await retryWithBackoff({
            fn: async () => {
                callCount++;
                if (callCount <= 2) {
                    throw new Error("transient");
                }
                return "recovered";
            },
            maxRetries: 3,
            baseDelayMs: 1000,
            logger,
            label: "test-op",
            delayFn: noDelay
        });

        expect(result).toBe("recovered");
        expect(callCount).toBe(3);
        expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it("should throw after exhausting all retries", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await expect(
            retryWithBackoff({
                fn: async () => {
                    callCount++;
                    throw new Error("persistent failure");
                },
                maxRetries: 3,
                baseDelayMs: 1000,
                logger,
                delayFn: noDelay
            })
        ).rejects.toThrow("persistent failure");

        // 1 initial + 3 retries = 4 total calls
        expect(callCount).toBe(4);
    });

    it("should fail fast on non-retryable errors without retrying", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        const isRetryable = (error: unknown) => {
            const err = error as Record<string, unknown>;
            return err.statusCode == null || (err.statusCode as number) >= 500;
        };

        await expect(
            retryWithBackoff({
                fn: async () => {
                    callCount++;
                    const err = new Error("bad request") as Error & { statusCode: number };
                    err.statusCode = 400;
                    throw err;
                },
                maxRetries: 3,
                baseDelayMs: 1000,
                isRetryable,
                logger,
                delayFn: noDelay
            })
        ).rejects.toThrow("bad request");

        expect(callCount).toBe(1);
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should retry on retryable errors determined by isRetryable", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        const isRetryable = (error: unknown) => {
            const err = error as Record<string, unknown>;
            return (err.statusCode as number) >= 500;
        };

        await expect(
            retryWithBackoff({
                fn: async () => {
                    callCount++;
                    const err = new Error("server error") as Error & { statusCode: number };
                    err.statusCode = 502;
                    throw err;
                },
                maxRetries: 2,
                baseDelayMs: 1000,
                isRetryable,
                logger,
                delayFn: noDelay
            })
        ).rejects.toThrow("server error");

        // 1 initial + 2 retries = 3 total calls
        expect(callCount).toBe(3);
    });

    it("should use exponential backoff delays without jitter", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];

        await retryWithBackoff({
            fn: async () => {
                throw new Error("fail");
            },
            maxRetries: 3,
            baseDelayMs: 1000,
            logger,
            delayFn: async (ms: number) => {
                delays.push(ms);
            }
        }).catch(() => {
            // expected
        });

        // jitterFactor defaults to 0, so no jitter:
        // Attempt 0: 1000 * 2^0 = 1000ms
        // Attempt 1: 1000 * 2^1 = 2000ms
        // Attempt 2: 1000 * 2^2 = 4000ms
        expect(delays).toEqual([1000, 2000, 4000]);
    });

    it("should apply jitter when jitterFactor is set", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];

        // Mock Math.random to return 0.0 (minimum jitter: 1 + (0.0 - 0.5) * 0.5 = 0.75)
        const originalRandom = Math.random;
        Math.random = () => 0.0;

        try {
            await retryWithBackoff({
                fn: async () => {
                    throw new Error("fail");
                },
                maxRetries: 3,
                baseDelayMs: 1000,
                jitterFactor: 0.5,
                logger,
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            }).catch(() => {
                // expected
            });
        } finally {
            Math.random = originalRandom;
        }

        // jitter = 1 + (0.0 - 0.5) * 0.5 = 0.75
        // Attempt 0: round(1000 * 1 * 0.75) = 750ms
        // Attempt 1: round(1000 * 2 * 0.75) = 1500ms
        // Attempt 2: round(1000 * 4 * 0.75) = 3000ms
        expect(delays).toEqual([750, 1500, 3000]);
    });

    it("should apply no jitter when Math.random returns 0.5", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];

        const originalRandom = Math.random;
        Math.random = () => 0.5;

        try {
            await retryWithBackoff({
                fn: async () => {
                    throw new Error("fail");
                },
                maxRetries: 3,
                baseDelayMs: 1000,
                jitterFactor: 0.5,
                logger,
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            }).catch(() => {
                // expected
            });
        } finally {
            Math.random = originalRandom;
        }

        // jitter = 1 + (0.5 - 0.5) * 0.5 = 1.0 (no jitter)
        expect(delays).toEqual([1000, 2000, 4000]);
    });

    it("should include label and attempt count in warn messages", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await retryWithBackoff({
            fn: async () => {
                callCount++;
                if (callCount <= 2) {
                    throw new Error("fail");
                }
                return "ok";
            },
            maxRetries: 3,
            baseDelayMs: 1000,
            logger,
            label: "registerApiDefinition failed for my-api",
            delayFn: noDelay
        });

        expect(logger.warn).toHaveBeenCalledTimes(2);
        const firstCall = logger.warn.mock.calls[0]?.[0] as string;
        const secondCall = logger.warn.mock.calls[1]?.[0] as string;
        expect(firstCall).toContain("registerApiDefinition failed for my-api");
        expect(firstCall).toContain("attempt 1/4");
        expect(secondCall).toContain("attempt 2/4");
    });

    it("should not log warnings when label is omitted", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await retryWithBackoff({
            fn: async () => {
                callCount++;
                if (callCount <= 1) {
                    throw new Error("fail");
                }
                return "ok";
            },
            maxRetries: 3,
            baseDelayMs: 1000,
            logger,
            delayFn: noDelay
        });

        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should work with maxRetries = 0 (no retries)", async () => {
        const logger = createMockLogger();

        await expect(
            retryWithBackoff({
                fn: async () => {
                    throw new Error("immediate fail");
                },
                maxRetries: 0,
                baseDelayMs: 1000,
                logger,
                delayFn: noDelay
            })
        ).rejects.toThrow("immediate fail");
    });

    it("should default isRetryable to always-retry", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await retryWithBackoff({
            fn: async () => {
                callCount++;
                if (callCount <= 2) {
                    throw new Error("any error");
                }
                return "ok";
            },
            maxRetries: 3,
            baseDelayMs: 1000,
            logger,
            delayFn: noDelay
        });

        expect(callCount).toBe(3);
    });

    it("should pass the thrown error to isRetryable", async () => {
        const logger = createMockLogger();
        const errorsSeenByIsRetryable: unknown[] = [];

        const sentinel = new Error("sentinel");

        await retryWithBackoff({
            fn: async () => {
                throw sentinel;
            },
            maxRetries: 1,
            baseDelayMs: 1000,
            isRetryable: (error) => {
                errorsSeenByIsRetryable.push(error);
                return true;
            },
            logger,
            delayFn: noDelay
        }).catch(() => {
            // expected
        });

        expect(errorsSeenByIsRetryable).toHaveLength(2);
        expect(errorsSeenByIsRetryable[0]).toBe(sentinel);
        expect(errorsSeenByIsRetryable[1]).toBe(sentinel);
    });
});
