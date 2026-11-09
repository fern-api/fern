import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ORPCError } from "@fern-api/fdr-sdk/orpc-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import yazl from "yazl";
import {
    defaultOutput,
    displayPath,
    exportFailureMessage,
    isSafeOutputDir,
    keepsFile,
    normalizeSlug,
    pdfExportOptions,
    pdfOutputPath,
    printPagesUrl,
    resolvePdfScope,
    safeRelativePath,
    writeExport
} from "../exportDocs.js";
import {
    downloadHostedPdf,
    type ExportSource,
    extractZip,
    hostedSource,
    type SiteExportClient
} from "../exportSources.js";

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

describe("displayPath", () => {
    it("is relative inside the folder the command runs from, else absolute", () => {
        expect(displayPath("/work/site/docs-acme-com-html", "/work/site")).toBe("./docs-acme-com-html");
        expect(displayPath("/tmp/out", "/work/site")).toBe("/tmp/out");
    });
});

describe("pdfOutputPath", () => {
    it("adds .pdf to a bare name and keeps an explicit .pdf file", () => {
        expect(pdfOutputPath("docs-export")).toBe("docs-export.pdf");
        expect(pdfOutputPath("out/site.PDF")).toBe("out/site.PDF");
    });
});

describe("defaultOutput", () => {
    it("names the output after the site and format, like the dashboard's download", () => {
        expect(defaultOutput("docs.acme.com", "html")).toBe("docs-acme-com-html");
        expect(defaultOutput("https://acme.com/docs/", "md")).toBe("acme-com-docs-md");
        expect(defaultOutput("docs.acme.com", "pdf")).toBe("docs-acme-com.pdf");
    });
});

describe("pdfExportOptions", () => {
    it("sends nothing when every setting is the default", () => {
        expect(pdfExportOptions({})).toBeUndefined();
        expect(pdfExportOptions({ cover: true, toc: true })).toBeUndefined();
    });

    it("maps the flags to the dashboard's export options", () => {
        expect(
            pdfExportOptions({ cover: false, toc: false, coverTitle: "Acme API", footerRight: "{pageIndex}" })
        ).toEqual({
            version: "v1",
            hideCover: true,
            hideToc: true,
            coverTitle: "Acme API",
            footerRightTemplate: "{pageIndex}"
        });
    });

    it("scopes the export to the given pages", () => {
        expect(pdfExportOptions({}, ["docs/a", "docs/b"])).toEqual({
            version: "v1",
            scope: { pageSlugs: ["docs/a", "docs/b"] }
        });
        expect(pdfExportOptions({}, [])).toBeUndefined();
    });
});

describe("resolvePdfScope", () => {
    const site = ["docs/welcome", "docs/guides/install", "docs/guides/configure", "docs/guides-extra", "docs/api/auth"];
    const none = { pages: [], sections: [], excludePages: [], excludeSections: [] };

    it("keeps each page and every page under each section, in the site's order", () => {
        expect(resolvePdfScope({ ...none, pages: ["docs/api/auth"], sections: ["/docs/guides/"] }, site)).toEqual([
            "docs/guides/install",
            "docs/guides/configure",
            "docs/api/auth"
        ]);
        expect(resolvePdfScope({ ...none, pages: ["docs/welcome", "/docs/welcome"] }, site)).toEqual(["docs/welcome"]);
        expect(resolvePdfScope({ ...none, sections: ["docs/guides", "docs/api"] }, site)).toEqual([
            "docs/guides/install",
            "docs/guides/configure",
            "docs/api/auth"
        ]);
    });

    it("drops excluded pages and sections from the selection, or from the whole site", () => {
        expect(
            resolvePdfScope(
                { ...none, sections: ["docs/guides", "docs/api"], excludePages: ["docs/guides/configure"] },
                site
            )
        ).toEqual(["docs/guides/install", "docs/api/auth"]);
        expect(
            resolvePdfScope({ ...none, excludeSections: ["docs/guides"], excludePages: ["docs/welcome"] }, site)
        ).toEqual(["docs/guides-extra", "docs/api/auth"]);
        expect(
            resolvePdfScope({ ...none, pages: ["docs/welcome"], excludePages: ["docs/api/auth", "docs/missing"] }, site)
        ).toEqual(["docs/welcome"]);
    });

    it("refuses a page that is not on the site, a section with no pages and an empty slug", () => {
        expect(() => resolvePdfScope({ ...none, pages: ["docs/missing"] }, site)).toThrow(
            "--page docs/missing is not a page on the site."
        );
        expect(() => resolvePdfScope({ ...none, pages: ["docs/a", "docs/b"] }, site)).toThrow(
            "--page docs/a, --page docs/b are not pages on the site."
        );
        expect(() => resolvePdfScope({ ...none, sections: ["docs/gui"] }, site)).toThrow(
            "--section docs/gui has no pages on the site."
        );
        expect(() => resolvePdfScope({ ...none, sections: ["/"] }, site)).toThrow(
            '--section needs a slug such as docs/guides; "/" is empty.'
        );
    });

    it("refuses excludes that leave nothing", () => {
        expect(() => resolvePdfScope({ ...none, sections: ["docs/api"], excludeSections: ["docs/api"] }, site)).toThrow(
            "--exclude-page and --exclude-section leave no pages to export."
        );
    });
});

