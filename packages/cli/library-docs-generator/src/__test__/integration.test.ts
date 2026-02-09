import type { FdrAPI } from "@fern-api/fdr-sdk";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generate } from "../PythonDocsGenerator";
import type { NavNode } from "../writers/NavigationBuilder";

const NEMO_MODULES: Record<string, FdrAPI.libraryDocs.PythonModuleIr> = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "nemo-modules.json"), "utf-8")
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeModule(overrides: Partial<FdrAPI.libraryDocs.PythonModuleIr>): FdrAPI.libraryDocs.PythonModuleIr {
    return {
        name: "mod",
        path: "mod",
        docstring: undefined,
        submodules: [],
        classes: [],
        functions: [],
        attributes: [],
        ...overrides
    } as FdrAPI.libraryDocs.PythonModuleIr;
}

function makeFunction(overrides: Partial<FdrAPI.libraryDocs.PythonFunctionIr>): FdrAPI.libraryDocs.PythonFunctionIr {
    return {
        name: "func",
        path: "mod.func",
        signature: "def mod.func()",
        parameters: [],
        isAsync: false,
        decorators: [],
        isClassmethod: false,
        isStaticmethod: false,
        isProperty: false,
        docstring: undefined,
        returnTypeInfo: undefined,
        ...overrides
    } as FdrAPI.libraryDocs.PythonFunctionIr;
}

function makeAttr(overrides: Partial<FdrAPI.libraryDocs.AttributeIr>): FdrAPI.libraryDocs.AttributeIr {
    return {
        name: "ATTR",
        path: "mod.ATTR",
        typeInfo: undefined,
        value: undefined,
        docstring: undefined,
        ...overrides
    } as FdrAPI.libraryDocs.AttributeIr;
}

/** Recursively collect all .mdx files under a directory. */
function collectMdxFiles(dir: string): string[] {
    const results: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...collectMdxFiles(full));
        } else if (entry.name.endsWith(".mdx")) {
            results.push(full);
        }
    }
    return results;
}

