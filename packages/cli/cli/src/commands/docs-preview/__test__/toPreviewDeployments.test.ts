import { describe, expect, it } from "vitest";

import { toPreviewDeployments } from "../listDocsPreview.js";

function item(domain: string, basePath?: string) {
    return { domain, basePath, organizationId: "acme", updatedAt: "2026-07-17T00:00:00.000Z" };
}

describe("toPreviewDeployments", () => {
    it("includes named --id previews (regression: a hex-only filter used to drop them)", () => {
        const result = toPreviewDeployments([
            item("nvidia-preview-mr-2.docs.buildwithfern.com"),
            item("acme-preview-feature-x.docs.buildwithfern.com"),
            item("audiences-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com")
        ]);
        expect(result.map((r) => r.url)).toEqual([
            "nvidia-preview-mr-2.docs.buildwithfern.com",
            "acme-preview-feature-x.docs.buildwithfern.com",
            "audiences-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com"
        ]);
    });

    it("does not filter by domain: previews are scoped server-side (isPreview), so everything the server returns is shown", () => {
        const result = toPreviewDeployments([
            item("acme-preview-mr-2.docs.dev.buildwithfern.com"),
            item("acme-preview-mr-2.docs.buildwithfern.com")
        ]);
        expect(result.map((r) => r.url)).toEqual([
            "acme-preview-mr-2.docs.dev.buildwithfern.com",
            "acme-preview-mr-2.docs.buildwithfern.com"
        ]);
    });

    it("appends basePath to the domain when present", () => {
        const result = toPreviewDeployments([item("acme-preview-mr-2.docs.buildwithfern.com", "/recipes")]);
        expect(result[0]?.url).toBe("acme-preview-mr-2.docs.buildwithfern.com/recipes");
    });
});
