import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DevServerExpiryReason, DevServerLifetime } from "../astro/DevServerLifetime.js";

describe("DevServerLifetime", () => {
    let expired: DevServerExpiryReason[];
    const onExpire = (reason: DevServerExpiryReason): void => {
        expired.push(reason);
    };

    beforeEach(() => {
        expired = [];
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("never expires when no timeouts are set", () => {
        const lifetime = new DevServerLifetime({ onExpire });
        lifetime.start();
        vi.advanceTimersByTime(24 * 60 * 60 * 1000);
        expect(expired).toEqual([]);
        expect(vi.getTimerCount()).toBe(0);
    });

    it("does not start any clock before start()", () => {
        const lifetime = new DevServerLifetime({ timeoutMs: 1000, idleTimeoutMs: 1000, onExpire });
        vi.advanceTimersByTime(5000);
        expect(expired).toEqual([]);
        lifetime.start();
        vi.advanceTimersByTime(1000);
        expect(expired).toHaveLength(1);
    });

    it("expires with timeout regardless of request activity", () => {
        const lifetime = new DevServerLifetime({ timeoutMs: 1000, onExpire });
        lifetime.start();
        lifetime.requestStarted();
        vi.advanceTimersByTime(999);
        expect(expired).toEqual([]);
        vi.advanceTimersByTime(1);
        expect(expired).toEqual(["timeout"]);
    });

    it("expires with idle-timeout after no requests", () => {
        const lifetime = new DevServerLifetime({ idleTimeoutMs: 1000, onExpire });
        lifetime.start();
        vi.advanceTimersByTime(1000);
        expect(expired).toEqual(["idle-timeout"]);
    });

    it("restarts the idle clock when a request finishes", () => {
        const lifetime = new DevServerLifetime({ idleTimeoutMs: 1000, onExpire });
        lifetime.start();
        vi.advanceTimersByTime(900);
        lifetime.requestStarted();
        lifetime.requestFinished();
        vi.advanceTimersByTime(900);
        expect(expired).toEqual([]);
        vi.advanceTimersByTime(100);
        expect(expired).toEqual(["idle-timeout"]);
    });

    it("does not idle out while a request is in flight", () => {
        const lifetime = new DevServerLifetime({ idleTimeoutMs: 1000, onExpire });
        lifetime.start();
        lifetime.requestStarted();
        lifetime.requestStarted();
        vi.advanceTimersByTime(5000);
        lifetime.requestFinished();
        vi.advanceTimersByTime(5000);
        expect(expired).toEqual([]);
        lifetime.requestFinished();
        vi.advanceTimersByTime(1000);
        expect(expired).toEqual(["idle-timeout"]);
    });

    it("fires only once when both clocks would expire", () => {
        const lifetime = new DevServerLifetime({ timeoutMs: 1000, idleTimeoutMs: 1000, onExpire });
        lifetime.start();
        vi.advanceTimersByTime(10_000);
        expect(expired).toHaveLength(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it("clears every timer on dispose", () => {
        const lifetime = new DevServerLifetime({ timeoutMs: 1000, idleTimeoutMs: 500, onExpire });
        lifetime.start();
        expect(vi.getTimerCount()).toBe(2);
        lifetime.dispose();
        expect(vi.getTimerCount()).toBe(0);
        lifetime.requestFinished();
        lifetime.start();
        expect(vi.getTimerCount()).toBe(0);
        vi.advanceTimersByTime(10_000);
        expect(expired).toEqual([]);
    });
});
