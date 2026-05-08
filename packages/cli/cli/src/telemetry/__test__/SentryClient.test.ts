import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockSentryCaptureException, mockSentryFlush, mockSentryInit, mockSentrySetContext, mockSentrySetTags } =
    vi.hoisted(() => ({
        mockSentryCaptureException: vi.fn(),
        mockSentryFlush: vi.fn().mockResolvedValue(true),
        mockSentryInit: vi.fn(function () {
            return {
                captureException: mockSentryCaptureException,
                flush: mockSentryFlush
            };
        }),
        mockSentrySetContext: vi.fn(),
        mockSentrySetTags: vi.fn()
    }));

vi.mock("@sentry/node", () => ({
    init: mockSentryInit,
    withScope: vi.fn(
        (
            callback: (scope: {
                setContext: (key: string, context: Record<string, unknown>) => void;
                setTags: (tags: Record<string, string>) => void;
            }) => unknown
        ) => callback({ setContext: mockSentrySetContext, setTags: mockSentrySetTags })
    ),
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
        mockSentrySetContext.mockClear();
        mockSentrySetTags.mockClear();
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
        expect(mockSentryCaptureException).toHaveBeenCalledWith(expect.any(Error));
    });

    it("sets tags on a Sentry scope when provided", () => {
        const client = new SentryClient({ release: "cli@1.2.3" });
        const error = new Error("something broke");

        client.captureException(error, { tags: { "error.code": CliError.Code.InternalError } });

        expect(mockSentrySetTags).toHaveBeenCalledWith({ "error.code": CliError.Code.InternalError });
        expect(mockSentryCaptureException).toHaveBeenCalledWith(error, undefined, expect.objectContaining({}));
    });

    it("sets context on a Sentry scope when provided", () => {
        const client = new SentryClient({ release: "cli@1.2.3" });
        const error = new Error("something broke");

        client.captureException(error, {
            context: { automation: { github_run_url: "https://github.com/acme/repo/actions/runs/1" } }
        });

        expect(mockSentrySetContext).toHaveBeenCalledWith("automation", {
            github_run_url: "https://github.com/acme/repo/actions/runs/1"
        });
        expect(mockSentryCaptureException).toHaveBeenCalledWith(error, undefined, expect.objectContaining({}));
    });

    it("flushes the Sentry client", async () => {
        const client = new SentryClient({ release: "cli@1.2.3" });

        await client.flush();

        expect(mockSentryFlush).toHaveBeenCalledOnce();
    });
});
