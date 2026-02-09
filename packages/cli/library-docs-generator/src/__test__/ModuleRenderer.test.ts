import type { FdrAPI } from "@fern-api/fdr-sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { renderAllModulePages, renderModulePage } from "../renderers/ModuleRenderer";
import type { RenderContext } from "../utils/TypeLinkResolver";

const NEMO_MODULES: Record<string, FdrAPI.libraryDocs.PythonModuleIr> = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "nemo-modules.json"), "utf-8")
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyCtx(): RenderContext {
    return { baseSlug: "reference/python", validPaths: new Set(), pathAliases: new Map() };
}

function ctxWithPaths(paths: string[]): RenderContext {
    return { baseSlug: "reference/python", validPaths: new Set(paths), pathAliases: new Map() };
}

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

// ---------------------------------------------------------------------------
// renderModulePage — Frontmatter
// ---------------------------------------------------------------------------

describe("renderModulePage (frontmatter)", () => {
    it("renders frontmatter with slug and title from module path", () => {
        const mod = makeModule({ name: "mymod", path: "pkg.mymod" });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("slug: reference/python/mymod");
        expect(result).toContain("title: pkg.mymod");
    });

    it("builds slug from parentPath when provided", () => {
        const mod = makeModule({ name: "sub", path: "pkg.sub" });
        const result = renderModulePage(mod, emptyCtx(), "pkg");
        expect(result).toContain("slug: reference/python/pkg/sub");
    });

    it("uses module name as root slug component when no parentPath", () => {
        const mod = makeModule({ name: "nemo_rl", path: "nemo_rl" });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("slug: reference/python/nemo_rl");
    });

    it("includes layout: overview in frontmatter", () => {
        const mod = makeModule({});
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("layout: overview");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Module docstring
// ---------------------------------------------------------------------------

describe("renderModulePage (docstring)", () => {
    it("renders module docstring when present", () => {
        const mod = makeModule({
            docstring: {
                summary: "A useful module.",
                description: "This module provides utilities for data processing.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("This module provides utilities for data processing.");
    });

    it("renders nothing for docstring section when docstring is absent", () => {
        const mod = makeModule({ docstring: undefined });
        const result = renderModulePage(mod, emptyCtx());
        // Should still have frontmatter but no description text
        expect(result).toContain("---");
        expect(result).not.toContain("This module");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Submodules section
// ---------------------------------------------------------------------------

describe("renderModulePage (submodules)", () => {
    it("renders Submodules heading for leaf submodules", () => {
        const mod = makeModule({
            submodules: [makeModule({ name: "child", path: "pkg.mymod.child", submodules: [] })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("## Submodules");
        expect(result).not.toContain("## Subpackages");
    });

    it("renders Subpackages heading for submodules with children", () => {
        const mod = makeModule({
            submodules: [
                makeModule({
                    name: "child",
                    path: "pkg.mymod.child",
                    submodules: [makeModule({ name: "grandchild", path: "pkg.mymod.child.grandchild" })]
                })
            ]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("## Subpackages");
        expect(result).not.toContain("## Submodules");
    });

    it("renders both Subpackages and Submodules when mixed", () => {
        const mod = makeModule({
            submodules: [
                makeModule({
                    name: "pkg_child",
                    path: "pkg.mymod.pkg_child",
                    submodules: [makeModule({ name: "deep", path: "pkg.mymod.pkg_child.deep" })]
                }),
                makeModule({ name: "leaf_child", path: "pkg.mymod.leaf_child", submodules: [] })
            ]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("## Subpackages");
        expect(result).toContain("## Submodules");
    });

    it("renders submodule links with full path and correct URL", () => {
        const mod = makeModule({
            submodules: [makeModule({ name: "child", path: "pkg.mymod.child", submodules: [] })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("`pkg.mymod.child`");
        expect(result).toContain("/reference/python/mymod/child");
    });

    it("no submodules section when submodules is empty", () => {
        const mod = makeModule({ submodules: [] });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).not.toContain("## Subpackages");
        expect(result).not.toContain("## Submodules");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Module Contents header
// ---------------------------------------------------------------------------

describe("renderModulePage (contents header)", () => {
    it("renders 'Module Contents' for leaf modules", () => {
        const mod = makeModule({
            classes: [makeClass({})]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("## Module Contents");
    });

    it("renders 'Package Contents' when module has submodules", () => {
        const mod = makeModule({
            submodules: [makeModule({ name: "child", path: "pkg.mymod.child" })],
            classes: [makeClass({})]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("## Package Contents");
    });

    it("no contents section when module has no classes, functions, or attributes", () => {
        const mod = makeModule({});
        const result = renderModulePage(mod, emptyCtx());
        expect(result).not.toContain("## Module Contents");
        expect(result).not.toContain("## Package Contents");
        expect(result).not.toContain("### API");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Classes summary table
// ---------------------------------------------------------------------------

describe("renderModulePage (classes summary)", () => {
    it("renders classes summary table with anchor links", () => {
        const mod = makeModule({
            classes: [
                makeClass({
                    name: "Foo",
                    path: "pkg.mymod.Foo",
                    docstring: {
                        summary: "A Foo class.",
                        description: "Detailed description.",
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
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("### Classes");
        expect(result).toContain("| Name | Description |");
        expect(result).toContain("[`Foo`](#pkg-mymod-Foo)");
        expect(result).toContain("A Foo class.");
    });

    it("renders dash for class with no summary", () => {
        const mod = makeModule({
            classes: [makeClass({ name: "Bar", path: "pkg.mymod.Bar", docstring: undefined })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("[`Bar`](#pkg-mymod-Bar) | - |");
    });

    it("escapes pipe characters in class summary", () => {
        const mod = makeModule({
            classes: [
                makeClass({
                    name: "X",
                    path: "pkg.mymod.X",
                    docstring: {
                        summary: "A | B union.",
                        description: undefined,
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
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("A \\| B union.");
    });

    it("no classes section when no classes", () => {
        const mod = makeModule({ functions: [makeFunction({})] });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).not.toContain("### Classes");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Functions summary table
// ---------------------------------------------------------------------------

describe("renderModulePage (functions summary)", () => {
    it("renders functions summary table with anchor links", () => {
        const mod = makeModule({
            functions: [
                makeFunction({
                    name: "do_stuff",
                    path: "pkg.mymod.do_stuff",
                    docstring: {
                        summary: "Does important stuff.",
                        description: "Full description.",
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
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("### Functions");
        expect(result).toContain("[`do_stuff`](#pkg-mymod-do_stuff)");
        expect(result).toContain("Does important stuff.");
    });

    it("renders dash for function with no summary", () => {
        const mod = makeModule({
            functions: [makeFunction({ name: "helper", path: "pkg.mymod.helper", docstring: undefined })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("[`helper`](#pkg-mymod-helper) | - |");
    });

    it("no functions section when no functions", () => {
        const mod = makeModule({ classes: [makeClass({})] });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).not.toContain("### Functions");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Data/attributes summary
// ---------------------------------------------------------------------------

describe("renderModulePage (data summary)", () => {
    it("renders data section with anchor links", () => {
        const mod = makeModule({
            attributes: [makeAttr({ name: "VERSION", path: "pkg.mymod.VERSION" })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("### Data");
        expect(result).toContain("[`VERSION`](#pkg-mymod-VERSION)");
    });

    it("no data section when no attributes", () => {
        const mod = makeModule({ classes: [makeClass({})] });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).not.toContain("### Data");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — API section (detailed renderings)
// ---------------------------------------------------------------------------

describe("renderModulePage (API detail)", () => {
    it("renders API heading", () => {
        const mod = makeModule({
            classes: [makeClass({})]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("### API");
    });

    it("renders class details with Anchor and CodeBlock", () => {
        const mod = makeModule({
            classes: [makeClass({ name: "Foo", path: "pkg.mymod.Foo" })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-mymod-Foo">');
        expect(result).toContain("class pkg.mymod.Foo");
    });

    it("renders function details with Anchor and CodeBlock", () => {
        const mod = makeModule({
            functions: [
                makeFunction({
                    name: "compute",
                    path: "pkg.mymod.compute",
                    parameters: [
                        {
                            name: "x",
                            kind: "POSITIONAL" as FdrAPI.libraryDocs.PythonParameterKind,
                            typeInfo: { display: "int", resolvedPath: "int", basePath: undefined },
                            default: undefined,
                            description: undefined
                        }
                    ]
                })
            ]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-mymod-compute">');
        expect(result).toContain("pkg.mymod.compute");
        expect(result).toContain("x: int");
    });

    it("renders attribute details with Anchor, type, and value", () => {
        const mod = makeModule({
            attributes: [
                makeAttr({
                    name: "VERSION",
                    path: "pkg.mymod.VERSION",
                    typeInfo: { display: "str", resolvedPath: "str", basePath: undefined },
                    value: "'1.0.0'"
                })
            ]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-mymod-VERSION">');
        expect(result).toContain("pkg.mymod.VERSION: str = '1.0.0'");
    });

    it("truncates long attribute values", () => {
        const mod = makeModule({
            attributes: [
                makeAttr({
                    name: "DATA",
                    path: "pkg.mymod.DATA",
                    value: "a".repeat(100)
                })
            ]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("...");
        expect(result).not.toContain("a".repeat(100));
    });

    it("renders attribute docstring in Indent", () => {
        const mod = makeModule({
            attributes: [
                makeAttr({
                    name: "LIMIT",
                    path: "pkg.mymod.LIMIT",
                    docstring: {
                        summary: "Max limit.",
                        description: "The maximum allowed limit.",
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
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain("<Indent>");
        expect(result).toContain("The maximum allowed limit.");
        expect(result).toContain("</Indent>");
    });

    it("renders attribute with no docstring — no Indent", () => {
        const mod = makeModule({
            attributes: [makeAttr({ name: "X", path: "pkg.mymod.X", docstring: undefined })]
        });
        const result = renderModulePage(mod, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-mymod-X">');
        // Indent only appears for attributes with docstrings
        // biome-ignore lint/style/noNonNullAssertion: split always has index 1
        const attrSection = result.split("### API")[1]!;
        // The attribute detail should not have <Indent> since no docstring
        const attrAnchorIdx = attrSection.indexOf('id="pkg-mymod-X"');
        const afterAnchor = attrSection.slice(attrAnchorIdx);
        expect(afterAnchor).not.toContain("<Indent>");
    });

    it("extracts type links from attribute type", () => {
        const mod = makeModule({
            attributes: [
                makeAttr({
                    name: "cfg",
                    path: "pkg.mymod.cfg",
                    typeInfo: {
                        display: "pkg.sub.Config",
                        resolvedPath: "pkg.sub.Config",
                        basePath: "pkg.sub.Config"
                    }
                })
            ]
        });
        const ctx = ctxWithPaths(["pkg.sub.Config"]);
        const result = renderModulePage(mod, ctx);
        expect(result).toContain("links={");
        expect(result).toContain("pkg.sub.Config");
    });
});

// ---------------------------------------------------------------------------
// renderModulePage — Section ordering
// ---------------------------------------------------------------------------

describe("renderModulePage (ordering)", () => {
    it("renders sections in correct order: frontmatter > docstring > submodules > contents > API", () => {
        const mod = makeModule({
            name: "mymod",
            path: "pkg.mymod",
            docstring: {
                summary: "Summary.",
                description: "Full description here.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            },
            submodules: [makeModule({ name: "child", path: "pkg.mymod.child" })],
            classes: [makeClass({ name: "Foo", path: "pkg.mymod.Foo" })],
            functions: [makeFunction({ name: "bar", path: "pkg.mymod.bar" })]
        });
        const result = renderModulePage(mod, emptyCtx());

        const frontmatterIdx = result.indexOf("---");
        const docstringIdx = result.indexOf("Full description here.");
        const submodulesIdx = result.indexOf("## Submodules");
        const contentsIdx = result.indexOf("## Package Contents");
        const classesIdx = result.indexOf("### Classes");
        const functionsIdx = result.indexOf("### Functions");
        const apiIdx = result.indexOf("### API");

        expect(frontmatterIdx).toBeLessThan(docstringIdx);
        expect(docstringIdx).toBeLessThan(submodulesIdx);
        expect(submodulesIdx).toBeLessThan(contentsIdx);
        expect(contentsIdx).toBeLessThan(classesIdx);
        expect(classesIdx).toBeLessThan(functionsIdx);
        expect(functionsIdx).toBeLessThan(apiIdx);
    });

    it("renders classes before functions before attributes in API section", () => {
        const mod = makeModule({
            classes: [makeClass({ name: "Cls", path: "pkg.mymod.Cls" })],
            functions: [makeFunction({ name: "func", path: "pkg.mymod.func" })],
            attributes: [makeAttr({ name: "ATTR", path: "pkg.mymod.ATTR" })]
        });
        const result = renderModulePage(mod, emptyCtx());

        const classIdx = result.indexOf('id="pkg-mymod-Cls"');
        const funcIdx = result.indexOf('id="pkg-mymod-func"');
        const attrIdx = result.indexOf('id="pkg-mymod-ATTR"');

        expect(classIdx).toBeLessThan(funcIdx);
        expect(funcIdx).toBeLessThan(attrIdx);
    });
});

// ---------------------------------------------------------------------------
// renderAllModulePages
// ---------------------------------------------------------------------------

describe("renderAllModulePages", () => {
    it("generates pages for root and all submodules", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            classes: [makeClass({ name: "Root", path: "pkg.Root" })],
            submodules: [
                makeModule({
                    name: "sub",
                    path: "pkg.sub",
                    classes: [makeClass({ name: "Sub", path: "pkg.sub.Sub" })]
                })
            ]
        });
        const pages = renderAllModulePages(root, emptyCtx());

        expect(Object.keys(pages)).toContain("reference/python/pkg.mdx");
        expect(Object.keys(pages)).toContain("reference/python/pkg/sub.mdx");
    });

    it("generates pages for deeply nested modules", () => {
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
                            classes: [makeClass({ name: "Deep", path: "a.b.c.Deep" })]
                        })
                    ]
                })
            ]
        });
        const pages = renderAllModulePages(root, emptyCtx());

        expect(Object.keys(pages)).toContain("reference/python/a.mdx");
        expect(Object.keys(pages)).toContain("reference/python/a/b.mdx");
        expect(Object.keys(pages)).toContain("reference/python/a/b/c.mdx");
    });

    it("skips empty modules with no content and no submodules", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({ name: "empty", path: "pkg.empty" }),
                makeModule({
                    name: "filled",
                    path: "pkg.filled",
                    functions: [makeFunction({ name: "f", path: "pkg.filled.f" })]
                })
            ]
        });
        const pages = renderAllModulePages(root, emptyCtx());

        // Root has submodules, so it gets a page
        expect(Object.keys(pages)).toContain("reference/python/pkg.mdx");
        // Empty module with no content and no submodules: skipped
        expect(Object.keys(pages)).not.toContain("reference/python/pkg/empty.mdx");
        // Filled module: included
        expect(Object.keys(pages)).toContain("reference/python/pkg/filled.mdx");
    });

    it("generates page for module with only docstring", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            docstring: {
                summary: "Has a docstring.",
                description: "This module has documentation.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const pages = renderAllModulePages(root, emptyCtx());
        expect(Object.keys(pages)).toContain("reference/python/pkg.mdx");
        expect(pages["reference/python/pkg.mdx"]).toContain("This module has documentation.");
    });

    it("page content contains correct frontmatter slug", () => {
        const root = makeModule({
            name: "pkg",
            path: "pkg",
            submodules: [
                makeModule({
                    name: "sub",
                    path: "pkg.sub",
                    functions: [makeFunction({ name: "f", path: "pkg.sub.f" })]
                })
            ]
        });
        const pages = renderAllModulePages(root, emptyCtx());

        expect(pages["reference/python/pkg.mdx"]).toContain("slug: reference/python/pkg");
        expect(pages["reference/python/pkg/sub.mdx"]).toContain("slug: reference/python/pkg/sub");
    });
});

// ---------------------------------------------------------------------------
// NeMo IR fixture tests
// ---------------------------------------------------------------------------

describe("renderModulePage (NeMo fixtures)", () => {
    it("leaf_with_mixed_content: renders classes, functions, and attributes", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const mod = NEMO_MODULES["leaf_with_mixed_content"]!;
        const result = renderModulePage(mod, emptyCtx(), "nemo_rl/algorithms");

        // Frontmatter
        expect(result).toContain("slug: reference/python/nemo_rl/algorithms/distillation");
        expect(result).toContain("title: nemo_rl.algorithms.distillation");

        // Module Contents (leaf, no submodules)
        expect(result).toContain("## Module Contents");

        // Classes summary table
        expect(result).toContain("### Classes");
        expect(result).toContain("[`DistillationConfig`](#nemo_rl-algorithms-distillation-DistillationConfig)");
        expect(result).toContain("[`DistillationSaveState`](#nemo_rl-algorithms-distillation-DistillationSaveState)");

        // Functions summary table
        expect(result).toContain("### Functions");
        expect(result).toContain("[`_default_distillation_save_state`]");
        expect(result).toContain("[`check_vocab_equality`]");

        // Data summary
        expect(result).toContain("### Data");
        expect(result).toContain("[`TokenizerType`]");

        // API detail section
        expect(result).toContain("### API");

        // Class detail anchors
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-distillation-DistillationConfig">');
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-distillation-DistillationSaveState">');

        // Function detail anchors
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-distillation-_default_distillation_save_state">');
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-distillation-check_vocab_equality">');

        // Attribute detail anchor
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-distillation-TokenizerType">');
    });

    it("leaf_attributes_only: renders only data section", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const mod = NEMO_MODULES["leaf_attributes_only"]!;
        const result = renderModulePage(mod, emptyCtx(), "nemo_rl");

        expect(result).toContain("slug: reference/python/nemo_rl/package_info");
        expect(result).toContain("title: nemo_rl.package_info");

        // No classes or functions sections
        expect(result).not.toContain("### Classes");
        expect(result).not.toContain("### Functions");

        // Data section
        expect(result).toContain("### Data");
        expect(result).toContain("[`MAJOR`]");
        expect(result).toContain("[`MINOR`]");
        expect(result).toContain("[`PATCH`]");

        // Detail: attribute values (values are bare numbers, not quoted strings)
        expect(result).toContain("nemo_rl.package_info.MAJOR");
        expect(result).toContain("= 0");
    });

    it("package_with_content: renders submodules and Package Contents", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const mod = NEMO_MODULES["package_with_content"]!;
        const result = renderModulePage(mod, emptyCtx());

        expect(result).toContain("slug: reference/python/nemo_rl");
        expect(result).toContain("title: nemo_rl");

        // All submodules have children -> Subpackages only
        expect(result).toContain("## Subpackages");
        expect(result).toContain("`nemo_rl.algorithms`");
        expect(result).toContain("`nemo_rl.data`");

        // Has direct content -> Package Contents
        expect(result).toContain("## Package Contents");

        // Functions summary
        expect(result).toContain("### Functions");
        expect(result).toContain("[`_check_container_fingerprint`]");
    });

    it("module_with_docstring: renders docstring text", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const mod = NEMO_MODULES["module_with_docstring"]!;
        const result = renderModulePage(mod, emptyCtx(), "nemo_rl/data/datasets/eval_datasets");

        expect(result).toContain("title: nemo_rl.data.datasets.eval_datasets.aime");

        // Should have docstring text
        const docstring = mod.docstring;
        expect(docstring).toBeDefined();
        if (docstring?.description) {
            expect(result).toContain(docstring.description.slice(0, 30));
        }

        // Has class
        expect(result).toContain("### Classes");
        expect(result).toContain("[`AIMEDataset`]");
    });

    it("package_submodules_only: renders submodules but no contents section", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const mod = NEMO_MODULES["package_submodules_only"]!;
        const result = renderModulePage(mod, emptyCtx(), "nemo_rl");

        expect(result).toContain("slug: reference/python/nemo_rl/evals");
        expect(result).toContain("title: nemo_rl.evals");

        // Has submodules (both are leaf nodes)
        expect(result).toContain("## Submodules");
        expect(result).toContain("`nemo_rl.evals.answer_parsing`");
        expect(result).toContain("`nemo_rl.evals.eval`");

        // No direct content -> no Module/Package Contents section
        expect(result).not.toContain("## Module Contents");
        expect(result).not.toContain("## Package Contents");
        expect(result).not.toContain("### API");
    });
});

describe("renderAllModulePages (NeMo fixtures)", () => {
    it("package_with_content: generates pages for root and all stub submodules", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const root = NEMO_MODULES["package_with_content"]!;
        const pages = renderAllModulePages(root, emptyCtx());

        // Root page
        expect(Object.keys(pages)).toContain("reference/python/nemo_rl.mdx");

        // Submodule pages (each has submodules so should get a page)
        expect(Object.keys(pages)).toContain("reference/python/nemo_rl/algorithms.mdx");
        expect(Object.keys(pages)).toContain("reference/python/nemo_rl/data.mdx");
    });
});
