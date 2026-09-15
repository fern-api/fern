import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AstroPreviewModel } from "../astro/buildAstroPreviewModel.js";
import { LocalLedgerMirror } from "../astro/LocalLedgerMirror.js";

const HASH = "a".repeat(64);
const FILE_HASH = "b".repeat(64);
const ORG = "acme";
const DOMAIN = "acme.docs.buildwithfern.com";

async function fetchStatus(url: string, init?: RequestInit): Promise<number> {
    const response = await fetch(url, init);
    await response.arrayBuffer();
    return response.status;
}

describe("LocalLedgerMirror", () => {
    const mirror = new LocalLedgerMirror();
    let base: string;
    let model: AstroPreviewModel;

    beforeAll(async () => {
        const dir = await mkdtemp(join(tmpdir(), "ledger-mirror-"));
        const imagePath = join(dir, "logo.png");
        await writeFile(imagePath, "png-bytes");
        await writeFile(join(dir, "secret.txt"), "do not serve");

        model = {
            orgId: ORG,
            domain: DOMAIN,
            basepath: "/docs",
            manifest: Buffer.from(JSON.stringify({ version: 1 })),
            blobs: new Map([[HASH, { bytes: Buffer.from("blob"), contentType: "application/json" }]]),
            files: new Map([
                [
                    FILE_HASH,
                    {
                        absoluteFilePath: AbsoluteFilePath.of(imagePath),
                        contentType: "image/png",
                        fullPath: "assets/logo.png"
                    }
                ]
            ])
        };

        const port = await mirror.listen(0);
        base = `http://127.0.0.1:${port}`;
    });

    afterAll(async () => {
        await mirror.close();
    });

    it("returns 503 before a model is available", async () => {
        expect(await fetchStatus(`${base}/manifest/v1/fdr.json`)).toBe(503);
    });

    it("serves the manifest for both local-mode keys", async () => {
        mirror.replaceModel(model);
        const bare = await fetch(`${base}/manifest/v1/fdr.json`);
        expect(bare.status).toBe(200);
        expect(bare.headers.get("content-type")).toContain("application/json");
        expect(await bare.json()).toEqual({ version: 1 });
        expect(await fetchStatus(`${base}/manifest/docs/v1/fdr.json`)).toBe(200);
        expect(await fetchStatus(`${base}/manifest/other/v1/fdr.json`)).toBe(404);
    });

    it("serves CAS blobs by bare hash and org-scoped key", async () => {
        const bare = await fetch(`${base}/cas/${HASH}`);
        expect(bare.status).toBe(200);
        expect(await bare.text()).toBe("blob");
        expect(await fetchStatus(`${base}/cas/v1/${ORG}/aa/${HASH}`)).toBe(200);
        expect(await fetchStatus(`${base}/cas/v1/other-org/aa/${HASH}`)).toBe(404);
        expect(await fetchStatus(`${base}/cas/v1/${ORG}/zz/${HASH}`)).toBe(404);
        expect(await fetchStatus(`${base}/cas/${"c".repeat(64)}`)).toBe(404);
        expect(await fetchStatus(`${base}/cas/not-a-hash`)).toBe(404);
    });

    it("fails open for dynamic IR", async () => {
        expect(await fetchStatus(`${base}/dynamic-ir/${HASH}`)).toBe(404);
    });

    it("serves only files present in the model", async () => {
        const ok = await fetch(`${base}/files/${DOMAIN}/${FILE_HASH}/assets/logo.png`);
        expect(ok.status).toBe(200);
        expect(ok.headers.get("content-type")).toContain("image/png");
        expect(await ok.text()).toBe("png-bytes");

        expect(await fetchStatus(`${base}/files/${DOMAIN}/${FILE_HASH}/assets/other.png`)).toBe(404);
        expect(await fetchStatus(`${base}/files/other.example.com/${FILE_HASH}/assets/logo.png`)).toBe(404);
        expect(await fetchStatus(`${base}/files/${DOMAIN}/${FILE_HASH}/../secret.txt`)).toBe(404);
        expect(await fetchStatus(`${base}/files/${DOMAIN}/${FILE_HASH}/..%2Fsecret.txt`)).toBe(404);
        expect(await fetchStatus(`${base}/files/${DOMAIN}/${FILE_HASH}/assets%2F..%2F..%2Fsecret.txt`)).toBe(404);
        expect(await fetchStatus(`${base}/files/${DOMAIN}/${FILE_HASH}/assets/logo.png%00`)).toBe(404);
        expect([400, 404]).toContain(await fetchStatus(`${base}/files/%ZZ`));
        const missing = await fetch(`${base}/files/.missing.json`);
        expect(await missing.json()).toEqual([]);
    });

    it("rejects non-read methods and unknown routes", async () => {
        expect(await fetchStatus(`${base}/cas/${HASH}`, { method: "POST" })).toBe(405);
        expect(await fetchStatus(`${base}/cas/${HASH}`, { method: "DELETE" })).toBe(405);
        expect(await fetchStatus(`${base}/`)).toBe(404);
        expect(await fetchStatus(`${base}/etc/passwd`)).toBe(404);
    });

    it("swaps models atomically", async () => {
        mirror.replaceModel({ ...model, manifest: Buffer.from(JSON.stringify({ version: 2 })) });
        const response = await fetch(`${base}/manifest/v1/fdr.json`);
        expect(await response.json()).toEqual({ version: 2 });
    });
});
