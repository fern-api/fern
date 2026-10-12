import { describe, expect, it, vi } from "vitest";

import { getCliReleaseEnvironment } from "../src/feature-flags/CliReleaseEnvironment.js";
import {
    type FeatureFlagEvaluator,
    isFeatureFlagValueEnabled,
    NoopFeatureFlagClient,
    PosthogFeatureFlagClient
} from "../src/feature-flags/FeatureFlagClient.js";

type FlagResult = Awaited<ReturnType<FeatureFlagEvaluator["getFeatureFlagResult"]>>;

function createClient(
    result: FlagResult | Error = undefined,
    { sendFeatureFlagEvents = false, flushResult }: { sendFeatureFlagEvents?: boolean; flushResult?: Error } = {}
) {
    const getFeatureFlagResult = vi.fn(async (): Promise<FlagResult> => {
        if (result instanceof Error) {
            throw result;
        }
        return result;
    });
    const flush = vi.fn(async (): Promise<void> => {
        if (flushResult != null) {
            throw flushResult;
        }
    });
    const client = new PosthogFeatureFlagClient({
        environment: "pre-prod",
        sendFeatureFlagEvents,
        evaluator: { getFeatureFlagResult, flush } satisfies FeatureFlagEvaluator
    });
    return { client, getFeatureFlagResult, flush };
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

    it("adds the generator and its language as targeting properties", async () => {
        const { client, getFeatureFlagResult } = createClient({
            key: "use-sdk-gen-api",
            enabled: true,
            variant: "false",
            payload: undefined
        });
        const properties = {
            org: "acme",
            environment: "pre-prod",
            generator: "fernapi/fern-python-sdk",
            language: "python"
        };

        await expect(
            client.isEnabled("use-sdk-gen-api", {
                org: "acme",
                generator: "fernapi/fern-python-sdk",
                language: "python"
            })
        ).resolves.toBe(false);

        expect(getFeatureFlagResult).toHaveBeenCalledWith("use-sdk-gen-api", "org:acme", {
            personProperties: properties,
            groups: { organization: "acme" },
            groupProperties: { organization: properties },
            sendFeatureFlagEvents: false
        });
    });

    it("sends flag usage events and flushes them when event telemetry is enabled", async () => {
        const { client, getFeatureFlagResult, flush } = createClient(
            { key: "use-sdk-gen-api", enabled: true, variant: undefined, payload: undefined },
            { sendFeatureFlagEvents: true }
        );

        await client.isEnabled("use-sdk-gen-api", { org: "acme" });
        await client.flush();

        expect(getFeatureFlagResult).toHaveBeenCalledWith(
            "use-sdk-gen-api",
            "org:acme",
            expect.objectContaining({ sendFeatureFlagEvents: true })
        );
        expect(flush).toHaveBeenCalledTimes(1);
    });

    it("skips the flush when event telemetry is disabled", async () => {
        const { client, flush } = createClient();

        await client.flush();

        expect(flush).not.toHaveBeenCalled();
    });

    it("never rejects when the flush fails", async () => {
        const { client } = createClient(undefined, { sendFeatureFlagEvents: true, flushResult: new Error("down") });

        await expect(client.flush()).resolves.toBeUndefined();
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

    it("makes one request per flag, org, and generator and exposes the resolved value from cache", async () => {
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
        await client.isEnabled("use-sdk-gen-api", { org: "acme", generator: "fernapi/fern-go-sdk", language: "go" });

        expect(getFeatureFlagResult).toHaveBeenCalledTimes(3);
        expect(client.getCachedValue("use-sdk-gen-api", { org: "acme" })).toBe(true);
        expect(client.getCachedValue("use-sdk-gen-api", { org: "acme", generator: "fernapi/fern-python-sdk" })).toBe(
            undefined
        );
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
        await expect(client.flush()).resolves.toBeUndefined();
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

    it.each([
        { name: "telemetry is enabled", posthogApiKey: "phc_test", disableTelemetry: undefined, expected: true },
        { name: "the user opted out", posthogApiKey: "phc_test", disableTelemetry: "true", expected: false },
        { name: "the build has no event key", posthogApiKey: undefined, disableTelemetry: undefined, expected: false }
    ])("sends flag usage events only when $name", async ({ posthogApiKey, disableTelemetry, expected }) => {
        vi.resetModules();
        vi.stubEnv("POSTHOG_FEATURE_FLAGS_API_KEY", "phc_test");
        vi.stubEnv("POSTHOG_API_KEY", posthogApiKey);
        vi.stubEnv("FERN_DISABLE_TELEMETRY", disableTelemetry);
        const getFeatureFlagResult = vi.fn(async () => undefined);
        vi.doMock("posthog-node", () => ({
            PostHog: class {
                getFeatureFlagResult = getFeatureFlagResult;
                flush = vi.fn(async () => undefined);
            }
        }));
        try {
            const { getFeatureFlagClient } = await import("../src/feature-flags/getFeatureFlagClient.js");

            await getFeatureFlagClient().isEnabled("use-sdk-gen-api", { org: "acme" });

            expect(getFeatureFlagResult).toHaveBeenCalledWith(
                "use-sdk-gen-api",
                "org:acme",
                expect.objectContaining({ sendFeatureFlagEvents: expected })
            );
        } finally {
            vi.doUnmock("posthog-node");
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
