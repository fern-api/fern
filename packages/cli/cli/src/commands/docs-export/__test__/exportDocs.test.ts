import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { keepsFile, parseInstanceUrl, writeExport } from "../exportDocs.js";
import type { ExportSource } from "../exportSources.js";

function fakeSource(batches: Record<string, string>[], basepath = ""): ExportSource & { closed: boolean } {
    const source = {
        basepath,
        closed: false,
        async *batches() {
            for (const batch of batches) {
                yield Object.entries(batch).map(([filePath, body]) => ({
                    path: filePath,
                    read: async () => new TextEncoder().encode(body)
                }));
            }
        },
        close: async () => {
            source.closed = true;
        }
    };
    return source;
}

describe("keepsFile", () => {
    it("keeps the whole site for html and only Markdown plus llms.txt for md", () => {
        const files = ["index.html", "guides/quickstart.md", "llms.txt", "_astro/main.css", "fern-nav/abc.json"];
        expect(files.filter((filePath) => keepsFile({ filePath, format: "html", basepath: "" }))).toEqual(files);
        expect(files.filter((filePath) => keepsFile({ filePath, format: "md", basepath: "" }))).toEqual([
            "guides/quickstart.md",
            "llms.txt"
        ]);
    });

    it("drops router-only files in both formats", () => {
        for (const filePath of ["_redirects", "fern-md-acl/page.md", "learn/fern-rbac-manifest.json"]) {
            expect(keepsFile({ filePath, format: "html", basepath: "learn" })).toBe(false);
            expect(keepsFile({ filePath, format: "md", basepath: "learn" })).toBe(false);
        }
    });
});

describe("parseInstanceUrl", () => {
    it("splits a docs.yml instance url into domain and basepath", () => {
        expect(parseInstanceUrl("acme.docs.buildwithfern.com")).toEqual({
            domain: "acme.docs.buildwithfern.com",
            basepath: ""
        });
        expect(parseInstanceUrl("https://docs.acme.com/learn/")).toEqual({
            domain: "docs.acme.com",
            basepath: "/learn"
        });
    });
});

describe("writeExport", () => {
    let outputDir: string;
    beforeEach(async () => {
        outputDir = await mkdtemp(path.join(tmpdir(), "docs-export-test-"));
    });
    afterEach(async () => {
        await rm(outputDir, { recursive: true, force: true });
    });

    it("writes every batch under site-relative paths and closes the source", async () => {
        const source = fakeSource(
            [
                { "learn/index.html": "<html>", "learn/_redirects": "x" },
                { "learn/guides/quickstart.md": "# Quickstart" }
            ],
            "learn"
        );
        const count = await writeExport({ source, format: "html", outputDir });
        expect(count).toBe(2);
        expect(await readFile(path.join(outputDir, "learn/index.html"), "utf8")).toBe("<html>");
        expect(await readFile(path.join(outputDir, "learn/guides/quickstart.md"), "utf8")).toBe("# Quickstart");
        expect(source.closed).toBe(true);
    });

    it("refuses paths that escape the output folder", async () => {
        const source = fakeSource([{ "../escape.html": "x" }]);
        await expect(writeExport({ source, format: "html", outputDir })).rejects.toThrow(/outside the output folder/);
        expect(source.closed).toBe(true);
    });
});
