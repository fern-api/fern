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

    it("should store retryAfterSeconds when provided", () => {
        const error = new TooManyRequestsError(30);
        expect(error.retryAfterSeconds).toBe(30);
    });

    it("should have undefined retryAfterSeconds when not provided", () => {
        const error = new TooManyRequestsError();
        expect(error.retryAfterSeconds).toBeUndefined();
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

    it("should retry up to 5 times on TooManyRequestsError and succeed", async () => {
        const logger = createMockLogger();
        let callCount = 0;

        const result = await retryWithRateLimit({
            fn: async () => {
                callCount++;
                if (callCount <= 4) {
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
        expect(callCount).toBe(5);
        expect(logger.warn).toHaveBeenCalledTimes(4);
    });

    it("should throw after exhausting all 5 retries", async () => {
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

        // 1 initial + 5 retries = 6 total calls
        expect(callCount).toBe(6);
        expect(logger.warn).toHaveBeenCalledTimes(5);
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

        // Mock Math.random to return 0.5 (no jitter effect: 1 + (0.5 - 0.5) * 0.5 = 1.0)
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
        // Attempt 3: 2000 * 2^3 = 16000ms
        // Attempt 4: 2000 * 2^4 = 32000ms
        expect(delays).toEqual([2000, 4000, 8000, 16000, 32000]);
    });

    it("should apply jitter to delays", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];

        // Mock Math.random to return 0.0 (minimum jitter: 1 + (0.0 - 0.5) * 0.5 = 0.75)
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

        // With Math.random = 0.0, jitter = 1 + (0.0 - 0.5) * 0.5 = 0.75
        // Attempt 0: round(2000 * 0.75) = 1500ms
        // Attempt 1: round(4000 * 0.75) = 3000ms
        // Attempt 2: round(8000 * 0.75) = 6000ms
        // Attempt 3: round(16000 * 0.75) = 12000ms
        // Attempt 4: round(32000 * 0.75) = 24000ms
        expect(delays).toEqual([1500, 3000, 6000, 12000, 24000]);
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
        expect(firstCall).toContain("attempt 1/5");
        expect(secondCall).toContain("attempt 2/5");
    });

    it("should use server retryAfter hint as minimum delay when provided", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];
        let callCount = 0;

        // Mock Math.random to return 0.5 (no jitter effect)
        const originalRandom = Math.random;
        Math.random = () => 0.5;

        try {
            await retryWithRateLimit({
                fn: async () => {
                    callCount++;
                    if (callCount <= 1) {
                        // Server says wait 30 seconds
                        throw new TooManyRequestsError(30);
                    }
                    return "success";
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            });
        } finally {
            Math.random = originalRandom;
        }

        // Attempt 0 base delay: 2000ms, server hint: 30000ms → effective: 30000ms
        // With jitter = 1.0: 30000ms
        expect(delays).toEqual([30000]);
    });

    it("should not let jitter reduce delay below server retryAfter hint", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];
        let callCount = 0;

        // Mock Math.random to return 0.0 (minimum jitter: 1 + (0.0 - 0.5) * 0.5 = 0.75)
        const originalRandom = Math.random;
        Math.random = () => 0.0;

        try {
            await retryWithRateLimit({
                fn: async () => {
                    callCount++;
                    if (callCount <= 1) {
                        // Server says wait 30 seconds
                        throw new TooManyRequestsError(30);
                    }
                    return "success";
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            });
        } finally {
            Math.random = originalRandom;
        }

        // Without the floor: effectiveBase=30000, jitter=0.75 → 22500ms (below 30s!)
        // With the floor: max(22500, 30000) = 30000ms
        expect(delays).toEqual([30000]);
    });

    it("should use exponential backoff when it exceeds server retryAfter", async () => {
        const logger = createMockLogger();
        const delays: number[] = [];
        let callCount = 0;

        // Mock Math.random to return 0.5 (no jitter)
        const originalRandom = Math.random;
        Math.random = () => 0.5;

        try {
            await retryWithRateLimit({
                fn: async () => {
                    callCount++;
                    if (callCount <= 1) {
                        // Server says wait 1 second, but backoff is 2s → use backoff
                        throw new TooManyRequestsError(1);
                    }
                    return "success";
                },
                retryRateLimited: true,
                logger,
                onRateLimitedWithoutRetry: () => {
                    throw new Error("should not be called");
                },
                delayFn: async (ms: number) => {
                    delays.push(ms);
                }
            });
        } finally {
            Math.random = originalRandom;
        }

        // Server says 1s (1000ms), but backoff base is 2000ms → use 2000ms
        expect(delays).toEqual([2000]);
    });
});
