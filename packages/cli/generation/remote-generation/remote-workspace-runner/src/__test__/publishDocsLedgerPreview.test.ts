import { createMockTaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ledger = vi.hoisted(() => ({
    previewRegister: vi.fn(),
    finish: vi.fn()
}));

vi.mock("@fern-api/fdr-sdk/orpc-client", () => ({
    createDocsLedgerClient: vi.fn(() => ledger)
}));

vi.mock("../publishDocsLedger.js", () => ({
    buildLedgerInput: vi.fn(() => ({
        localeEntry: { locale: "en", root: {}, pages: {}, config: {} },
        blobs: new Map()
    })),
    buildAllTranslationInputs: vi.fn(async () => []),
    uploadMissingBlobs: vi.fn(async () => undefined)
}));

import { publishDocsViaLedgerPreview } from "../publishDocsLedgerPreview.js";

type PreviewArgs = Parameters<typeof publishDocsViaLedgerPreview>[0];

describe("publishDocsViaLedgerPreview", () => {
    beforeEach(() => {
        ledger.previewRegister.mockResolvedValue({
            deploymentHash: "hash",
            previewUrl: "https://acme-preview-abc.docs.buildwithfern.com/a",
            domain: "acme-preview-abc.docs.buildwithfern.com",
            basepath: "/a",
            previewId: "abc",
            missingContent: []
        });
        ledger.finish.mockResolvedValue({ deploymentId: "deployment-1", reusedDeployment: false });
    });

    it("sends the docs.yml instance.url to finish as sourceInstanceUrl", async () => {
        await publishDocsViaLedgerPreview({
            docsDefinition: { pages: {}, config: {} } as PreviewArgs["docsDefinition"],
            organization: "acme",
            basePath: "/a",
            previewId: undefined,
            token: "token",
            fdrOrigin: "https://registry.example.com",
            headers: {},
            context: createMockTaskContext(),
            apiDefinitions: new Map(),
            sourceInstanceUrl: "acme.docs.buildwithfern.com/a"
        });

        expect(ledger.finish).toHaveBeenCalledWith(
            expect.objectContaining({
                orgId: "acme",
                domain: "acme-preview-abc.docs.buildwithfern.com",
                previewId: "abc",
                sourceInstanceUrl: "acme.docs.buildwithfern.com/a"
            })
        );
    });
});