/** Flatten navigation tree for easier assertions. */
function flattenNav(nodes: NavNode[]): NavNode[] {
    const result: NavNode[] = [];
    for (const node of nodes) {
        result.push(node);
        if (node.type === "section") {
            result.push(...flattenNav(node.children));
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Build test IR
// ---------------------------------------------------------------------------

/**
 * Compose a realistic IR from NeMo fixture modules.
 *
 * Tree structure:
 *   nemo_rl (root — has functions + attribute)
 *   ├── distillation (leaf — 2 TypedDicts, 2 functions, 1 attribute)
 *   ├── package_info (leaf — 3 attributes only)
 *   └── data (package — submodule links only, no direct content)
 *       └── aime (leaf — 1 class with methods, has docstring)
 */
function buildTestIr(): FdrAPI.libraryDocs.PythonLibraryDocsIr {
    // biome-ignore lint/style/noNonNullAssertion: fixture lookup
    const distillation = NEMO_MODULES["leaf_with_mixed_content"]!;
    // biome-ignore lint/style/noNonNullAssertion: fixture lookup
    const packageInfo = NEMO_MODULES["leaf_attributes_only"]!;
    // biome-ignore lint/style/noNonNullAssertion: fixture lookup
    const aime = NEMO_MODULES["module_with_docstring"]!;

    const dataModule = makeModule({
        name: "data",
        path: "nemo_rl.data",
        submodules: [aime]
    });

    const rootModule = makeModule({
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        ...NEMO_MODULES["package_with_content"]!,
        submodules: [distillation, packageInfo, dataModule]
    });

    return { rootModule } as FdrAPI.libraryDocs.PythonLibraryDocsIr;
}

// ===========================================================================
// Integration Tests
// ===========================================================================

describe("generate() — full pipeline integration", () => {
    let tmpDir: string;
    const SLUG = "reference/python";

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "libdocs-integration-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("generates the expected number of pages", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        // 5 pages: nemo_rl, distillation, package_info, data, aime
        expect(result.pageCount).toBe(5);
        expect(result.writtenFiles).toHaveLength(5);
    });

    it("writes all files to the correct paths on disk", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        for (const filePath of result.writtenFiles) {
            expect(existsSync(filePath)).toBe(true);
        }

        // Verify specific file paths exist
        const expectedFiles = [
            `${SLUG}/nemo_rl.mdx`,
            `${SLUG}/nemo_rl/distillation.mdx`,
            `${SLUG}/nemo_rl/package_info.mdx`,
            `${SLUG}/nemo_rl/data.mdx`,
            `${SLUG}/nemo_rl/data/aime.mdx`
        ];
        for (const relPath of expectedFiles) {
            expect(existsSync(join(tmpDir, relPath))).toBe(true);
        }

        // No extra files
        const allMdx = collectMdxFiles(tmpDir);
        expect(allMdx).toHaveLength(5);
    });

    it("sets rootPageId to the root module page", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        expect(result.rootPageId).toBe("reference/python/nemo_rl.mdx");
    });

    it("every page has valid MDX frontmatter with slug and title", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        for (const filePath of result.writtenFiles) {
            const content = readFileSync(filePath, "utf-8");
            expect(content).toMatch(/^---\n/);
            expect(content).toMatch(/slug:/);
            expect(content).toMatch(/title:/);
            expect(content).toMatch(/\n---\n/);
        }
    });

    it("root module page contains Package Contents with summary tables", () => {
        const ir = buildTestIr();
        generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const rootPage = readFileSync(join(tmpDir, `${SLUG}/nemo_rl.mdx`), "utf-8");

        // Has submodule links (package has submodules)
        expect(rootPage).toContain("## Subpackages");
        // Has content sections
        expect(rootPage).toContain("## Package Contents");
        expect(rootPage).toContain("### Functions");
        expect(rootPage).toContain("### Data");
        expect(rootPage).toContain("### API");
    });

    it("leaf module page with classes renders class details", () => {
        const ir = buildTestIr();
        generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const page = readFileSync(join(tmpDir, `${SLUG}/nemo_rl/distillation.mdx`), "utf-8");

        // Has classes summary table
        expect(page).toContain("### Classes");
        expect(page).toContain("DistillationConfig");
        expect(page).toContain("DistillationSaveState");
        // Has functions summary
        expect(page).toContain("### Functions");
        expect(page).toContain("check_vocab_equality");
        // Has data section for attributes
        expect(page).toContain("### Data");
        expect(page).toContain("TokenizerType");
        // Has detailed API section with anchors
        expect(page).toContain("<Anchor");
        expect(page).toContain("```python");
    });

    it("attributes-only module renders correctly", () => {
        const ir = buildTestIr();
        generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const page = readFileSync(join(tmpDir, `${SLUG}/nemo_rl/package_info.mdx`), "utf-8");

        // Has data section but no classes or functions
        expect(page).toContain("### Data");
        expect(page).not.toContain("### Classes");
        expect(page).not.toContain("### Functions");
    });

    it("package-only module (data) renders submodule links", () => {
        const ir = buildTestIr();
        generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const page = readFileSync(join(tmpDir, `${SLUG}/nemo_rl/data.mdx`), "utf-8");

        // Has submodule links but no content sections
        expect(page).toContain("## Submodules");
        expect(page).not.toContain("## Module Contents");
        expect(page).not.toContain("## Package Contents");
    });

    it("nested leaf module renders docstring and class", () => {
        const ir = buildTestIr();
        generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const page = readFileSync(join(tmpDir, `${SLUG}/nemo_rl/data/aime.mdx`), "utf-8");

        // Module has docstring
        expect(page).toContain("AIME dataset");
        // Has class
        expect(page).toContain("AIMEDataset");
        expect(page).toContain("### Classes");
    });

    it("navigation tree matches module hierarchy", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        // Top-level: 3 sections (distillation, package_info, data)
        expect(result.navigation).toHaveLength(3);

        const titles = result.navigation.map((n) => n.title);
        expect(titles).toEqual(["distillation", "package_info", "data"]);

        // All top-level are sections (every submodule gets wrapped)
        for (const node of result.navigation) {
            expect(node.type).toBe("section");
        }

        // data section has nested aime section
        // biome-ignore lint/style/noNonNullAssertion: length asserted above
        const dataSection = result.navigation[2]!;
        expect(dataSection.type).toBe("section");
        if (dataSection.type === "section") {
            expect(dataSection.children).toHaveLength(1);
            expect(dataSection.children[0]?.title).toBe("aime");
        }
    });

    it("navigation page nodes have correct slugs and pageIds", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const allNodes = flattenNav(result.navigation);
        const pages = allNodes.filter((n) => n.type === "page");

        // Leaf pages: distillation, package_info, aime
        expect(pages).toHaveLength(3);

        for (const page of pages) {
            if (page.type === "page") {
                expect(page.slug).toMatch(/^reference\/python\//);
                expect(page.pageId).toBe(`${page.slug}.mdx`);
            }
        }
    });

    it("type links are resolved in code block signatures", () => {
        const ir = buildTestIr();
        generate({ ir, outputDir: tmpDir, slug: SLUG, title: "Python SDK" });

        const page = readFileSync(join(tmpDir, `${SLUG}/nemo_rl/distillation.mdx`), "utf-8");

        // _default_distillation_save_state returns DistillationSaveState
        // which is defined in the same module → should have a same-page anchor link
        // CodeBlock with links should appear
        expect(page).toContain("<CodeBlock");
        expect(page).toContain("```python");
    });
});

