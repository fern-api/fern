import { describe, expect, it, vi } from "vitest";
import { createSpecsTarGzCache } from "../createSpecsTarGzCache.js";

describe("createSpecsTarGzCache", () => {
    it("shares one in-flight archive operation with concurrent generator tasks", async () => {
        let resolveArchive: ((archive: Buffer) => void) | undefined;
        const deferredArchive = new Promise<Buffer>((resolve) => {
            resolveArchive = resolve;
        });
        const archiveFactory = vi.fn(() => deferredArchive);
        const getArchive = createSpecsTarGzCache(archiveFactory);

        const archiveRequests = [getArchive(), getArchive(), getArchive(), getArchive()];

        expect(archiveFactory).toHaveBeenCalledTimes(1);
        const archive = Buffer.from("shared-specs-archive");
        resolveArchive?.(archive);

        const results = await Promise.all(archiveRequests);
        expect(results).toEqual([archive, archive, archive, archive]);
        expect(results.every((result) => result === archive)).toBe(true);
    });
});
