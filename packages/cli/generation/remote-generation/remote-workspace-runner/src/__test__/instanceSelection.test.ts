import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext, TaskAbortSignal } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { runRemoteGenerationForDocsWorkspace } from "../runRemoteGenerationForDocsWorkspace.js";

// Mock heavy dependencies that are not relevant to instance selection
vi.mock("@fern-api/core-utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@fern-api/core-utils")>();
    return {
        ...actual,
        replaceEnvVariables: <T>(config: T): T => config
    };
});

vi.mock("../publishDocs.js", () => ({
    publishDocs: vi.fn().mockResolvedValue("https://published.docs.buildwithfern.com"),
    DocsPublishConflictError: class DocsPublishConflictError extends Error {}
}));

vi.mock("../customDomainValidation.js", () => ({
    stripCustomDomainProtocol: (d: string) => d,
    validateBasepathAlignment: () => undefined
}));

function makeDocsWorkspace(instances: Array<{ url: string; customDomain?: string }>): DocsWorkspace {
    return {
        type: "docs",
        workspaceName: "test",
        absoluteFilePath: AbsoluteFilePath.of("/tmp/test"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/test/docs.yml"),
        config: {
            instances
        }
    } as unknown as DocsWorkspace;
}

const BASE_ARGS = {
    organization: "test-org",
    apiWorkspaces: [],
    ossWorkspaces: [],
    token: { type: "user" as const, value: "test-token" },
    preview: false,
    previewId: undefined,
    disableTemplates: undefined,
    skipUpload: undefined
};

describe("runRemoteGenerationForDocsWorkspace instance selection", () => {
    let failMessages: string[];

    beforeEach(() => {
        failMessages = [];
        vi.clearAllMocks();
    });

    function createThrowingContext(): ReturnType<typeof createMockTaskContext> {
        const ctx = createMockTaskContext();
        // Wrap failAndThrow to capture the message before it throws
        const originalFail = ctx.failAndThrow.bind(ctx);
        ctx.failAndThrow = ((message?: string, error?: unknown, options?: unknown) => {
            if (message != null) {
                failMessages.push(message);
            }
            return originalFail(message, error, options as undefined);
        }) as typeof ctx.failAndThrow;
        // Provide a working runInteractiveTask so the function can proceed past instance selection
        ctx.runInteractiveTask = async (_params, run) => {
            if (run != null) {
                await run(ctx as never);
            }
            return true;
        };
        return ctx;
    }

    describe("zero instances configured", () => {
        it("should error when no instances are specified in docs.yml", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace([]);

            await expect(
                runRemoteGenerationForDocsWorkspace({ ...BASE_ARGS, docsWorkspace, context, instanceUrl: undefined })
            ).rejects.toThrow(TaskAbortSignal);

            expect(failMessages[0]).toBe("No instances specified in docs.yml! Cannot register docs.");
        });

        it("should error even when --instance flag is provided but no instances configured", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace([]);

            await expect(
                runRemoteGenerationForDocsWorkspace({
                    ...BASE_ARGS,
                    docsWorkspace,
                    context,
                    instanceUrl: "some.docs.buildwithfern.com"
                })
            ).rejects.toThrow(TaskAbortSignal);

            expect(failMessages[0]).toBe("No instances specified in docs.yml! Cannot register docs.");
        });
    });

    describe("single instance configured", () => {
        it("should select the only instance when no --instance flag is provided", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace([{ url: "instance-a.docs.buildwithfern.com" }]);

            const { publishDocs } = await import("../publishDocs.js");

            await runRemoteGenerationForDocsWorkspace({
                ...BASE_ARGS,
                docsWorkspace,
                context,
                instanceUrl: undefined
            });

            expect(publishDocs).toHaveBeenCalledWith(
                expect.objectContaining({ domain: "instance-a.docs.buildwithfern.com" })
            );
        });

        it("should select the instance when --instance flag matches", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace([{ url: "instance-a.docs.buildwithfern.com" }]);

            const { publishDocs } = await import("../publishDocs.js");

            await runRemoteGenerationForDocsWorkspace({
                ...BASE_ARGS,
                docsWorkspace,
                context,
                instanceUrl: "instance-a.docs.buildwithfern.com"
            });

            expect(publishDocs).toHaveBeenCalledWith(
                expect.objectContaining({ domain: "instance-a.docs.buildwithfern.com" })
            );
        });

        it("should error when --instance flag does not match the configured instance", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace([{ url: "instance-a.docs.buildwithfern.com" }]);

            await expect(
                runRemoteGenerationForDocsWorkspace({
                    ...BASE_ARGS,
                    docsWorkspace,
                    context,
                    instanceUrl: "nonexistent.docs.buildwithfern.com"
                })
            ).rejects.toThrow(TaskAbortSignal);

            expect(failMessages[0]).toContain("No docs instance found matching 'nonexistent.docs.buildwithfern.com'");
            expect(failMessages[0]).toContain("instance-a.docs.buildwithfern.com");
        });
    });

    describe("multiple instances configured", () => {
        const instances = [
            { url: "instance-a.docs.buildwithfern.com" },
            { url: "instance-b.docs.buildwithfern.com" },
            { url: "instance-c.docs.buildwithfern.com" }
        ];

        it("should error when no --instance flag is provided", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace(instances);

            await expect(
                runRemoteGenerationForDocsWorkspace({ ...BASE_ARGS, docsWorkspace, context, instanceUrl: undefined })
            ).rejects.toThrow(TaskAbortSignal);

            expect(failMessages[0]).toContain("More than one docs instances");
            expect(failMessages[0]).toContain("--instance");
            expect(failMessages[0]).toContain("instance-a.docs.buildwithfern.com");
        });

        it("should select the correct instance when --instance matches a non-first instance", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace(instances);

            const { publishDocs } = await import("../publishDocs.js");

            await runRemoteGenerationForDocsWorkspace({
                ...BASE_ARGS,
                docsWorkspace,
                context,
                instanceUrl: "instance-b.docs.buildwithfern.com"
            });

            expect(publishDocs).toHaveBeenCalledWith(
                expect.objectContaining({ domain: "instance-b.docs.buildwithfern.com" })
            );
        });

        it("should not fall back to the first instance when --instance does not match", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace(instances);

            const { publishDocs } = await import("../publishDocs.js");

            await expect(
                runRemoteGenerationForDocsWorkspace({
                    ...BASE_ARGS,
                    docsWorkspace,
                    context,
                    instanceUrl: "nonexistent.docs.buildwithfern.com"
                })
            ).rejects.toThrow(TaskAbortSignal);

            expect(publishDocs).not.toHaveBeenCalled();
            expect(failMessages[0]).toContain("No docs instance found matching 'nonexistent.docs.buildwithfern.com'");
        });

        it("should list all available instances in the error message when --instance does not match", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace(instances);

            await expect(
                runRemoteGenerationForDocsWorkspace({
                    ...BASE_ARGS,
                    docsWorkspace,
                    context,
                    instanceUrl: "nonexistent.docs.buildwithfern.com"
                })
            ).rejects.toThrow(TaskAbortSignal);

            expect(failMessages[0]).toContain("Available instances:");
            expect(failMessages[0]).toContain("  - instance-a.docs.buildwithfern.com");
            expect(failMessages[0]).toContain("  - instance-b.docs.buildwithfern.com");
            expect(failMessages[0]).toContain("  - instance-c.docs.buildwithfern.com");
        });

        it("should require exact URL match (no partial matching)", async () => {
            const context = createThrowingContext();
            const docsWorkspace = makeDocsWorkspace(instances);

            await expect(
                runRemoteGenerationForDocsWorkspace({
                    ...BASE_ARGS,
                    docsWorkspace,
                    context,
                    instanceUrl: "instance-b"
                })
            ).rejects.toThrow(TaskAbortSignal);

            expect(failMessages[0]).toContain("No docs instance found matching 'instance-b'");
        });
    });
});
