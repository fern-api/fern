import { describe, expect, it, vi } from "vitest";
import { retryWithRateLimit, TooManyRequestsError } from "../retryWithRateLimit.js";

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

describe("TooManyRequestsError", () => {
    it("should be an instance of Error", () => {
        const error = new TooManyRequestsError();
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(TooManyRequestsError);
    });

    it("should have the correct message", () => {
        const error = new TooManyRequestsError();
        expect(error.message).toBe("Received 429 Too Many Requests");
    });
});

describe("retryWithRateLimit", () => {
    const noDelay = async (_ms: number) => {
        // no-op: skip delay in tests
    };

    it("should return the result when fn succeeds on first try", async () => {
        const logger = createMockLogger();
        const result = await retryWithRateLimit({
            fn: async () => "success",
            retryRateLimited: true,
            logger,
            onRateLimitedWithoutRetry: () => {
                throw new Error("should not be called");
            },
            delayFn: noDelay
        });
        expect(result).toBe("success");
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should call onRateLimitedWithoutRetry when retryRateLimited is false and 429 occurs", async () => {
        const logger = createMockLogger();
        const onRateLimited = vi.fn(() => {
            throw new Error("Rate limited without retry");
        });

        await expect(
            retryWithRateLimit({
                fn: async () => {
                    throw new TooManyRequestsError();
                },
                retryRateLimited: false,
                logger,
                onRateLimitedWithoutRetry: onRateLimited as () => never,
                delayFn: noDelay
            })
        ).rejects.toThrow("Rate limited without retry");

        expect(onRateLimited).toHaveBeenCalledOnce();
    });

    it("should rethrow non-429 errors when retryRateLimited is false", async () => {
        const logger = createMockLogger();

        await expect(
            retryWithRateLimit({
                fn: async () => {
                    throw new Error("some other error");
                },
                retryRateLimited: false,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: noDelay
            })
        ).rejects.toThrow("some other error");
    });

    it("should retry up to 3 times on TooManyRequestsError and succeed", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        const result = await retryWithRateLimit({
            fn: async () => {
                callCount++;
                if (callCount <= 2) {
                    throw new TooManyRequestsError();
                }
                return "success after retries";
            },
            retryRateLimited: true,
            logger,
            onRateLimitedWithoutRetry: () => {
                throw new Error("should not be called");
            },
            delayFn: noDelay
        });

        expect(result).toBe("success after retries");
        expect(callCount).toBe(3);
        expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it("should throw after exhausting all 3 retries", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await expect(
            retryWithRateLimit({
                fn: async () => {
                    callCount++;
                    throw new TooManyRequestsError();
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: noDelay
            })
        ).rejects.toThrow(TooManyRequestsError);

        // 1 initial + 3 retries = 4 total calls
        expect(callCount).toBe(4);
        expect(logger.warn).toHaveBeenCalledTimes(3);
    });

    it("should rethrow non-429 errors immediately even when retryRateLimited is true", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await expect(
            retryWithRateLimit({
                fn: async () => {
                    callCount++;
                    throw new Error("network error");
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: noDelay
            })
        ).rejects.toThrow("network error");

        expect(callCount).toBe(1);
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should use exponential backoff delays", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];
        let callCount = 0;

        // Mock Math.random to return 0.5 (no jitter effect: 1 + (0.5 - 0.5) * 0.2 = 1.0)
        const originalRandom = Math.random;
        Math.random = () => 0.5;

        try {
            await retryWithRateLimit({
                fn: async () => {
                    callCount++;
                    throw new TooManyRequestsError();
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            }).catch(() => {
                // expected: exhausted retries
            });
        } finally {
            Math.random = originalRandom;
        }

        // With Math.random = 0.5, jitter factor = 1.0 (no jitter)
        // Attempt 0: 2000 * 2^0 = 2000ms
        // Attempt 1: 2000 * 2^1 = 4000ms
        // Attempt 2: 2000 * 2^2 = 8000ms
        expect(delays).toEqual([2000, 4000, 8000]);
    });

    it("should apply jitter to delays", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];

        // Mock Math.random to return 0.0 (minimum jitter: 1 + (0.0 - 0.5) * 0.2 = 0.9)
        const originalRandom = Math.random;
        Math.random = () => 0.0;

        try {
            await retryWithRateLimit({
                fn: async () => {
                    throw new TooManyRequestsError();
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            }).catch(() => {
                // expected: exhausted retries
            });
        } finally {
            Math.random = originalRandom;
        }

        // With Math.random = 0.0, jitter = 1 + (0.0 - 0.5) * 0.2 = 0.9
        // Attempt 0: round(2000 * 0.9) = 1800ms
        // Attempt 1: round(4000 * 0.9) = 3600ms
        // Attempt 2: round(8000 * 0.9) = 7200ms
        expect(delays).toEqual([1800, 3600, 7200]);
    });

    it("should cap exponential backoff delay at max retry delay", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];

        // Mock Math.random to return 0.5 (no jitter)
        const originalRandom = Math.random;
        Math.random = () => 0.5;

        try {
            await retryWithRateLimit({
                fn: async () => {
                    throw new TooManyRequestsError();
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            }).catch(() => {
                // expected: exhausted retries
            });
        } finally {
            Math.random = originalRandom;
        }

        // All delays should be <= 120000ms (max delay)
        for (const delay of delays) {
            expect(delay).toBeLessThanOrEqual(120000);
        }
    });

    it("should include attempt count in warn messages", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        await retryWithRateLimit({
            fn: async () => {
                callCount++;
                if (callCount <= 2) {
                    throw new TooManyRequestsError();
                }
                return "success";
            },
            retryRateLimited: true,
            logger,
            onRateLimitedWithoutRetry: () => {
                throw new Error("should not be called");
            },
            delayFn: noDelay
        });

        expect(logger.warn).toHaveBeenCalledTimes(2);
        const firstCall = logger.warn.mock.calls[0]?.[0] as string;
        const secondCall = logger.warn.mock.calls[1]?.[0] as string;
        expect(firstCall).toContain("attempt 1/3");
        expect(secondCall).toContain("attempt 2/3");
    });
});
