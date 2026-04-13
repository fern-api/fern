import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted creates refs accessible inside vi.mock factory functions,
// which are hoisted to the top of the file before any imports.
const { mockCapture, mockShutdown } = vi.hoisted(() => ({
    mockCapture: vi.fn(),
    mockShutdown: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("posthog-node", () => ({
    // eslint-disable-next-line func-style
    PostHog: vi.fn(function () {
        return { capture: mockCapture, shutdown: mockShutdown };
    })
}));

import { TelemetryClient } from "../TelemetryClient.js";

// Each test gets its own HOME pointing to a clean temp directory, so the
// real FernRcSchemaLoader reads from there rather than the developer's ~/.fernrc.
let tempHome: string;

beforeEach(async () => {
    tempHome = await mkdir(join(tmpdir(), `fern-test-${Date.now()}`), { recursive: true }).then(
        (p) => p ?? join(tmpdir(), `fern-test-${Date.now()}`)
    );
    process.env["HOME"] = tempHome;
    process.env["POSTHOG_API_KEY"] = "phc_test";
    delete process.env["FERN_TELEMETRY_DISABLED"];
    mockCapture.mockClear();
    mockShutdown.mockClear();
});

afterEach(async () => {
    await rm(tempHome, { recursive: true, force: true });
    delete process.env["HOME"];
    delete process.env["POSTHOG_API_KEY"];
    delete process.env["FERN_TELEMETRY_DISABLED"];
});

describe("TelemetryClient", () => {
    describe("sendLifecycleEvent", () => {
        it("captures a cli event with the expected shape", async () => {
            const client = await TelemetryClient.create({ isTTY: true });

            client.sendLifecycleEvent({
                command: "sdk generate",
                status: "success",
                durationMs: 1234
            });

            expect(mockCapture).toHaveBeenCalledOnce();
            expect(mockCapture).toHaveBeenCalledWith(
                expect.objectContaining({
                    event: "cli",
                    properties: expect.objectContaining({
                        command: "sdk generate",
                        status: "success",
                        durationMs: 1234,
                        tty: true,
                        os: expect.any(String),
                        arch: expect.any(String),
                        ci: expect.any(Boolean)
                    })
                })
            );
        });

        it("merges tag() into the event", async () => {
            const client = await TelemetryClient.create({ isTTY: false });
            client.tag({ generator: "typescript" });

            client.sendLifecycleEvent({
                command: "sdk generate",
                status: "success",
                durationMs: 100
            });

            expect(mockCapture).toHaveBeenCalledWith(
                expect.objectContaining({
                    properties: expect.objectContaining({
                        generator: "typescript"
                    })
                })
            );
        });
    });

    describe("sendEvent", () => {
        it("captures a named event inheriting base and accumulated properties", async () => {
            const client = await TelemetryClient.create({ isTTY: false });
            client.tag({ org: "acme" });

            client.sendEvent("generator:run", { language: "typescript" });

            expect(mockCapture).toHaveBeenCalledOnce();
            expect(mockCapture).toHaveBeenCalledWith(
                expect.objectContaining({
                    event: "generator:run",
                    properties: expect.objectContaining({
                        language: "typescript",
                        org: "acme",
                        os: expect.any(String)
                    })
                })
            );
        });
    });

    describe("flush", () => {
        it("delegates to the posthog client", async () => {
            const client = await TelemetryClient.create({ isTTY: false });
            await client.flush();
            expect(mockShutdown).toHaveBeenCalledOnce();
        });

        it("is a no-op when disabled", async () => {
            delete process.env["POSTHOG_API_KEY"];
            const client = await TelemetryClient.create({ isTTY: false });
            await client.flush();
            expect(mockShutdown).not.toHaveBeenCalled();
        });
    });

    describe("disabled", () => {
        it("is a no-op when POSTHOG_API_KEY is not set", async () => {
            delete process.env["POSTHOG_API_KEY"];
            const client = await TelemetryClient.create({ isTTY: false });
            client.sendLifecycleEvent({ command: "check", status: "success", durationMs: 0 });
            expect(mockCapture).not.toHaveBeenCalled();
        });

        it("is a no-op when FERN_TELEMETRY_DISABLED=1", async () => {
            process.env["FERN_TELEMETRY_DISABLED"] = "1";
            const client = await TelemetryClient.create({ isTTY: false });
            client.sendLifecycleEvent({ command: "check", status: "success", durationMs: 0 });
            expect(mockCapture).not.toHaveBeenCalled();
        });

        it("is a no-op when FERN_TELEMETRY_DISABLED=true", async () => {
            process.env["FERN_TELEMETRY_DISABLED"] = "true";
            const client = await TelemetryClient.create({ isTTY: false });
            client.sendLifecycleEvent({ command: "check", status: "success", durationMs: 0 });
            expect(mockCapture).not.toHaveBeenCalled();
        });

        it("is a no-op when fernrc has telemetry.enabled: false", async () => {
            await writeFile(join(tempHome, ".fernrc"), "version: v1\ntelemetry:\n  enabled: false\n", "utf-8");
            const client = await TelemetryClient.create({ isTTY: false });
            client.sendLifecycleEvent({ command: "check", status: "success", durationMs: 0 });
            expect(mockCapture).not.toHaveBeenCalled();
        });

        it("FERN_TELEMETRY_DISABLED takes precedence over fernrc enabled: true", async () => {
            process.env["FERN_TELEMETRY_DISABLED"] = "1";
            await writeFile(join(tempHome, ".fernrc"), "version: v1\ntelemetry:\n  enabled: true\n", "utf-8");
            const client = await TelemetryClient.create({ isTTY: false });
            client.sendLifecycleEvent({ command: "check", status: "success", durationMs: 0 });
            expect(mockCapture).not.toHaveBeenCalled();
        });
    });
});
