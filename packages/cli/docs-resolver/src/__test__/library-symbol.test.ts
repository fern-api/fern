import type { docsYml } from "@fern-api/configuration";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { mkdir, mkdtemp, readFile, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";
import { createDocsLibrarySymbolRenderer, getVersionContentSources } from "../utils/createDocsLibrarySymbolRenderer.js";

function refVersion(version: string, ref: string): docsYml.VersionInfo {
    return {
        landingPage: undefined,
        version,
        navigation: { type: "untabbed", items: [] },
        availability: undefined,
        slug: undefined,
        hidden: undefined,
        viewers: undefined,
        orphaned: undefined,
        featureFlags: undefined,
        announcement: undefined,
        contentSource: {
            displayVersion: version,
            ref,
            sha: "0".repeat(40),
            absolutePathToFernFolder: AbsoluteFilePath.of(`/checkouts/${ref}/fern`),
            libraries: undefined
        }
    };
}

describe("getVersionContentSources", () => {
    it("collects ref-backed versions nested inside product groups", () => {
        const sources = getVersionContentSources({
            type: "productgroup",
            changelog: undefined,
            products: [
                {
                    type: "internal",
                    product: "SDK",
                    landingPage: undefined,
                    subtitle: undefined,
                    slug: undefined,
                    icon: "fa-solid fa-box",
                    image: undefined,
                    announcement: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined,
                    navigation: {
                        type: "versioned",
                        versions: [
                            refVersion("v1", "v1.0.0"),
                            { ...refVersion("v2", "v2.0.0"), contentSource: undefined }
                        ]
                    }
                },
                {
                    type: "external",
                    product: "Status",
                    subtitle: undefined,
                    href: "https://status.example.com",
                    icon: "fa-solid fa-signal",
                    image: undefined,
                    target: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                }
            ]
        });
        expect(sources.map((s) => s.ref)).toEqual(["v1.0.0"]);
    });

    it("returns nothing for untabbed navigation", () => {
        expect(getVersionContentSources({ type: "untabbed", items: [] })).toEqual([]);
    });
});

const context = createMockTaskContext();

describe("createDocsLibrarySymbolRenderer", () => {
    it("resolves the same library name against the docs.yml owning each page", async () => {
        const fixtureIr = resolve(
            AbsoluteFilePath.of(__dirname),
            "fixtures/library-symbol/fern/static/cuopt/.fern/library-ir.json"
        );
        const root = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-library-symbol-versions-")));
        const currentFern = AbsoluteFilePath.of(path.join(root, "fern"));
        const v1Fern = AbsoluteFilePath.of(path.join(root, "worktrees", "v1", "fern"));
        // v1 ships the same library name with a different IR (its class is named differently).
        const currentIr = path.join(currentFern, "static/sdk/.fern/library-ir.json");
        const v1Ir = path.join(v1Fern, "static/sdk/.fern/library-ir.json");
        await Promise.all([
            mkdir(path.dirname(currentIr), { recursive: true }),
            mkdir(path.dirname(v1Ir), { recursive: true })
        ]);
        const ir = await readFile(fixtureIr, "utf-8");
        await writeFile(currentIr, ir);
        await writeFile(v1Ir, ir.replaceAll("Solver", "LegacySolver"));

        const libraries: Record<string, docsYml.ParsedLibraryConfiguration> = {
            "cuopt-c": {
                input: { type: "git", git: "https://github.com/acme/sdk", subpath: undefined, ref: undefined },
                output: { path: "./static/sdk", pages: true },
                lang: "cpp"
            }
        };
        const render = createDocsLibrarySymbolRenderer({
            libraries,
            absolutePathToFernFolder: currentFern,
            versionContentSources: [
                {
                    displayVersion: "v1",
                    ref: "v1",
                    sha: "0".repeat(40),
                    absolutePathToFernFolder: v1Fern,
                    libraries
                }
            ]
        });
        const reference = { library: "cuopt-c", name: "cuopt::Solver::solve", heading: undefined, members: undefined };

        const current = await render(reference, AbsoluteFilePath.of(path.join(currentFern, "pages/a.mdx")));
        expect(current.mdx).toContain("solve");

        const v1Page = AbsoluteFilePath.of(path.join(v1Fern, "pages/a.mdx"));
        await expect(render(reference, v1Page)).rejects.toThrow(/was not found in the library IR/);
        const legacy = await render({ ...reference, name: "cuopt::LegacySolver::solve" }, v1Page);
        expect(legacy.mdx).toContain("solve");
    });
});

async function resolveFixture(fixture: string): Promise<DocsV1Write.DocsDefinition> {
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), `fixtures/${fixture}/fern`),
        context
    });
    if (docsWorkspace == null) {
        throw new Error("Failed to load docs workspace");
    }
    const resolver = new DocsDefinitionResolver({
        domain: "https://example.com",
        docsWorkspace,
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext: context,
        uploadFiles: async () => [],
        registerApi: async () => ""
    });
    return resolver.resolve();
}