// ===========================================================================
// Edge case: minimal IR
// ===========================================================================

describe("generate() — edge cases", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "libdocs-edge-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("generates single page for root-only module with content", () => {
        const ir: FdrAPI.libraryDocs.PythonLibraryDocsIr = {
            rootModule: makeModule({
                name: "simple",
                path: "simple",
                functions: [makeFunction({ name: "hello", path: "simple.hello" })]
            })
        } as FdrAPI.libraryDocs.PythonLibraryDocsIr;

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Simple" });

        expect(result.pageCount).toBe(1);
        expect(result.rootPageId).toBe("ref/simple.mdx");
        expect(result.navigation).toEqual([]); // root has no submodules → empty nav
        expect(existsSync(join(tmpDir, "ref/simple.mdx"))).toBe(true);

        const content = readFileSync(join(tmpDir, "ref/simple.mdx"), "utf-8");
        expect(content).toContain("hello");
    });

    it("generates no pages for empty root module", () => {
        const ir: FdrAPI.libraryDocs.PythonLibraryDocsIr = {
            rootModule: makeModule({ name: "empty", path: "empty" })
        } as FdrAPI.libraryDocs.PythonLibraryDocsIr;

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Empty" });

        expect(result.pageCount).toBe(0);
        expect(result.navigation).toEqual([]);
    });

    it("handles deeply nested module tree", () => {
        const leaf = makeModule({
            name: "deep",
            path: "a.b.c.deep",
            attributes: [makeAttr({ name: "X", path: "a.b.c.deep.X" })]
        });
        const c = makeModule({ name: "c", path: "a.b.c", submodules: [leaf] });
        const b = makeModule({ name: "b", path: "a.b", submodules: [c] });
        const root = makeModule({ name: "a", path: "a", submodules: [b] });

        const ir = { rootModule: root } as FdrAPI.libraryDocs.PythonLibraryDocsIr;
        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Deep" });

        // Pages: a (has submodules), b (has submodules), c (has submodules), deep (has content)
        expect(result.pageCount).toBe(4);
        expect(existsSync(join(tmpDir, "ref/a.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "ref/a/b.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "ref/a/b/c.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "ref/a/b/c/deep.mdx"))).toBe(true);
    });

    it("written files match what exists on disk", () => {
        const ir = buildTestIr();
        const result = generate({ ir, outputDir: tmpDir, slug: "reference/python", title: "Test" });

        const filesOnDisk = collectMdxFiles(tmpDir).sort();
        const reportedFiles = [...result.writtenFiles].sort();

        expect(reportedFiles).toEqual(filesOnDisk);
    });
});
