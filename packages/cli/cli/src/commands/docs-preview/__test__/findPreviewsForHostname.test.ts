import { describe, expect, it, vi } from "vitest";

import { findPreviewsForHostname } from "../deleteDocsPreview.js";
import { toPreviewUrl } from "../listDocsPreview.js";

function item(domain: string, basePath?: string) {
    return { domain, basePath, organizationId: "acme", updatedAt: "2026-07-17T00:00:00.000Z" };
}

const HOSTNAME = "acme-preview-mr-2.docs.buildwithfern.com";

describe("findPreviewsForHostname", () => {
    it("preserves the basepath of a preview published under one", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({
            urls: [item("acme-preview-mr-1.docs.buildwithfern.com"), item(HOSTNAME, "/docs")]
        });

        const matches = await findPreviewsForHostname({ listPreviewUrls, hostname: HOSTNAME });

        expect(matches.map(toPreviewUrl)).toEqual([`${HOSTNAME}/docs`]);
    });

    it("returns the bare hostname for a root preview", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({ urls: [item(HOSTNAME)] });

        const matches = await findPreviewsForHostname({ listPreviewUrls, hostname: HOSTNAME });

        expect(matches.map(toPreviewUrl)).toEqual([HOSTNAME]);
    });

    it("returns every site on the host when it serves more than one basepath", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({
            urls: [item(HOSTNAME, "/docs"), item(HOSTNAME, "/api")]
        });

        const matches = await findPreviewsForHostname({ listPreviewUrls, hostname: HOSTNAME });

        expect(matches.map(toPreviewUrl)).toEqual([`${HOSTNAME}/docs`, `${HOSTNAME}/api`]);
    });

    it("returns nothing when no preview matches the hostname", async () => {
        const listPreviewUrls = vi
            .fn()
            .mockResolvedValue({ urls: [item("other-preview-mr-2.docs.buildwithfern.com", "/docs")] });

        expect(await findPreviewsForHostname({ listPreviewUrls, hostname: HOSTNAME })).toEqual([]);
    });

    it("matches case-insensitively", async () => {
        const listPreviewUrls = vi.fn().mockResolvedValue({ urls: [item(HOSTNAME.toUpperCase(), "/docs")] });

        const matches = await findPreviewsForHostname({ listPreviewUrls, hostname: HOSTNAME });

        expect(matches).toHaveLength(1);
    });

    it("keeps paging while pages come back full", async () => {
        const firstPage = Array.from({ length: 1000 }, (_, i) =>
            item(`acme-preview-filler-${i}.docs.buildwithfern.com`)
        );
        const listPreviewUrls = vi
            .fn()
            .mockResolvedValueOnce({ urls: firstPage })
            .mockResolvedValueOnce({ urls: [item(HOSTNAME, "/docs")] });

        const matches = await findPreviewsForHostname({ listPreviewUrls, hostname: HOSTNAME });

        expect(matches.map(toPreviewUrl)).toEqual([`${HOSTNAME}/docs`]);
        expect(listPreviewUrls).toHaveBeenCalledTimes(2);
        expect(listPreviewUrls).toHaveBeenLastCalledWith({ page: 2, limit: 1000, preview: true });
    });
});
