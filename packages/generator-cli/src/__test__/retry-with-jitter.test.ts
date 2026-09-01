import { describe, expect, it } from "vitest";

import { parseRetryAfterMs, RetryableError, retryWithJitter } from "../pipeline/retryWithJitter";

describe("retryWithJitter", () => {
    it("returns the first successful result without sleeping", async () => {
        const delays: number[] = [];
        const result = await retryWithJitter(async () => "ok", {
            sleep: async (ms) => {
                delays.push(ms);
            }
        });

        expect(result).toBe("ok");
        expect(delays).toEqual([]);
    });

    it("backs off exponentially with jitter inside ±20% of the base delay", async () => {
        const delays: number[] = [];
        let attempts = 0;

        const result = await retryWithJitter(
            async () => {
                attempts++;
                if (attempts < 4) {
                    throw new RetryableError("transient");
                }
                return attempts;
            },
            {
                maxAttempts: 4,
                initialDelayMs: 1000,
                sleep: async (ms) => {
                    delays.push(ms);
                }
            }
        );

        expect(result).toBe(4);
        expect(delays).toHaveLength(3);
        for (const [index, base] of [1000, 2000, 4000].entries()) {
            const delay = delays[index] as number;
            expect(delay).toBeGreaterThanOrEqual(base * 0.8);
            expect(delay).toBeLessThanOrEqual(base * 1.2);
        }
        // Jitter must actually vary the delays, otherwise concurrent generators
        // resynchronize onto the same backoff schedule.
        expect(delays.some((delay, index) => delay !== [1000, 2000, 4000][index])).toBe(true);
    });

    it("caps the delay at maxDelayMs before jitter", async () => {
        const delays: number[] = [];

        await expect(
            retryWithJitter(
                async () => {
                    throw new RetryableError("transient");
                },
                {
                    maxAttempts: 4,
                    initialDelayMs: 10_000,
                    maxDelayMs: 15_000,
                    sleep: async (ms) => {
                        delays.push(ms);
                    }
                }
            )
        ).rejects.toThrow("transient");

        expect(delays).toHaveLength(3);
        for (const delay of delays) {
            expect(delay).toBeLessThanOrEqual(15_000 * 1.2);
        }
    });

    it("honors a Retry-After hint over the exponential schedule", async () => {
        const delays: number[] = [];
        let attempts = 0;

        await retryWithJitter(
            async () => {
                attempts++;
                if (attempts === 1) {
                    throw new RetryableError("rate limited", { retryAfterMs: 5_000 });
                }
                return attempts;
            },
            {
                initialDelayMs: 1_000,
                sleep: async (ms) => {
                    delays.push(ms);
                }
            }
        );

        expect(delays).toHaveLength(1);
        expect(delays[0] as number).toBeGreaterThanOrEqual(4_000);
        expect(delays[0] as number).toBeLessThanOrEqual(6_000);
    });

    it("does not retry errors that are not retryable", async () => {
        let attempts = 0;

        await expect(
            retryWithJitter(
                async () => {
                    attempts++;
                    throw new Error("bad request");
                },
                { sleep: async () => undefined }
            )
        ).rejects.toThrow("bad request");

        expect(attempts).toBe(1);
    });

    it("stops after maxAttempts and rethrows the last error", async () => {
        let attempts = 0;

        await expect(
            retryWithJitter(
                async () => {
                    attempts++;
                    throw new RetryableError(`failure ${attempts}`);
                },
                { maxAttempts: 3, sleep: async () => undefined }
            )
        ).rejects.toThrow("failure 3");

        expect(attempts).toBe(3);
    });
});

describe("parseRetryAfterMs", () => {
    it("parses delay-seconds", () => {
        expect(parseRetryAfterMs("30")).toBe(30_000);
    });

    it("parses an HTTP date into a non-negative delay", () => {
        const value = parseRetryAfterMs(new Date(Date.now() + 10_000).toUTCString());
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThanOrEqual(10_000);
    });

    it("returns undefined for missing or unparseable values", () => {
        expect(parseRetryAfterMs(undefined)).toBeUndefined();
        expect(parseRetryAfterMs("")).toBeUndefined();
        expect(parseRetryAfterMs("soon")).toBeUndefined();
        expect(parseRetryAfterMs("-5")).toBeUndefined();
    });
});
