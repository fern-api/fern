import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockSentryCaptureException, mockSentryFlush, mockSentryInit } = vi.hoisted(() => ({
    mockSentryCaptureException: vi.fn(),
    mockSentryFlush: vi.fn().mockResolvedValue(true),
    mockSentryInit: vi.fn(function () {
        return {
            captureException: mockSentryCaptureException,
            flush: mockSentryFlush
        };
    })
}));

vi.mock("@sentry/node", () => ({
    init: mockSentryInit,
    rewriteFramesIntegration: vi.fn().mockReturnValue({}),
    onUncaughtExceptionIntegration: vi.fn().mockReturnValue({}),
    onUnhandledRejectionIntegration: vi.fn().mockReturnValue({}),
    linkedErrorsIntegration: vi.fn().mockReturnValue({}),
    nodeContextIntegration: vi.fn().mockReturnValue({}),
    setTag: vi.fn()
}));

import { CliError } from "@fern-api/task-context";
import { SentryClient } from "../SentryClient.js";

describe("SentryClient (cli-v1)", () => {
    beforeEach(() => {
        process.env.SENTRY_DSN = "https://example@sentry.io/123";
        process.env.SENTRY_ENVIRONMENT = "test";
        delete process.env.FERN_DISABLE_TELEMETRY;
        mockSentryCaptureException.mockClear();
        mockSentryFlush.mockClear();
        mockSentryInit.mockClear();
    });

    afterEach(() => {
        delete process.env.SENTRY_DSN;
        delete process.env.SENTRY_ENVIRONMENT;
        delete process.env.FERN_DISABLE_TELEMETRY;
    });

    it("does not initialize Sentry when telemetry is disabled", () => {
        process.env.FERN_DISABLE_TELEMETRY = "true";

        // eslint-disable-next-line no-new
        new SentryClient({ release: "cli@1.2.3" });

        expect(mockSentryInit).not.toHaveBeenCalled();
    });

    it("captures exceptions with Sentry when enabled", async () => {
        const client = new SentryClient({ release: "cli@1.2.3" });

        await client.captureException(new Error("boom"));

        expect(mockSentryInit).toHaveBeenCalledOnce();
        expect(mockSentryCaptureException).toHaveBeenCalledOnce();
        expect(mockSentryCaptureException).toHaveBeenCalledWith(expect.any(Error), undefined);
    });

    it("passes error.code tag via captureContext when code is provided", () => {
        const client = new SentryClient({ release: "cli@1.2.3" });
        const error = new Error("something broke");

        client.captureException(error, CliError.Code.InternalError);

        expect(mockSentryCaptureException).toHaveBeenCalledWith(error, {
            captureContext: { tags: { "error.code": CliError.Code.InternalError } }
        });
    });

    it("flushes the Sentry client", async () => {
        const client = new SentryClient({ release: "cli@1.2.3" });

        await client.flush();

        expect(mockSentryFlush).toHaveBeenCalledOnce();
    });
});
