import type { FdrAPI } from "@fern-api/fdr-sdk";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generate } from "../PythonDocsGenerator";

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

function makeClass(overrides: Partial<FdrAPI.libraryDocs.PythonClassIr>): FdrAPI.libraryDocs.PythonClassIr {
    return {
        name: "MyClass",
        path: "mod.MyClass",
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

function makeIr(rootModule: FdrAPI.libraryDocs.PythonModuleIr): FdrAPI.libraryDocs.PythonLibraryDocsIr {
    return { rootModule } as FdrAPI.libraryDocs.PythonLibraryDocsIr;
}

describe("generate()", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "gen-test-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("generates a single page for root with content and no submodules", () => {
        const ir = makeIr(
            makeModule({
                name: "mylib",
                path: "mylib",
                functions: [makeFunction({ name: "init", path: "mylib.init" })]
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "My Lib" });

        expect(result.pageCount).toBe(1);
        expect(result.rootPageId).toBe("ref/mylib.mdx");
        expect(result.navigation).toEqual([]);
        expect(existsSync(join(tmpDir, "ref/mylib.mdx"))).toBe(true);
    });

    it("generates no pages for empty root module", () => {
        const ir = makeIr(makeModule({ name: "empty", path: "empty" }));

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Empty" });

        expect(result.pageCount).toBe(0);
        // Only the _navigation.yml is written (no MDX pages)
        expect(result.writtenFiles.filter((f) => f.endsWith(".mdx"))).toEqual([]);
        expect(result.navigation).toEqual([]);
    });

    it("rootPageId uses slug + root module name", () => {
        const ir = makeIr(
            makeModule({
                name: "nemo_rl",
                path: "nemo_rl",
                functions: [makeFunction({ name: "f", path: "nemo_rl.f" })]
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "reference/python", title: "Ref" });

        expect(result.rootPageId).toBe("reference/python/nemo_rl.mdx");
    });

    it("writes files to correct directory structure", () => {
        const ir = makeIr(
            makeModule({
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
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "docs", title: "Pkg" });

        expect(result.pageCount).toBe(2);
        expect(existsSync(join(tmpDir, "docs/pkg.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "docs/pkg/sub.mdx"))).toBe(true);
    });

    it("writtenFiles contains absolute paths", () => {
        const ir = makeIr(
            makeModule({
                name: "lib",
                path: "lib",
                attributes: [makeAttr({ name: "V", path: "lib.V" })]
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Lib" });

        for (const f of result.writtenFiles) {
            expect(f).toMatch(/^\//); // absolute path
            expect(existsSync(f)).toBe(true);
        }
    });

    it("every page starts with frontmatter", () => {
        const ir = makeIr(
            makeModule({
                name: "pkg",
                path: "pkg",
                submodules: [
                    makeModule({
                        name: "a",
                        path: "pkg.a",
                        functions: [makeFunction({ name: "f", path: "pkg.a.f" })]
                    }),
                    makeModule({
                        name: "b",
                        path: "pkg.b",
                        attributes: [makeAttr({ name: "X", path: "pkg.b.X" })]
                    })
                ]
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Pkg" });

        const mdxFiles = result.writtenFiles.filter((f) => f.endsWith(".mdx"));
        for (const filePath of mdxFiles) {
            const content = readFileSync(filePath, "utf-8");
            expect(content).toMatch(/^---\n/);
            expect(content).toMatch(/\nslug:/);
            expect(content).toMatch(/\ntitle:/);
        }
    });

    it("root page with submodules has Package Contents header", () => {
        const ir = makeIr(
            makeModule({
                name: "pkg",
                path: "pkg",
                functions: [makeFunction({ name: "f", path: "pkg.f" })],
                submodules: [
                    makeModule({
                        name: "sub",
                        path: "pkg.sub",
                        // biome-ignore lint/suspicious/noExplicitAny: partial docstring for test
                        docstring: { summary: "A sub." } as any
                    })
                ]
            })
        );

        generate({ ir, outputDir: tmpDir, slug: "ref", title: "Pkg" });
        const content = readFileSync(join(tmpDir, "ref/pkg.mdx"), "utf-8");

        expect(content).toContain("## Package Contents");
    });

    it("leaf page with no submodules has Module Contents header", () => {
        const ir = makeIr(
            makeModule({
                name: "pkg",
                path: "pkg",
                submodules: [
                    makeModule({
                        name: "leaf",
                        path: "pkg.leaf",
                        classes: [makeClass({ name: "C", path: "pkg.leaf.C" })]
                    })
                ]
            })
        );

        generate({ ir, outputDir: tmpDir, slug: "ref", title: "Pkg" });
        const content = readFileSync(join(tmpDir, "ref/pkg/leaf.mdx"), "utf-8");

        expect(content).toContain("## Module Contents");
    });

    it("builds navigation for submodules", () => {
        const ir = makeIr(
            makeModule({
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
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Pkg" });

        expect(result.navigation).toHaveLength(2);
        expect(result.navigation[0]?.title).toBe("alpha");
        expect(result.navigation[1]?.title).toBe("beta");
    });

    it("skips empty submodules from navigation", () => {
        const ir = makeIr(
            makeModule({
                name: "pkg",
                path: "pkg",
                functions: [makeFunction({ name: "f", path: "pkg.f" })],
                submodules: [
                    makeModule({ name: "empty", path: "pkg.empty" }),
                    makeModule({
                        name: "filled",
                        path: "pkg.filled",
                        attributes: [makeAttr({ name: "X", path: "pkg.filled.X" })]
                    })
                ]
            })
        );

        const result = generate({ ir, outputDir: tmpDir, slug: "ref", title: "Pkg" });

        // empty module still gets a page (hasSubmodules=false, hasContent=false → no page)
        // Actually empty has no content and no submodules → no page
        // filled gets a page
        // Navigation should only include filled
        expect(result.navigation).toHaveLength(1);
        expect(result.navigation[0]?.title).toBe("filled");
    });

    it("resolves cross-module type links in signatures", () => {
        const ir = makeIr(
            makeModule({
                name: "pkg",
                path: "pkg",
                submodules: [
                    makeModule({
                        name: "types",
                        path: "pkg.types",
                        classes: [makeClass({ name: "Config", path: "pkg.types.Config" })]
                    }),
                    makeModule({
                        name: "core",
                        path: "pkg.core",
                        functions: [
                            makeFunction({
                                name: "run",
                                path: "pkg.core.run",
                                parameters: [
                                    {
                                        name: "config",
                                        typeInfo: {
                                            display: "pkg.types.Config",
                                            resolvedPath: "pkg.types.Config",
                                            basePath: "pkg.types.Config"
                                        },
                                        default: undefined,
                                        description: undefined,
                                        kind: "POSITIONAL" as const
                                    } satisfies FdrAPI.libraryDocs.PythonParameterIr
                                ]
                            })
                        ]
                    })
                ]
            })
        );

        generate({ ir, outputDir: tmpDir, slug: "ref", title: "Pkg" });
        const corePage = readFileSync(join(tmpDir, "ref/pkg/core.mdx"), "utf-8");

        // The signature should have a CodeBlock with links to pkg.types.Config
        expect(corePage).toContain("pkg.types.Config");
        expect(corePage).toContain("<CodeBlock");
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

        const result = generate({ ir: makeIr(root), outputDir: tmpDir, slug: "ref", title: "Deep" });

        // 4 pages: a (submodules), b (submodules), c (submodules), deep (content)
        expect(result.pageCount).toBe(4);
        expect(existsSync(join(tmpDir, "ref/a.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "ref/a/b.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "ref/a/b/c.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "ref/a/b/c/deep.mdx"))).toBe(true);
    });
});