describe("normalizeSlug", () => {
    it("drops surrounding slashes and spaces", () => {
        expect(normalizeSlug(" /docs/quickstart/ ")).toBe("docs/quickstart");
    });
});

describe("printPagesUrl", () => {
    it("points at the site's print page list", () => {
        expect(printPagesUrl("acme.docs.buildwithfern.com")).toBe("https://acme.docs.buildwithfern.com/_print/pages");
        expect(printPagesUrl("https://acme.com/docs/")).toBe("https://acme.com/docs/_print/pages");
        expect(printPagesUrl("https://acme.com/docs?preview=1#top")).toBe("https://acme.com/docs/_print/pages");
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
    it("explains the daily limit and passes on why FDR refused access", () => {
        expect(exportFailureMessage(new ORPCError("TOO_MANY_REQUESTS"))).toMatch(/daily export limit/);
        expect(
            exportFailureMessage(new ORPCError("FORBIDDEN", { message: "User does not belong to organization" }))
        ).toBe(
            "Export failed: User does not belong to organization. Check the organization in fern.config.json and the docs URL in docs.yml."
        );
        expect(exportFailureMessage(new Error("boom"))).toBe("Export failed: boom");
        expect(exportFailureMessage(new Error("Export failed: no live build (task t1)"))).toBe(
            "Export failed: no live build (task t1)"
        );
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

    it("downloads a PDF task's file into place", async () => {
        vi.stubGlobal("fetch", async () => new Response("%PDF-1.7"));
        const client = fakeClient(["RUNNING", "COMPLETED"]);
        const outputFile = path.join(workDir, "nested", "docs-export.pdf");
        await downloadHostedPdf({
            client,
            orgId: "acme",
            docsUrl: "acme.docs.buildwithfern.com",
            outputFile,
            options: { version: "v1", hideToc: true },
            pollIntervalMs: 0
        });
        expect(await readFile(outputFile, "utf8")).toBe("%PDF-1.7");
        expect(await readdir(path.dirname(outputFile))).toEqual(["docs-export.pdf"]);
        expect(client.created).toEqual([
            {
                orgId: "acme",
                docsUrl: "acme.docs.buildwithfern.com",
                format: "pdf",
                options: { version: "v1", hideToc: true }
            }
        ]);
    });

    it("keeps a previous PDF when the PDF task fails", async () => {
        const outputFile = path.join(workDir, "docs-export.pdf");
        await writeFile(outputFile, "old");
        const client = fakeClient(["FAILED"], "render failed");
        await expect(
            downloadHostedPdf({
                client,
                orgId: "acme",
                docsUrl: "acme.docs.buildwithfern.com",
                outputFile,
                pollIntervalMs: 0
            })
        ).rejects.toThrow(/render failed/);
        expect(await readFile(outputFile, "utf8")).toBe("old");
        expect(await readdir(workDir)).toEqual(["docs-export.pdf"]);
    });
});
