import { describe, expect, it, vi } from "vitest";

import { getCliReleaseEnvironment } from "../src/feature-flags/CliReleaseEnvironment.js";
import {
    type FeatureFlagEvaluator,
    isFeatureFlagValueEnabled,
    NoopFeatureFlagClient,
    PosthogFeatureFlagClient
} from "../src/feature-flags/FeatureFlagClient.js";

type FlagResult = Awaited<ReturnType<FeatureFlagEvaluator["getFeatureFlagResult"]>>;

function createClient(result: FlagResult | Error = undefined) {
    const getFeatureFlagResult = vi.fn(async (): Promise<FlagResult> => {
        if (result instanceof Error) {
            throw result;
        }
        return result;
    });
    const client = new PosthogFeatureFlagClient({
        environment: "pre-prod",
        evaluator: { getFeatureFlagResult } satisfies FeatureFlagEvaluator
    });
    return { client, getFeatureFlagResult };
}

describe("PosthogFeatureFlagClient", () => {
    it("evaluates the flag per organization with org and environment as targeting properties", async () => {
        const { client, getFeatureFlagResult } = createClient({
            key: "use-sdk-gen-api",
            enabled: true,
            variant: undefined,
            payload: undefined
        });

        await expect(client.isEnabled("use-sdk-gen-api", { org: "acme" })).resolves.toBe(true);

        expect(getFeatureFlagResult).toHaveBeenCalledWith("use-sdk-gen-api", "org:acme", {
            personProperties: { org: "acme", environment: "pre-prod" },
            groups: { organization: "acme" },
            groupProperties: { organization: { org: "acme", environment: "pre-prod" } },
            sendFeatureFlagEvents: false
        });
    });

    it.each([
        { name: "a missing flag", result: undefined },
        {
            name: "a disabled boolean flag",
            result: { key: "use-sdk-gen-api", enabled: false, variant: undefined, payload: undefined }
        },
        { name: "a request failure", result: new Error("network down") }
    ])("defaults to off for $name", async ({ result }) => {
        const { client } = createClient(result);

        await expect(client.isEnabled("use-sdk-gen-api", { org: "acme" })).resolves.toBe(false);
    });

    it("makes one request per flag and org and exposes the resolved value from cache", async () => {
        const { client, getFeatureFlagResult } = createClient({
            key: "use-sdk-gen-api",
            enabled: true,
            variant: undefined,
            payload: undefined
        });

        expect(client.getCachedValue("use-sdk-gen-api", { org: "acme" })).toBeUndefined();
        await Promise.all([
            client.isEnabled("use-sdk-gen-api", { org: "acme" }),
            client.isEnabled("use-sdk-gen-api", { org: "acme" })
        ]);
        await client.isEnabled("use-sdk-gen-api", { org: "other" });

        expect(getFeatureFlagResult).toHaveBeenCalledTimes(2);
        expect(client.getCachedValue("use-sdk-gen-api", { org: "acme" })).toBe(true);
    });
});

describe("isFeatureFlagValueEnabled", () => {
    it.each([
        { value: { enabled: true, variant: undefined }, expected: true },
        { value: { enabled: true, variant: "true" }, expected: true },
        { value: { enabled: true, variant: "false" }, expected: false },
        { value: { enabled: true, variant: "control" }, expected: false },
        { value: { enabled: false, variant: undefined }, expected: false },
        { value: undefined, expected: false }
    ])("treats $value as $expected", ({ value, expected }) => {
        expect(isFeatureFlagValueEnabled(value)).toBe(expected);
    });
});

describe("NoopFeatureFlagClient", () => {
    it("keeps every flag off", async () => {
        const client = new NoopFeatureFlagClient();

        await expect(client.isEnabled()).resolves.toBe(false);
        expect(client.getCachedValue()).toBeUndefined();
    });
});

describe("getFeatureFlagClient", () => {
    it.each([undefined, "", "   "])("keeps every flag off without a PostHog key (%j)", async (key) => {
        vi.resetModules();
        vi.stubEnv("POSTHOG_FEATURE_FLAGS_API_KEY", key);
        try {
            const { getFeatureFlagClient } = await import("../src/feature-flags/getFeatureFlagClient.js");

            expect(getFeatureFlagClient()).toBeInstanceOf(
                (await import("../src/feature-flags/FeatureFlagClient.js")).NoopFeatureFlagClient
            );
        } finally {
            vi.unstubAllEnvs();
        }
    });

    it("evaluates flags through PostHog when a key is baked in", async () => {
        vi.resetModules();
        vi.stubEnv("POSTHOG_FEATURE_FLAGS_API_KEY", "phc_test");
        try {
            const { getFeatureFlagClient } = await import("../src/feature-flags/getFeatureFlagClient.js");

            expect(getFeatureFlagClient()).toBeInstanceOf(
                (await import("../src/feature-flags/FeatureFlagClient.js")).PosthogFeatureFlagClient
            );
        } finally {
            vi.unstubAllEnvs();
        }
    });
});

describe("getCliReleaseEnvironment", () => {
    it.each([
        { value: "prod", expected: "prod" },
        { value: " pre-prod ", expected: "pre-prod" },
        { value: "beta", expected: "beta" },
        { value: "staging", expected: "local" },
        { value: undefined, expected: "local" }
    ])("maps $value to $expected", ({ value, expected }) => {
        expect(getCliReleaseEnvironment(value)).toBe(expected);
    });
});
