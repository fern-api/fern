import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildDocsSourceArchive, type DocsSourceFile, findFernRoot, isExcluded } from "../docsSourceArchive.js";

describe("docsSourceArchive", () => {
    let root: string;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "fern-source-"));
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    async function write(relativePath: string, content: string | Buffer): Promise<void> {
        await mkdir(path.dirname(path.join(root, relativePath)), { recursive: true });
        await writeFile(path.join(root, relativePath), content);
    }

    function parse(buffer: Buffer): DocsSourceFile[] {
        return JSON.parse(buffer.toString("utf-8")) as DocsSourceFile[];
    }

    it("packs every file under fern/, sorted, with binary files in base64", async () => {
        await write("fern.config.json", '{"organization":"acme"}');
        await write("docs.yml", "title: Acme");
        await write("assets/logo.png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff]));

        const archive = await buildDocsSourceArchive({ fernRoot: root });

        expect(archive.type).toBe("ok");
        if (archive.type !== "ok") {
            return;
        }
        expect(archive.fileCount).toBe(3);
        expect(parse(archive.buffer)).toEqual([
            { path: "fern/assets/logo.png", content: "iVBORwD/", encoding: "base64" },
            { path: "fern/docs.yml", content: "title: Acme" },
            { path: "fern/fern.config.json", content: '{"organization":"acme"}' }
        ]);
    });

    it("leaves out env files, the guest session pointer and dependency folders", async () => {
        await write("docs.yml", "title: Acme");
        await write(".env", "SECRET=1");
        await write(".env.local", "SECRET=1");
        await write(".guest-session", "gs_1");
        await write("node_modules/pkg/index.js", "x");
        await write("components/.env.production", "SECRET=1");

        const archive = await buildDocsSourceArchive({ fernRoot: root });

        expect(archive.type === "ok" ? parse(archive.buffer).map((file) => file.path) : archive).toEqual([
            "fern/docs.yml"
        ]);
    });

    it("skips an empty folder instead of uploading nothing", async () => {
        expect(await buildDocsSourceArchive({ fernRoot: root })).toEqual({
            type: "skipped",
            reason: "the fern/ folder has no files"
        });
    });

    it("finds the folder that holds fern.config.json above a nested docs folder", async () => {
        await write("fern.config.json", "{}");
        await mkdir(path.join(root, "docs"), { recursive: true });

        expect(await findFernRoot(path.join(root, "docs"))).toBe(root);
    });

    it("treats .env and .env.* as secrets, but not names that only start alike", () => {
        expect(isExcluded(".env")).toBe(true);
        expect(isExcluded("pages/.env.staging")).toBe(true);
        expect(isExcluded(".environment.md")).toBe(false);
        expect(isExcluded("pages/env.md")).toBe(false);
    });
});
