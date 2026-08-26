import type { FernToken } from "@fern-api/auth";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "../../../../../context/Context.js";
import { createTestContext } from "../../../../../__test__/utils/createTestContext.js";
import { DeleteCommand } from "../command.js";

const { listAllDocsUrls, deleteDocsSite } = vi.hoisted(() => ({
    listAllDocsUrls: vi.fn(),
    deleteDocsSite: vi.fn()
}));

vi.mock("@fern-api/core", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/core")>()),
    createFdrService: () => ({
        docs: { v2: { read: { listAllDocsUrls }, write: { deleteDocsSite } } }
    })
}));

const HOSTNAME = "acme-preview-mr-2.docs.buildwithfern.com";

async function createContext(): Promise<Context> {
    const context = await createTestContext({ cwd: AbsoluteFilePath.of(process.cwd()) });
    vi.spyOn(context, "getTokenOrPrompt").mockResolvedValue({ type: "user", value: "token" } satisfies FernToken);
    vi.spyOn(context, "loadWorkspaceOrThrow").mockResolvedValue({ org: "acme" } as Awaited<
        ReturnType<Context["loadWorkspaceOrThrow"]>
    >);
    return context;
}

describe("DeleteCommand", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deletes the preview at the basepath resolved from an id", async () => {
        listAllDocsUrls.mockResolvedValue({ urls: [{ domain: HOSTNAME, basePath: "/docs" }] });
        const context = await createContext();

        await new DeleteCommand().handle(context, { "log-level": "info", id: "mr-2" });

        expect(deleteDocsSite).toHaveBeenCalledWith({ url: `${HOSTNAME}/docs` });
    });

    it("resolves the basepath of a preview passed as a bare hostname", async () => {
        listAllDocsUrls.mockResolvedValue({ urls: [{ domain: HOSTNAME, basePath: "/docs" }] });
        const context = await createContext();

        await new DeleteCommand().handle(context, { "log-level": "info", target: HOSTNAME });

        expect(deleteDocsSite).toHaveBeenCalledWith({ url: `${HOSTNAME}/docs` });
    });

    it("deletes the URL as given when it already includes a basepath", async () => {
        const context = await createContext();

        await new DeleteCommand().handle(context, { "log-level": "info", url: `https://${HOSTNAME}/docs/` });

        expect(listAllDocsUrls).not.toHaveBeenCalled();
        expect(deleteDocsSite).toHaveBeenCalledWith({ url: `${HOSTNAME}/docs` });
    });

    it("fails when the id matches no preview deployment", async () => {
        listAllDocsUrls.mockResolvedValue({ urls: [] });
        const context = await createContext();

        await expect(new DeleteCommand().handle(context, { "log-level": "info", id: "mr-2" })).rejects.toThrow(
            "No preview deployment found"
        );
        expect(deleteDocsSite).not.toHaveBeenCalled();
    });

    it("rejects a non-preview URL without authenticating", async () => {
        const context = await createContext();

        await expect(
            new DeleteCommand().handle(context, { "log-level": "info", url: "docs.acme.com" })
        ).rejects.toThrow("Invalid preview URL");
        expect(context.getTokenOrPrompt).not.toHaveBeenCalled();
    });
});
