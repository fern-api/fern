import { describe, expect, it } from "vitest";

import { resolvePreviewUrlsForInstances } from "../deleteDocsPreview.js";

const previewHostname = "acme-preview-my-branch.docs.buildwithfern.com";

describe("resolvePreviewUrlsForInstances", () => {
    it("appends the instance basepath to the preview hostname", () => {
        expect(
            resolvePreviewUrlsForInstances({
                previewHostname,
                instanceUrls: ["prismo.docs.buildwithfern.com/switch-infrastructure/network-designer"]
            })
        ).toEqual([`${previewHostname}/switch-infrastructure/network-designer`]);
    });

    it("returns the bare hostname for root instances and when no docs workspace exists", () => {
        expect(
            resolvePreviewUrlsForInstances({
                previewHostname,
                instanceUrls: ["acme.docs.buildwithfern.com", "https://acme.docs.buildwithfern.com/"]
            })
        ).toEqual([previewHostname]);
        expect(resolvePreviewUrlsForInstances({ previewHostname, instanceUrls: [] })).toEqual([previewHostname]);
    });

    it("emits one url per distinct basepath across instances", () => {
        expect(
            resolvePreviewUrlsForInstances({
                previewHostname,
                instanceUrls: [
                    "https://acme.docs.buildwithfern.com/a/",
                    "acme.docs.buildwithfern.com/b",
                    "docs.acme.com/a"
                ]
            })
        ).toEqual([`${previewHostname}/a`, `${previewHostname}/b`]);
    });
});
