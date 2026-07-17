import { describe, expect, it } from "vitest";

import { filterPreviewDeployments } from "../listDocsPreview.js";

const PROD = "docs.buildwithfern.com";
const DEV = "docs.dev.buildwithfern.com";

function item(domain: string, basePath?: string) {
    return { domain, basePath, organizationId: "acme", updatedAt: "2026-07-17T00:00:00.000Z" };
}

describe("filterPreviewDeployments", () => {
    it("includes named --id previews (regression: hex-only filter dropped them)", () => {
        const result = filterPreviewDeployments(
            [
                item("nvidia-preview-mr-2.docs.buildwithfern.com"),
                item("acme-preview-feature-x.docs.buildwithfern.com"),
                item("audiences-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com")
            ],
            PROD
        );
        expect(result.map((r) => r.url)).toEqual([
            "nvidia-preview-mr-2.docs.buildwithfern.com",
            "acme-preview-feature-x.docs.buildwithfern.com",
            "audiences-preview-9b2b47f0-c44b-4338-b579-46872f33404a.docs.buildwithfern.com"
        ]);
    });

    it("excludes custom domains that don't end in the Fern suffix", () => {
        const result = filterPreviewDeployments(
            [item("acme-preview-mr-2.docs.buildwithfern.com"), item("docs.acme.com"), item("acme.example.io")],
            PROD
        );
        expect(result.map((r) => r.url)).toEqual(["acme-preview-mr-2.docs.buildwithfern.com"]);
    });

    it("keeps dev previews when the dev suffix is configured, and excludes prod ones", () => {
        const result = filterPreviewDeployments(
            [item("acme-preview-mr-2.docs.dev.buildwithfern.com"), item("acme-preview-mr-2.docs.buildwithfern.com")],
            DEV
        );
        expect(result.map((r) => r.url)).toEqual(["acme-preview-mr-2.docs.dev.buildwithfern.com"]);
    });

    it("appends basePath to the domain when present", () => {
        const result = filterPreviewDeployments([item("acme-preview-mr-2.docs.buildwithfern.com", "/recipes")], PROD);
        expect(result[0]?.url).toBe("acme-preview-mr-2.docs.buildwithfern.com/recipes");
    });
});
