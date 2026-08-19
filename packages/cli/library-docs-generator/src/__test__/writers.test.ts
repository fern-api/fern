import type { FdrAPI } from "@fern-api/fdr-sdk";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import jsYaml from "js-yaml";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MdxFileWriter } from "../writers/MdxFileWriter";
import { buildNavigation, NAVIGATION_FILENAME, type NavNode, writeNavigation } from "../writers/NavigationBuilder";

const NEMO_MODULES: Record<string, FdrAPI.libraryDocs.PythonModuleIr> = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "nemo-modules.json"), "utf-8")
);

function makeModule(overrides: Partial<FdrAPI.libraryDocs.PythonModuleIr>): FdrAPI.libraryDocs.PythonModuleIr {
    return {
        name: "mymod",
        path: "pkg.mymod",
        docstring: undefined,
        submodules: [],
        classes: [],
        functions: [],
        attributes: [],
        ...overrides
    } as FdrAPI.libraryDocs.PythonModuleIr;
}

function makeClass(overrides: Partial<FdrAPI.libraryDocs.PythonClassIr>): FdrAPI.libraryDocs.PythonClassIr {
    return {
        name: "MyClass",
        path: "pkg.mymod.MyClass",
        kind: "CLASS" as FdrAPI.libraryDocs.PythonClassKind,
        bases: [],
        docstring: undefined,
        constructorParams: [],
        methods: [],
        attributes: [],
        decorators: [],
        metaclass: undefined,
        isAbstract: false,
        hasSlots: false,
        typedDictFields: undefined,
        enumMembers: undefined,
        ...overrides
    } as FdrAPI.libraryDocs.PythonClassIr;
}

function makeFunction(overrides: Partial<FdrAPI.libraryDocs.PythonFunctionIr>): FdrAPI.libraryDocs.PythonFunctionIr {
    return {
        name: "my_func",
        path: "pkg.mymod.my_func",
        signature: "def pkg.mymod.my_func()",
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
        name: "MY_CONST",
        path: "pkg.mymod.MY_CONST",
        typeInfo: undefined,
        value: undefined,
        docstring: undefined,
        ...overrides
    } as FdrAPI.libraryDocs.AttributeIr;
}

/** Collect all node types in a flat list for easy assertions. */
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

describe("MdxFileWriter", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "mdx-writer-test-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("writes a single page to disk", () => {
        const writer = new MdxFileWriter(tmpDir);
        const filePath = writer.writePage("test.mdx", "# Hello");

        expect(existsSync(filePath)).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe("# Hello");
    });

    it("creates nested directories", () => {
        const writer = new MdxFileWriter(tmpDir);
        writer.writePage("a/b/c/deep.mdx", "content");

        const filePath = join(tmpDir, "a/b/c/deep.mdx");
        expect(existsSync(filePath)).toBe(true);
        expect(readFileSync(filePath, "utf-8")).toBe("content");
    });

    it("returns absolute file path from writePage", () => {
        const writer = new MdxFileWriter(tmpDir);
        const filePath = writer.writePage("page.mdx", "content");

        expect(filePath).toBe(join(tmpDir, "page.mdx"));
    });

    it("tracks all written files in result", () => {
        const writer = new MdxFileWriter(tmpDir);
        writer.writePage("a.mdx", "aaa");
        writer.writePage("b/c.mdx", "bbb");

        const { writtenFiles, pageCount } = writer.result();
        expect(pageCount).toBe(2);
        expect(writtenFiles).toHaveLength(2);
        expect(writtenFiles).toContain(join(tmpDir, "a.mdx"));
        expect(writtenFiles).toContain(join(tmpDir, "b/c.mdx"));
    });

    it("returns empty result when no pages written", () => {
        const writer = new MdxFileWriter(tmpDir);
        const { writtenFiles, pageCount } = writer.result();
        expect(pageCount).toBe(0);
        expect(writtenFiles).toEqual([]);
    });

    it("overwrites existing file", () => {
        const writer = new MdxFileWriter(tmpDir);
        writer.writePage("page.mdx", "old content");
        writer.writePage("page.mdx", "new content");

        expect(readFileSync(join(tmpDir, "page.mdx"), "utf-8")).toBe("new content");
        // Both writes are tracked
        expect(writer.result().pageCount).toBe(2);
    });

    it("preserves unicode content", () => {
        const writer = new MdxFileWriter(tmpDir);
        const content = "# θ, ε, π — math symbols\n\nContent with `$rA$` notation.";
        writer.writePage("unicode.mdx", content);

        expect(readFileSync(join(tmpDir, "unicode.mdx"), "utf-8")).toBe(content);
    });
});

