import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isSafeOutputDir, keepsFile, parseInstanceUrl, writeExport } from "../exportDocs.js";
import type { ExportSource } from "../exportSources.js";

function fakeSource(batches: Record<string, string>[]): ExportSource & { finished: boolean } {
    const source = {
        finished: false,
        async *batches() {
            try {
                for (const batch of batches) {
                    yield Object.entries(batch).map(([filePath, body]) => ({
                        path: filePath,
                        read: async () => new TextEncoder().encode(body)
                    }));
                }
            } finally {
                source.finished = true;
            }
        }
    };
    return source;
}

describe("keepsFile", () => {
    it("keeps the whole site for html and only Markdown plus llms.txt for md", () => {
        const files = ["index.html", "guides/quickstart.md", "llms.txt", "_astro/main.css", "fern-nav/abc.json"];
        expect(files.filter((filePath) => keepsFile(filePath, "html"))).toEqual(files);
        expect(files.filter((filePath) => keepsFile(filePath, "md"))).toEqual(["guides/quickstart.md", "llms.txt"]);
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

    it("writes every batch under site-relative paths and lets the source clean up", async () => {
        const source = fakeSource([{ "learn/index.html": "<html>" }, { "learn/guides/quickstart.md": "# Quickstart" }]);
        const count = await writeExport({ source, format: "html", outputDir });
        expect(count).toBe(2);
        expect(await readFile(path.join(outputDir, "learn/index.html"), "utf8")).toBe("<html>");
        expect(await readFile(path.join(outputDir, "learn/guides/quickstart.md"), "utf8")).toBe("# Quickstart");
        expect(source.finished).toBe(true);
    });

    it("replaces a previous export but keeps .git", async () => {
        await mkdir(path.join(outputDir, ".git"));
        await writeFile(path.join(outputDir, ".git", "HEAD"), "ref");
        await writeFile(path.join(outputDir, "deleted-page.html"), "stale");
        await writeExport({ source: fakeSource([{ "index.md": "# Home" }]), format: "md", outputDir });
        expect((await readdir(outputDir)).sort()).toEqual([".git", "index.md"]);
        expect(await readFile(path.join(outputDir, ".git", "HEAD"), "utf8")).toBe("ref");
    });

    it("keeps a previous export when the source fails before its first batch", async () => {
        await writeFile(path.join(outputDir, "index.html"), "previous");
        const failing: ExportSource = {
            // biome-ignore lint/correctness/useYield: fails before yielding on purpose
            async *batches() {
                throw new Error("network down");
            }
        };
        await expect(writeExport({ source: failing, format: "html", outputDir })).rejects.toThrow("network down");
        expect(await readFile(path.join(outputDir, "index.html"), "utf8")).toBe("previous");
    });

    it("refuses paths that escape the output folder", async () => {
        const source = fakeSource([{ "../escape.html": "x" }]);
        await expect(writeExport({ source, format: "html", outputDir })).rejects.toThrow(/outside the output folder/);
        expect(source.finished).toBe(true);
    });
});

describe("isSafeOutputDir", () => {
    it("refuses the current folder and its parents", () => {
        expect(isSafeOutputDir("docs-export", "/repo")).toBe(true);
        expect(isSafeOutputDir("../sibling", "/repo")).toBe(true);
        expect(isSafeOutputDir(".", "/repo")).toBe(false);
        expect(isSafeOutputDir("..", "/repo")).toBe(false);
        expect(isSafeOutputDir("/", "/repo")).toBe(false);
    });
});
