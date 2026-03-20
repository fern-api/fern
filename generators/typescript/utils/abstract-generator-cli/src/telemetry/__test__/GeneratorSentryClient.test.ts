import { FernGeneratorExec } from "@fern-api/base-generator";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeneratorSentryClient } from "../GeneratorSentryClient.js";

const { initMock, captureExceptionMock, flushMock } = vi.hoisted(() => {
    return {
        initMock: vi.fn(),
        captureExceptionMock: vi.fn(),
        flushMock: vi.fn()
    };
});

vi.mock("@sentry/node", () => ({
    init: initMock
}));

describe("GeneratorSentryClient", () => {
    beforeEach(() => {
        delete process.env["FERN_DISABLE_TELEMETRY"];
        delete process.env["FERN_TELEMETRY_DISABLED"];
        delete process.env["SENTRY_DSN_TYPESCRIPT"];

        initMock.mockReset();
        captureExceptionMock.mockReset();
        flushMock.mockReset();
        initMock.mockReturnValue({
            captureException: captureExceptionMock,
            flush: flushMock
        });
        flushMock.mockResolvedValue(true);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("does not initialize for local execution when FERN_DISABLE_TELEMETRY is set", () => {
        process.env["FERN_DISABLE_TELEMETRY"] = "true";

        void new GeneratorSentryClient({
            config: createConfig(createLocalEnvironment()),
            release: "typescript-sdk-generator@1.2.3"
        });

        expect(initMock).not.toHaveBeenCalled();
    });

    it("does not initialize for local execution when FERN_TELEMETRY_DISABLED is set", () => {
        process.env["FERN_TELEMETRY_DISABLED"] = "1";

        void new GeneratorSentryClient({
            config: createConfig(createLocalEnvironment()),
            release: "typescript-sdk-generator@1.2.3"
        });

        expect(initMock).not.toHaveBeenCalled();
    });

    it("initializes for remote execution even when local telemetry env vars disable telemetry", () => {
        process.env["FERN_DISABLE_TELEMETRY"] = "true";

        void new GeneratorSentryClient({
            config: createConfig(createRemoteEnvironment()),
            release: "typescript-sdk-generator@1.2.3"
        });

        expect(initMock).toHaveBeenCalledTimes(1);
        expect(initMock.mock.calls[0]?.[0]).toMatchObject({
            environment: "dev",
            release: "typescript-sdk-generator@1.2.3"
        });
    });

    it("captures exceptions with generator tags", async () => {
        const client = new GeneratorSentryClient({
            config: createConfig(createRemoteEnvironment()),
            release: "typescript-sdk-generator@1.2.3"
        });

        await client.captureException(new Error("boom"));

        expect(captureExceptionMock).toHaveBeenCalledTimes(1);
        expect(captureExceptionMock.mock.calls[0]?.[1]).toMatchObject({
            captureContext: {
                tags: {
                    generator: "typescript-sdk",
                    executionEnvironment: "dev",
                    environmentType: "remote"
                }
            }
        });
    });

    it("swallows sentry capture and flush errors", async () => {
        captureExceptionMock.mockImplementation(() => {
            throw new Error("capture-failed");
        });
        flushMock.mockRejectedValue(new Error("flush-failed"));

        const client = new GeneratorSentryClient({
            config: createConfig(createRemoteEnvironment()),
            release: "typescript-sdk-generator@1.2.3"
        });

        await expect(client.captureException(new Error("boom"))).resolves.toBeUndefined();
        await expect(client.flush()).resolves.toBeUndefined();
    });
});

function createConfig(environment: FernGeneratorExec.GeneratorEnvironment): FernGeneratorExec.GeneratorConfig {
    return { environment } as FernGeneratorExec.GeneratorConfig;
}

function createLocalEnvironment(): FernGeneratorExec.GeneratorEnvironment {
    return {
        type: "local"
    } as FernGeneratorExec.GeneratorEnvironment;
}

function createRemoteEnvironment(): FernGeneratorExec.GeneratorEnvironment {
    return {
        type: "remote",
        id: "task-id",
        coordinatorUrlV2: "https://api.dev2.buildwithfern.com"
    } as FernGeneratorExec.GeneratorEnvironment;
}