describe("buildNavigation", () => {
    it("returns empty array for root with no submodules and no leaf content", () => {
        const root = makeModule({ name: "pkg", path: "pkg" });
        const nav = buildNavigation(root, "ref");
        expect(nav).toEqual([]);
    });

    it("creates section wrapping page for leaf submodule with content", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({
                    name: "utils",
                    path: "pkg.utils",
                    functions: [makeFunction({ name: "f", path: "pkg.utils.f" })]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        // Every submodule gets wrapped in a section by the parent
        expect(nav).toHaveLength(1);
        const section = nav[0];
        expect.assert(section?.type === "section");
        expect(section.title).toBe("utils");
        expect(section.slug).toBe("ref/pkg/utils");
        expect(section.children).toHaveLength(1);
        expect(section.children[0]).toEqual({
            type: "page",
            title: "utils",
            slug: "ref/pkg/utils",
            pageId: "ref/pkg/utils.mdx"
        });
    });

    it("creates nested sections for submodule with grandchildren", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({
                    name: "sub",
                    path: "pkg.sub",
                    submodules: [
                        makeModule({
                            name: "leaf",
                            path: "pkg.sub.leaf",
                            classes: [makeClass({ name: "C", path: "pkg.sub.leaf.C" })]
                        })
                    ]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        expect(nav).toHaveLength(1);
        // sub is a section wrapping leaf's section
        const sub = nav[0];
        expect.assert(sub?.type === "section");
        expect(sub.children).toHaveLength(1);
        // leaf is also wrapped in a section by sub
        const leafSection = sub.children[0];
        expect.assert(leafSection?.type === "section");
        expect(leafSection.children).toHaveLength(1);
        expect(leafSection.children[0]?.type).toBe("page");
    });

    it("skips submodule with no content and no children", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({ name: "empty", path: "pkg.empty" }),
                makeModule({
                    name: "filled",
                    path: "pkg.filled",
                    attributes: [makeAttr({ name: "X", path: "pkg.filled.X" })]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        // Only "filled" appears (wrapped in section); "empty" is skipped
        expect(nav).toHaveLength(1);
        const filledSection = nav[0];
        expect.assert(filledSection?.type === "section");
        expect(filledSection.title).toBe("filled");
    });

    it("does not include root module as a node (root is section overview)", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            functions: [makeFunction({ name: "f", path: "pkg.f" })],
            submodules: [
                makeModule({
                    name: "sub",
                    path: "pkg.sub",
                    classes: [makeClass({ name: "C", path: "pkg.sub.C" })]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        // Root has content + submodules but should NOT appear as a page/section itself
        const allNodes = flattenNav(nav);
        expect(allNodes.every((n) => n.title !== "pkg")).toBe(true);
    });

    it("builds correct slugs using baseSlug prefix", () => {
        const root = makeModule({
            name: "mylib",
            path: "mylib",
            submodules: [
                makeModule({
                    name: "core",
                    path: "mylib.core",
                    functions: [makeFunction({ name: "init", path: "mylib.core.init" })]
                })
            ]
        });
        const nav = buildNavigation(root, "reference/python");
        // "core" gets wrapped in a section
        const section = nav[0];
        expect.assert(section?.type === "section");
        expect(section.slug).toBe("reference/python/mylib/core");
        // Inner page has same slug + pageId
        expect(section.children[0]).toEqual({
            type: "page",
            title: "core",
            slug: "reference/python/mylib/core",
            pageId: "reference/python/mylib/core.mdx"
        });
    });

    it("handles deeply nested module tree", () => {
        const root = makeModule({
            name: "a",
            path: "a",
            submodules: [
                makeModule({
                    name: "b",
                    path: "a.b",
                    submodules: [
                        makeModule({
                            name: "c",
                            path: "a.b.c",
                            submodules: [
                                makeModule({
                                    name: "d",
                                    path: "a.b.c.d",
                                    classes: [makeClass({ name: "X", path: "a.b.c.d.X" })]
                                })
                            ]
                        })
                    ]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");

        // a -> section(b) -> section(c) -> section(d) -> page(d)
        expect(nav).toHaveLength(1);
        const b = nav[0];
        expect.assert(b?.type === "section");
        expect(b.children).toHaveLength(1);
        const c = b.children[0];
        expect.assert(c?.type === "section");
        expect(c.children).toHaveLength(1);
        const d = c.children[0];
        expect.assert(d?.type === "section");
        expect(d.title).toBe("d");
        expect(d.children).toHaveLength(1);
        expect(d.children[0]?.type).toBe("page");
    });

    it("module with docstring counts as having content", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({
                    name: "documented",
                    path: "pkg.documented",
                    docstring: {
                        summary: "A module.",
                        description: "Documented module.",
                        params: [],
                        raises: [],
                        examples: [],
                        notes: [],
                        warnings: [],
                        returns: undefined
                    }
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        expect(nav).toHaveLength(1);
        // Wrapped in section, but inner page exists (docstring = content)
        const section = nav[0];
        expect.assert(section?.type === "section");
        expect(section.children).toHaveLength(1);
        expect(section.children[0]?.type).toBe("page");
    });

    it("leaf module with content but also submodules becomes section (not page)", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({
                    name: "hybrid",
                    path: "pkg.hybrid",
                    classes: [makeClass({ name: "C", path: "pkg.hybrid.C" })],
                    submodules: [
                        makeModule({
                            name: "child",
                            path: "pkg.hybrid.child",
                            functions: [makeFunction({ name: "f", path: "pkg.hybrid.child.f" })]
                        })
                    ]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        // hybrid has content but also submodules -> section with overview, not page
        expect(nav).toHaveLength(1);
        expect(nav[0]?.type).toBe("section");
    });

    it("multiple sibling submodules create multiple nav items", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({
                    name: "alpha",
                    path: "pkg.alpha",
                    functions: [makeFunction({ name: "f", path: "pkg.alpha.f" })]
                }),
                makeModule({
                    name: "beta",
                    path: "pkg.beta",
                    classes: [makeClass({ name: "C", path: "pkg.beta.C" })]
                })
            ]
        });
        const nav = buildNavigation(root, "ref");
        expect(nav).toHaveLength(2);
        expect(nav.map((n) => n.title)).toEqual(["alpha", "beta"]);
    });
});

describe("buildNavigation (NeMo fixtures)", () => {
    it("package_with_content: stub submodules with empty descendants produce no nav", () => {
        // The fixture has 4 submodules, each with 1 empty stub grandchild
        // Since all grandchildren have no content, no nav items are generated
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const root = NEMO_MODULES["package_with_content"]!;
        const nav = buildNavigation(root, "reference/python");

        // Root has functions/attributes (content), but those go in the overview page
        // Submodules: algorithms, data, distributed, environments — each has 1 empty sub-submodule
        // Empty sub-submodules produce no nav items, so their parent sections have no children
        // and are also skipped
        expect(nav).toEqual([]);
    });

    it("package_submodules_only: builds sections for submodules with leaf content", () => {
        // evals has 2 leaf submodules with no content -> should produce empty nav
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const root = NEMO_MODULES["package_submodules_only"]!;
        const nav = buildNavigation(root, "reference/python");
        // Both submodules are empty stubs, so no nav items
        expect(nav).toEqual([]);
    });

    it("leaf_with_mixed_content: as root, creates no nav (root is section overview)", () => {
        // When used as root, a leaf module's content goes in the section overview
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const mod = NEMO_MODULES["leaf_with_mixed_content"]!;
        const nav = buildNavigation(mod, "reference/python");
        // Leaf with no submodules -> root content goes in overview, no child nav items
        expect(nav).toEqual([]);
    });
});

describe("writeNavigation", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "nav-writer-test-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("writes _navigation.yml to output dir", () => {
        const nav: NavNode[] = [{ type: "page", title: "test", slug: "ref/test", pageId: "ref/test.mdx" }];
        writeNavigation(tmpDir, nav);

        expect(existsSync(join(tmpDir, NAVIGATION_FILENAME))).toBe(true);
    });

    it("YAML content round-trips correctly", () => {
        const nav: NavNode[] = [
            {
                type: "section",
                title: "utils",
                slug: "ref/pkg/utils",
                children: [
                    {
                        type: "page",
                        title: "helpers",
                        slug: "ref/pkg/utils/helpers",
                        pageId: "ref/pkg/utils/helpers.mdx"
                    }
                ]
            }
        ];
        writeNavigation(tmpDir, nav);

        const raw = readFileSync(join(tmpDir, NAVIGATION_FILENAME), "utf-8");
        // Strip the header comment line before parsing
        const yamlContent = raw.split("\n").slice(1).join("\n");
        const parsed = jsYaml.load(yamlContent) as NavNode[];
        expect(parsed).toEqual(nav);
    });

    it("file starts with auto-generated header", () => {
        writeNavigation(tmpDir, []);

        const raw = readFileSync(join(tmpDir, NAVIGATION_FILENAME), "utf-8");
        expect(raw.startsWith("# AUTO-GENERATED by `fern docs md generate`")).toBe(true);
    });

    it("empty navigation writes valid YAML", () => {
        writeNavigation(tmpDir, []);

        const raw = readFileSync(join(tmpDir, NAVIGATION_FILENAME), "utf-8");
        const yamlContent = raw.split("\n").slice(1).join("\n");
        const parsed = jsYaml.load(yamlContent);
        expect(parsed).toEqual([]);
    });

    it("deeply nested tree round-trips preserving hierarchy", () => {
        const nav: NavNode[] = [
            {
                type: "section",
                title: "a",
                slug: "ref/a",
                children: [
                    {
                        type: "section",
                        title: "b",
                        slug: "ref/a/b",
                        children: [
                            {
                                type: "section",
                                title: "c",
                                slug: "ref/a/b/c",
                                children: [
                                    {
                                        type: "page",
                                        title: "leaf",
                                        slug: "ref/a/b/c/leaf",
                                        pageId: "ref/a/b/c/leaf.mdx"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];
        writeNavigation(tmpDir, nav);

        const raw = readFileSync(join(tmpDir, NAVIGATION_FILENAME), "utf-8");
        const yamlContent = raw.split("\n").slice(1).join("\n");
        const parsed = jsYaml.load(yamlContent) as NavNode[];
        expect(parsed).toEqual(nav);
    });

    it("returns absolute file path", () => {
        const result = writeNavigation(tmpDir, []);
        expect(result).toBe(join(tmpDir, NAVIGATION_FILENAME));
    });

    it("creates output directory if it does not exist", () => {
        const nested = join(tmpDir, "deep", "nested", "dir");
        writeNavigation(nested, []);

        expect(existsSync(join(nested, NAVIGATION_FILENAME))).toBe(true);
    });
});
