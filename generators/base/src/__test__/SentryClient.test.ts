import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockSentryCaptureException, mockSentryFlush, mockSentryInit, mockSentrySetTag } = vi.hoisted(() => ({
    mockSentryCaptureException: vi.fn(),
    mockSentryFlush: vi.fn().mockResolvedValue(true),
    mockSentryInit: vi.fn(function () {
        return {
            captureException: mockSentryCaptureException,
            flush: mockSentryFlush
        };
    }),
    mockSentrySetTag: vi.fn()
}));

vi.mock("@sentry/node", () => ({
    init: mockSentryInit,
    rewriteFramesIntegration: vi.fn().mockReturnValue({}),
    onUncaughtExceptionIntegration: vi.fn().mockReturnValue({}),
    onUnhandledRejectionIntegration: vi.fn().mockReturnValue({}),
    linkedErrorsIntegration: vi.fn().mockReturnValue({}),
    nodeContextIntegration: vi.fn().mockReturnValue({}),
    setTag: mockSentrySetTag
}));

import { GeneratorError } from "../GeneratorError.js";
import { SentryClient } from "../telemetry/SentryClient.js";

const DEFAULT_ARGS = {
    workspaceName: "test-workspace",
    organization: "test-org"
};

describe("SentryClient (base-generator)", () => {
    beforeEach(() => {
        process.env.SENTRY_DSN = "https://example@sentry.io/123";
        process.env.SENTRY_ENVIRONMENT = "test";
        process.env.SENTRY_RELEASE = "fern-go-sdk:2.1.0";
        delete process.env.FERN_DISABLE_TELEMETRY;
        delete process.env.FERN_RUN_ID;
        delete process.env.GITHUB_RUN_ID;
        mockSentryCaptureException.mockClear();
        mockSentryFlush.mockClear();
        mockSentryInit.mockClear();
        mockSentrySetTag.mockClear();
    });

    afterEach(() => {
        delete process.env.SENTRY_DSN;
        delete process.env.SENTRY_ENVIRONMENT;
        delete process.env.SENTRY_RELEASE;
        delete process.env.FERN_DISABLE_TELEMETRY;
        delete process.env.FERN_RUN_ID;
        delete process.env.GITHUB_RUN_ID;
    });

    it("does not initialize Sentry when telemetry is disabled", () => {
        process.env.FERN_DISABLE_TELEMETRY = "true";

        // eslint-disable-next-line no-new
        new SentryClient(DEFAULT_ARGS);

        expect(mockSentryInit).not.toHaveBeenCalled();
    });

    it("captures exceptions with Sentry when enabled", async () => {
        const client = new SentryClient(DEFAULT_ARGS);

        await client.captureException(new Error("boom"));

        expect(mockSentryInit).toHaveBeenCalledOnce();
        expect(mockSentryCaptureException).toHaveBeenCalledOnce();
    });

    it("flushes the Sentry client", async () => {
        const client = new SentryClient(DEFAULT_ARGS);

        await client.flush();

        expect(mockSentryFlush).toHaveBeenCalledOnce();
    });

    it("sets run id tags when present", () => {
        process.env.FERN_RUN_ID = "fern-run";
        process.env.GITHUB_RUN_ID = "github-run";

        // eslint-disable-next-line no-new
        new SentryClient(DEFAULT_ARGS);

        expect(mockSentrySetTag).toHaveBeenCalledWith("fern_run_id", "fern-run");
        expect(mockSentrySetTag).toHaveBeenCalledWith("github_run_id", "github-run");
    });

    it("sets tags and release from SENTRY_RELEASE env var", () => {
        process.env.SENTRY_RELEASE = "fern-go-sdk:2.1.0";

        // eslint-disable-next-line no-new
        new SentryClient({ workspaceName: "api", organization: "fern" });

        expect(mockSentrySetTag).toHaveBeenCalledWith("workspace_name", "api");
        expect(mockSentrySetTag).toHaveBeenCalledWith("organization", "fern");
        expect(mockSentryInit).toHaveBeenCalledWith(
            expect.objectContaining({
                release: "fern-go-sdk:2.1.0"
            })
        );
    });

    it("sets the provided error_code tag when capturing exception", async () => {
        const client = new SentryClient(DEFAULT_ARGS);

        await client.captureException(new GeneratorError({ message: "bad config", code: "CONFIG_ERROR" }), {
            errorCode: "CONFIG_ERROR"
        });

        expect(mockSentrySetTag).toHaveBeenCalledWith("error_code", "CONFIG_ERROR");
        expect(mockSentryCaptureException).toHaveBeenCalledOnce();
    });
});
