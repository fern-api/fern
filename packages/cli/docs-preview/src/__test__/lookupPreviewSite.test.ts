import { describe, expect, it, vi } from "vitest";

import { MAX_PREVIEW_PAGES, PREVIEW_PAGE_SIZE, lookupPreviewSiteUrl } from "../lookupPreviewSite.js";

function item(domain: string, basePath?: string) {
    return { domain, basePath };
}

const HOSTNAME = "acme-preview-mr-2.docs.buildwithfern.com";

describe("lookupPreviewSiteUrl", () => {
    it("preserves the basepath of a preview published under one", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({
            urls: [item("acme-preview-mr-1.docs.buildwithfern.com"), item(HOSTNAME, "/docs")]
        });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({
            type: "found",
            url: `${HOSTNAME}/docs`
        });
    });

    it("returns the bare hostname for a root preview", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({ urls: [item(HOSTNAME)] });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({
            type: "found",
            url: HOSTNAME
        });
    });

    it("reports every site on the host when it serves more than one basepath", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({
            urls: [item(HOSTNAME, "/docs"), item(HOSTNAME, "/api")]
        });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({
            type: "ambiguous",
            urls: [`${HOSTNAME}/docs`, `${HOSTNAME}/api`]
        });
    });

    it("reports not found when no preview matches the hostname", async () => {
        const listPreviewUrls = vi
            .fn()
            .mockResolvedValue({ urls: [item("other-preview-mr-2.docs.buildwithfern.com", "/docs")] });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({ type: "notFound" });
    });

    it("matches case-insensitively", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({ urls: [item(HOSTNAME.toUpperCase(), "/docs")] });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({
            type: "found",
            url: `${HOSTNAME.toUpperCase()}/docs`
        });
    });

    it("keeps paging while pages come back full", async () => {
        const fullPage = Array.from({ length: PREVIEW_PAGE_SIZE }, (_, i) =>
            item(`acme-preview-filler-${i}.docs.buildwithfern.com`)
        );
        const listPreviewUrls = vi
            .fn()
            .mockResolvedValueOnce({ urls: fullPage })
            .mockResolvedValueOnce({ urls: [item(HOSTNAME, "/docs")] });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({
            type: "found",
            url: `${HOSTNAME}/docs`
        });
        expect(listPreviewUrls).toHaveBeenCalledTimes(2);
        expect(listPreviewUrls).toHaveBeenLastCalledWith({ page: 2, limit: PREVIEW_PAGE_SIZE, preview: true });
    });

    it("distinguishes an exhausted scan from a missing preview", async () => {
        const fullPage = Array.from({ length: PREVIEW_PAGE_SIZE }, (_, i) =>
            item(`acme-preview-filler-${i}.docs.buildwithfern.com`)
        );
        const listPreviewUrls = vi.fn().mockResolvedValue({ urls: fullPage });

        expect(await lookupPreviewSiteUrl({ listPreviewUrls, hostname: HOSTNAME })).toEqual({
            type: "scanLimitReached",
            pagesScanned: MAX_PREVIEW_PAGES
        });
    });
});