function collectPageIds(node: unknown, out: string[] = []): string[] {
    if (node == null || typeof node !== "object") {
        return out;
    }
    if ("pageId" in node && typeof node.pageId === "string") {
        out.push(node.pageId);
    }
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) {
            for (const child of value) {
                collectPageIds(child, out);
            }
        } else if (typeof value === "object") {
            collectPageIds(value, out);
        }
    }
    return out;
}

function collectSlugs(node: unknown, out: string[] = []): string[] {
    if (node == null || typeof node !== "object") {
        return out;
    }
    if (("pageId" in node || "overviewPageId" in node) && "slug" in node && typeof node.slug === "string") {
        out.push(node.slug);
    }
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) {
            for (const child of value) {
                collectSlugs(child, out);
            }
        } else if (typeof value === "object") {
            collectSlugs(value, out);
        }
    }
    return out;
}

/**
 * `<LibrarySymbol />` tags in authored pages are resolved at build time from the IR
 * persisted by `fern docs md generate` (`<output.path>/.fern/library-ir.json`).
 */
describe("<LibrarySymbol /> in authored pages", () => {
    it("renders symbols from the persisted IR with the generated-page anchors", async () => {
        const docs = await resolveFixture("library-symbol");
        const page = docs.pages[DocsV1Write.PageId(RelativeFilePath.of("pages/c-api.mdx"))];
        expect(page).toBeDefined();
        const markdown = page?.markdown ?? "";

        expect(markdown).not.toContain("<LibrarySymbol");
        expect(markdown).toContain("### `cuopt_int_t` [#cuoptintt]");
        expect(markdown).toContain("The integer type used by the solver.");
        expect(markdown).toContain("#### `cuOptGetIntSize` [#cuoptgetintsize]");
        expect(markdown).toContain("Returns the size in bytes of cuopt_int_t.");
        // Authored prose around the includes is preserved
        expect(markdown).toContain("Use the following to inspect the width at runtime:");

        expect(collectPageIds(docs.config.root)).toContain("static/cuopt/solver.mdx");
    });

    it("links Python types in authored embeds to the generated pages' final URLs", async () => {
        const docs = await resolveFixture("library-symbol-python");
        const page = docs.pages[DocsV1Write.PageId(RelativeFilePath.of("pages/reference/python-api.mdx"))];
        expect(page).toBeDefined();
        const markdown = page?.markdown ?? "";

        expect(markdown).not.toContain("<LibrarySymbol");
        expect(markdown).not.toContain(".mdx");
        // `cuopt.solve` returns a type from a sibling module; the class embed references itself.
        // Both resolve to the generated module page's navigation slug, never to a same-page anchor.
        const settingsSlug = collectSlugs(docs.config.root).find((slug) => slug.endsWith("/linear_programming"));
        expect(settingsSlug, "a nav node for the linear_programming page").toBeDefined();
        expect(markdown).toContain(
            `"cuopt.linear_programming.SolverSettings":"/${settingsSlug}#cuopt-linear_programming-SolverSettings"`
        );
        expect(markdown).not.toContain('"cuopt.linear_programming.SolverSettings":"#');
    });

    it("output.pages: false keeps <LibrarySymbol /> working but omits the generated navigation", async () => {
        const docs = await resolveFixture("library-symbol-no-pages");
        const page = docs.pages[DocsV1Write.PageId(RelativeFilePath.of("pages/c-api.mdx"))];
        expect(page?.markdown).toContain("#### `cuOptGetIntSize` [#cuoptgetintsize]");
        expect(collectPageIds(docs.config.root)).not.toContain("static/cuopt/solver.mdx");
    });
});
