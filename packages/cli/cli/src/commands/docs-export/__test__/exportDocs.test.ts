import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ORPCError } from "@fern-api/fdr-sdk/orpc-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import yazl from "yazl";
import {
    exportFailureMessage,
    isSafeOutputDir,
    keepsFile,
    parseInstanceUrl,
    safeRelativePath,
    writeExport
} from "../exportDocs.js";
import { type ExportSource, extractZip, hostedSource, type SiteExportClient } from "../exportSources.js";

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

describe("safeRelativePath", () => {
    it("keeps plain site paths and rejects ones that could escape or misbehave on disk", () => {
        expect(safeRelativePath("docs/quickstart/index.html")).toBe(path.join("docs", "quickstart", "index.html"));
        for (const unsafe of ["/etc/passwd", "../x", "a/../../x", "a//b", "./a", "a\\b", "C:/x", "a\0b", ""]) {
            expect(safeRelativePath(unsafe)).toBeUndefined();
        }
    });
});

describe("exportFailureMessage", () => {
    it("explains the daily limit and a site outside the organization", () => {
        expect(exportFailureMessage(new ORPCError("TOO_MANY_REQUESTS"))).toMatch(/daily export limit/);
        expect(exportFailureMessage(new ORPCError("FORBIDDEN"))).toMatch(/does not belong to the organization/);
        expect(exportFailureMessage(new Error("boom"))).toBe("Docs export failed");
    });
});

async function zipOf(files: Record<string, string>, zipPath: string): Promise<void> {
    const zip = new yazl.ZipFile();
    for (const [name, body] of Object.entries(files)) {
        zip.addBuffer(Buffer.from(body), name);
    }
    zip.end();
    const chunks: Buffer[] = [];
    for await (const chunk of zip.outputStream) {
        chunks.push(Buffer.from(chunk));
    }
    await writeFile(zipPath, Buffer.concat(chunks));
}

describe("extractZip", () => {
    let workDir: string;
    beforeEach(async () => {
        workDir = await mkdtemp(path.join(tmpdir(), "docs-export-zip-"));
    });
    afterEach(async () => {
        await rm(workDir, { recursive: true, force: true });
    });

    it("unpacks site paths", async () => {
        const zipPath = path.join(workDir, "site.zip");
        await zipOf({ "learn/index.html": "<html>", "llms.txt": "index" }, zipPath);
        await extractZip(zipPath, path.join(workDir, "out"));
        expect(await readFile(path.join(workDir, "out", "learn", "index.html"), "utf8")).toBe("<html>");
        expect(await readFile(path.join(workDir, "out", "llms.txt"), "utf8")).toBe("index");
    });

    it("refuses an entry that escapes the output folder", async () => {
        const zipPath = path.join(workDir, "evil.zip");
        await zipOf({ "aa/escape.html": "x" }, zipPath);
        // yazl refuses `..` names, so rename the entry in place: "aa/" and "../" have the same length.
        const bytes = await readFile(zipPath);
        await writeFile(zipPath, Buffer.from(bytes.toString("latin1").replaceAll("aa/escape", "../escape"), "latin1"));
        await expect(extractZip(zipPath, path.join(workDir, "out"))).rejects.toThrow();
        await expect(readFile(path.join(workDir, "escape.html"))).rejects.toThrow();
    });
});

describe("hostedSource", () => {
    let workDir: string;
    beforeEach(async () => {
        workDir = await mkdtemp(path.join(tmpdir(), "docs-export-hosted-"));
    });
    afterEach(async () => {
        vi.unstubAllGlobals();
        await rm(workDir, { recursive: true, force: true });
    });

    function fakeClient(statuses: string[], errorMessage?: string): SiteExportClient & { created: unknown[] } {
        const created: unknown[] = [];
        let poll = 0;
        return {
            created,
            createTask: async (input: unknown) => {
                created.push(input);
                return { id: "task-1" };
            },
            getTask: async () => ({ status: statuses[Math.min(poll++, statuses.length - 1)], errorMessage }),
            getDownloadUrl: async () => ({
                downloadUrl: "https://s3.example/site.zip",
                fileName: "site.zip",
                sizeBytes: 1
            })
        } as unknown as SiteExportClient & { created: unknown[] };
    }

    it("creates a task, waits for it, then yields the unpacked zip", async () => {
        const zipPath = path.join(workDir, "site.zip");
        await zipOf({ "index.md": "# Home" }, zipPath);
        const zipBytes = await readFile(zipPath);
        vi.stubGlobal("fetch", async () => new Response(zipBytes));
        const client = fakeClient(["PENDING", "RUNNING", "COMPLETED"]);
        const source = hostedSource({
            client,
            orgId: "acme",
            docsUrl: "acme.docs.buildwithfern.com",
            format: "md",
            pollIntervalMs: 0
        });
        const files: string[] = [];
        for await (const batch of source.batches()) {
            files.push(...batch.map((file) => file.path));
        }
        expect(files).toEqual(["index.md"]);
        expect(client.created).toEqual([{ orgId: "acme", docsUrl: "acme.docs.buildwithfern.com", format: "md" }]);
    });

    it("surfaces the task's error when the export Job fails", async () => {
        const client = fakeClient(["RUNNING", "FAILED"], "the site was republished during the export");
        const source = hostedSource({
            client,
            orgId: "acme",
            docsUrl: "acme.docs.buildwithfern.com",
            format: "html",
            pollIntervalMs: 0
        });
        await expect(writeExport({ source, format: "html", outputDir: path.join(workDir, "out") })).rejects.toThrow(
            /republished during the export/
        );
    });
});
