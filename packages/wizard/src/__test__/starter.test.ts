import { createHash } from "crypto";
import { mkdtemp, readdir, readFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { afterEach, describe, expect, it } from "vitest";
import { getDocsStarter } from "../docs-site/starter";

const STARTER_DIR = fileURLToPath(new URL("../../templates/docs-starter", import.meta.url));
const SOURCE = "https://example.test/starter";

const tempDirs: string[] = [];
afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function cacheDir(): Promise<string> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-starter-"));
    tempDirs.push(dir);
    return dir;
}

function sha256(contents: string | Buffer): string {
    return createHash("sha256").update(contents).digest("hex");
}

/** Serves files by URL, counting requests. */
function fakeServer(files: Record<string, string>): { fetchImpl: typeof fetch; requests: string[] } {
    const requests: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        requests.push(url);
        const body = files[url];
        return body === undefined ? new Response("not found", { status: 404 }) : new Response(body);
    };
    return { fetchImpl, requests };
}

function manifestFor(files: Record<string, string>): string {
    return JSON.stringify({
        files: Object.entries(files).map(([file, contents]) => ({
            path: file,
            size: Buffer.byteLength(contents),
            sha256: sha256(contents)
        }))
    });
}

describe("docs starter download", () => {
    it("downloads every file once, checks it, and reuses the cache", async () => {
        const files = { "base/docs.yml": "title: Docs\n", "layouts/layout-2/docs.partial.yml": "layout: {}\n" };
        const server = fakeServer({
            [`${SOURCE}/manifest.json`]: manifestFor(files),
            ...Object.fromEntries(Object.entries(files).map(([file, contents]) => [`${SOURCE}/${file}`, contents]))
        });
        const cache = await cacheDir();
        const starter = await getDocsStarter({ source: SOURCE, cacheDir: cache, fetchImpl: server.fetchImpl });
        await expect(readFile(path.join(starter, "base", "docs.yml"), "utf8")).resolves.toBe("title: Docs\n");
        await expect(readFile(path.join(starter, "layouts", "layout-2", "docs.partial.yml"), "utf8")).resolves.toBe(
            "layout: {}\n"
        );
        expect(server.requests).toHaveLength(3);

        // A second run uses the cache, and no partial downloads are left behind.
        await expect(getDocsStarter({ source: SOURCE, cacheDir: cache, fetchImpl: server.fetchImpl })).resolves.toBe(
            starter
        );
        expect(server.requests).toHaveLength(3);
        expect((await readdir(cache)).filter((entry) => entry.startsWith(".download-"))).toEqual([]);
    });

    it("rejects a file that doesn't match the manifest, and caches nothing", async () => {
        const server = fakeServer({
            [`${SOURCE}/manifest.json`]: manifestFor({ "base/docs.yml": "title: Docs\n" }),
            [`${SOURCE}/base/docs.yml`]: "title: Tampered\n"
        });
        const cache = await cacheDir();
        await expect(getDocsStarter({ source: SOURCE, cacheDir: cache, fetchImpl: server.fetchImpl })).rejects.toThrow(
            "doesn't match the starter's manifest"
        );
        expect(await readdir(cache)).toEqual([]);
    });

    it("refuses manifest paths that leave the starter folder", async () => {
        const server = fakeServer({
            [`${SOURCE}/manifest.json`]: JSON.stringify({ files: [{ path: "../escape", size: 1, sha256: "x" }] })
        });
        await expect(
            getDocsStarter({ source: SOURCE, cacheDir: await cacheDir(), fetchImpl: server.fetchImpl })
        ).rejects.toThrow("manifest");
    });

    it("uses a local folder as is", async () => {
        await expect(getDocsStarter({ source: STARTER_DIR })).resolves.toBe(STARTER_DIR);
    });

    it("has a manifest that lists exactly the starter's files", async () => {
        const manifest: unknown = JSON.parse(await readFile(path.join(STARTER_DIR, "manifest.json"), "utf8"));
        const listed = new Map<string, string>();
        if (typeof manifest === "object" && manifest !== null && "files" in manifest && Array.isArray(manifest.files)) {
            for (const file of manifest.files) {
                listed.set(String(file.path), String(file.sha256));
            }
        }
        const onDisk = new Map<string, string>();
        for (const entry of await readdir(STARTER_DIR, { recursive: true, withFileTypes: true })) {
            const relative = path
                .relative(STARTER_DIR, path.join(entry.parentPath, entry.name))
                .split(path.sep)
                .join("/");
            if (entry.isFile() && relative !== "manifest.json" && relative !== "SOURCE.md") {
                onDisk.set(relative, sha256(await readFile(path.join(STARTER_DIR, relative))));
            }
        }
        // If this fails, run `node scripts/write-starter-manifest.mjs`.
        expect(listed).toEqual(onDisk);
    });
});
