import { describe, expect, it, vi } from "vitest";

const { mockCapture } = vi.hoisted(() => ({ mockCapture: vi.fn() }));

vi.mock("@fern-api/cli-telemetry", () => ({
    getRunIdProperties: () => ({})
}));

vi.mock("posthog-node", () => ({
    PostHog: class {
        public readonly capture = mockCapture;
    }
}));

import { AccessTokenPosthogManager } from "../src/AccessTokenPosthogManager.js";

describe("AccessTokenPosthogManager", () => {
    it("tags every event with the CLI release environment, which event properties cannot override", async () => {
        vi.stubEnv("FERN_CLI_RELEASE_ENVIRONMENT", "beta");
        try {
            const manager = new AccessTokenPosthogManager({ posthogApiKey: "test-api-key" });

            await manager.sendEvent({
                orgId: "acme",
                command: "fern generate",
                properties: { cliReleaseEnvironment: "prod" }
            });

            expect(mockCapture).toHaveBeenCalledWith(
                expect.objectContaining({
                    distinctId: "acme",
                    properties: expect.objectContaining({ usingAccessToken: true, cliReleaseEnvironment: "beta" })
                })
            );
        } finally {
            vi.unstubAllEnvs();
        }
    });

    it("tags automation events with the CLI release environment", () => {
        vi.stubEnv("FERN_CLI_RELEASE_ENVIRONMENT", "pre-prod");
        try {
            const manager = new AccessTokenPosthogManager({ posthogApiKey: "test-api-key" });

            manager.sendAutomationEvent({
                distinctId: "run-1",
                event: "generation_failed",
                properties: { error_code: "CONFIG_ERROR", cliReleaseEnvironment: "prod" }
            });

            expect(mockCapture).toHaveBeenCalledWith({
                distinctId: "run-1",
                event: "generation_failed",
                properties: { error_code: "CONFIG_ERROR", cliReleaseEnvironment: "pre-prod" }
            });
        } finally {
            vi.unstubAllEnvs();
        }
    });
});
