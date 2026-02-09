import type { FdrAPI } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";
import {
    buildTypeLinkData,
    extractLinksFromTypes,
    formatSignatureMultiline,
    getModulePath,
    getTypeDisplay,
    getTypePathForSignature,
    linkTypeInfo,
    type RenderContext,
    renderCodeBlockWithLinks,
    type SignatureParam
} from "../utils/TypeLinkResolver.js";

// ============================================================================
// Test Helpers
// ============================================================================

function makeTypeInfo(overrides: Partial<FdrAPI.libraryDocs.TypeInfo> = {}): FdrAPI.libraryDocs.TypeInfo {
    return {
        display: overrides.display,
        resolvedPath: overrides.resolvedPath,
        basePath: overrides.basePath
    };
}

function makeParam(name: string, typeInfo?: FdrAPI.libraryDocs.TypeInfo): FdrAPI.libraryDocs.PythonParameterIr {
    return {
        name,
        typeInfo,
        default: undefined,
        description: undefined,
        kind: "POSITIONAL" as FdrAPI.libraryDocs.PythonParameterKind
    };
}

function makeFunction(
    name: string,
    path: string,
    params: FdrAPI.libraryDocs.PythonParameterIr[] = [],
    returnTypeInfo?: FdrAPI.libraryDocs.TypeInfo
): FdrAPI.libraryDocs.PythonFunctionIr {
    return {
        name,
        path,
        signature: `def ${name}()`,
        docstring: undefined,
        parameters: params,
        returnTypeInfo,
        isAsync: false,
        decorators: [],
        isClassmethod: false,
        isStaticmethod: false,
        isProperty: false
    };
}

function makeClass(
    name: string,
    path: string,
    overrides: Partial<FdrAPI.libraryDocs.PythonClassIr> = {}
): FdrAPI.libraryDocs.PythonClassIr {
    return {
        name,
        path,
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
    };
}

function makeModule(
    name: string,
    path: string,
    overrides: Partial<FdrAPI.libraryDocs.PythonModuleIr> = {}
): FdrAPI.libraryDocs.PythonModuleIr {
    return {
        name,
        path,
        docstring: undefined,
        classes: [],
        functions: [],
        attributes: [],
        submodules: [],
        ...overrides
    };
}

function makeIr(rootModule: FdrAPI.libraryDocs.PythonModuleIr): FdrAPI.libraryDocs.PythonLibraryDocsIr {
    return {
        metadata: {
            packageName: "test-pkg",
            language: "python",
            sourceUrl: undefined,
            branch: undefined,
            version: undefined
        },
        rootModule
    };
}

function makeCtx(overrides: Partial<RenderContext> = {}): RenderContext {
    return {
        baseSlug: "reference",
        validPaths: new Set<string>(),
        pathAliases: new Map<string, string>(),
        ...overrides
    };
}

// ============================================================================
// buildTypeLinkData
// ============================================================================

describe("buildTypeLinkData", () => {
    it("should collect module paths", () => {
        const ir = makeIr(
            makeModule("pkg", "pkg", {
                submodules: [makeModule("sub", "pkg.sub")]
            })
        );

        const { validPaths } = buildTypeLinkData(ir);
        expect(validPaths.has("pkg")).toBe(true);
        expect(validPaths.has("pkg.sub")).toBe(true);
    });

    it("should collect class paths", () => {
        const ir = makeIr(
            makeModule("pkg", "pkg", {
                classes: [makeClass("Foo", "pkg.Foo"), makeClass("Bar", "pkg.Bar")]
            })
        );

        const { validPaths } = buildTypeLinkData(ir);
        expect(validPaths.has("pkg.Foo")).toBe(true);
        expect(validPaths.has("pkg.Bar")).toBe(true);
    });

    it("should collect function paths", () => {
        const ir = makeIr(
            makeModule("pkg", "pkg", {
                functions: [makeFunction("do_stuff", "pkg.do_stuff")]
            })
        );

        const { validPaths } = buildTypeLinkData(ir);
        expect(validPaths.has("pkg.do_stuff")).toBe(true);
    });

    it("should collect attribute paths", () => {
        const ir = makeIr(
            makeModule("pkg", "pkg", {
                attributes: [
                    {
                        name: "VERSION",
                        path: "pkg.VERSION",
                        typeInfo: undefined,
                        value: '"1.0"',
                        docstring: undefined
                    }
                ]
            })
        );

        const { validPaths } = buildTypeLinkData(ir);
        expect(validPaths.has("pkg.VERSION")).toBe(true);
    });

    it("should collect method paths inside classes", () => {
        const ir = makeIr(
            makeModule("pkg", "pkg", {
                classes: [
                    makeClass("Foo", "pkg.Foo", {
                        methods: [makeFunction("run", "pkg.Foo.run")]
                    })
                ]
            })
        );

        const { validPaths } = buildTypeLinkData(ir);
        expect(validPaths.has("pkg.Foo.run")).toBe(true);
    });

    it("should build path aliases from TypeInfo where resolvedPath != basePath", () => {
        const typeInfo = makeTypeInfo({
            display: "List[Foo]",
            resolvedPath: "pkg.List[pkg.sub.Foo]",
            basePath: "pkg.sub.Foo"
        });

        const ir = makeIr(
            makeModule("pkg", "pkg", {
                functions: [makeFunction("fn", "pkg.fn", [makeParam("x", typeInfo)])]
            })
        );

        const { pathAliases } = buildTypeLinkData(ir);
        expect(pathAliases.get("pkg.List[pkg.sub.Foo]")).toBe("pkg.sub.Foo");
    });

    it("should not create alias when resolvedPath equals basePath", () => {
        const typeInfo = makeTypeInfo({
            display: "Foo",
            resolvedPath: "pkg.Foo",
            basePath: "pkg.Foo"
        });

        const ir = makeIr(
            makeModule("pkg", "pkg", {
                functions: [makeFunction("fn", "pkg.fn", [makeParam("x", typeInfo)])]
            })
        );

        const { pathAliases } = buildTypeLinkData(ir);
        expect(pathAliases.size).toBe(0);
    });

    it("should collect aliases from return types", () => {
        const returnType = makeTypeInfo({
            resolvedPath: "pkg.Response",
            basePath: "pkg.http.Response"
        });

        const ir = makeIr(
            makeModule("pkg", "pkg", {
                functions: [makeFunction("fn", "pkg.fn", [], returnType)]
            })
        );

        const { pathAliases } = buildTypeLinkData(ir);
        expect(pathAliases.get("pkg.Response")).toBe("pkg.http.Response");
    });

    it("should collect aliases from base classes", () => {
        const baseTypeInfo = makeTypeInfo({
            resolvedPath: "pkg.Base",
            basePath: "pkg.core.Base"
        });

        const ir = makeIr(
            makeModule("pkg", "pkg", {
                classes: [
                    makeClass("Child", "pkg.Child", {
                        bases: [{ name: "Base", typeInfo: baseTypeInfo }]
                    })
                ]
            })
        );

        const { pathAliases } = buildTypeLinkData(ir);
        expect(pathAliases.get("pkg.Base")).toBe("pkg.core.Base");
    });

    it("should collect aliases from class attributes", () => {
        const attrType = makeTypeInfo({
            resolvedPath: "pkg.Config",
            basePath: "pkg.settings.Config"
        });

        const ir = makeIr(
            makeModule("pkg", "pkg", {
                classes: [
                    makeClass("App", "pkg.App", {
                        attributes: [
                            {
                                name: "config",
                                path: "pkg.App.config",
                                typeInfo: attrType,
                                value: undefined,
                                docstring: undefined
                            }
                        ]
                    })
                ]
            })
        );

        const { pathAliases } = buildTypeLinkData(ir);
        expect(pathAliases.get("pkg.Config")).toBe("pkg.settings.Config");
    });

    it("should traverse deeply nested submodules", () => {
        const ir = makeIr(
            makeModule("a", "a", {
                submodules: [
                    makeModule("b", "a.b", {
                        submodules: [
                            makeModule("c", "a.b.c", {
                                classes: [makeClass("Deep", "a.b.c.Deep")]
                            })
                        ]
                    })
                ]
            })
        );

        const { validPaths } = buildTypeLinkData(ir);
        expect(validPaths.has("a")).toBe(true);
        expect(validPaths.has("a.b")).toBe(true);
        expect(validPaths.has("a.b.c")).toBe(true);
        expect(validPaths.has("a.b.c.Deep")).toBe(true);
    });
});

// ============================================================================
// getModulePath
// ============================================================================

describe("getModulePath", () => {
    it("should return parent module path", () => {
        expect(getModulePath("nemo_rl.algorithms.dpo.SomeClass")).toBe("nemo_rl.algorithms.dpo");
    });

    it("should return empty string for single-segment path", () => {
        expect(getModulePath("pkg")).toBe("");
    });

    it("should handle two-segment path", () => {
        expect(getModulePath("pkg.Foo")).toBe("pkg");
    });
});

// ============================================================================
// extractLinksFromTypes
// ============================================================================

describe("extractLinksFromTypes", () => {
    it("should extract links for valid qualified paths", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.models.Response"])
        });

        const links = extractLinksFromTypes(["pkg.models.Response"], ctx);
        expect(links["pkg.models.Response"]).toBe("/reference/pkg/models#pkg-models-Response");
    });

    it("should skip unrecognized paths", () => {
        const ctx = makeCtx({ validPaths: new Set(["pkg.Foo"]) });
        const links = extractLinksFromTypes(["unknown.module.Class"], ctx);
        expect(Object.keys(links)).toHaveLength(0);
    });

    it("should skip single-segment identifiers", () => {
        const ctx = makeCtx({ validPaths: new Set(["str"]) });
        const links = extractLinksFromTypes(["str"], ctx);
        expect(Object.keys(links)).toHaveLength(0);
    });

    it("should extract multiple links from one type string", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.Foo", "pkg.Bar"])
        });

        const links = extractLinksFromTypes(["Union[pkg.Foo, pkg.Bar]"], ctx);
        expect(links["pkg.Foo"]).toBeDefined();
        expect(links["pkg.Bar"]).toBeDefined();
    });

    it("should resolve aliases for re-exported types", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.sub.Foo"]),
            pathAliases: new Map([["pkg.Foo", "pkg.sub.Foo"]])
        });

        const links = extractLinksFromTypes(["pkg.Foo"], ctx);
        // The key is the original (aliased) path, the URL uses the actual definition path
        expect(links["pkg.Foo"]).toBe("/reference/pkg/sub#pkg-sub-Foo");
    });

    it("should skip empty type strings", () => {
        const ctx = makeCtx({ validPaths: new Set(["pkg.Foo"]) });
        const links = extractLinksFromTypes(["", "pkg.Foo"], ctx);
        expect(Object.keys(links)).toHaveLength(1);
        expect(links["pkg.Foo"]).toBeDefined();
    });

    it("should not duplicate links for the same path", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.Foo"])
        });

        const links = extractLinksFromTypes(["pkg.Foo", "Optional[pkg.Foo]"], ctx);
        expect(Object.keys(links)).toHaveLength(1);
    });

    it("should use same-page anchors when currentModulePath matches", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.models.Response"])
        });

        const links = extractLinksFromTypes(["pkg.models.Response"], ctx, "pkg.models");
        expect(links["pkg.models.Response"]).toBe("#pkg-models-Response");
    });

    it("should use cross-page links when currentModulePath differs", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.models.Response"])
        });

        const links = extractLinksFromTypes(["pkg.models.Response"], ctx, "pkg.other");
        expect(links["pkg.models.Response"]).toBe("/reference/pkg/models#pkg-models-Response");
    });

    it("should handle multiple type strings across array items", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.Foo", "pkg.Bar", "pkg.Baz"])
        });

        const links = extractLinksFromTypes(["pkg.Foo", "pkg.Bar", "pkg.Baz"], ctx);
        expect(Object.keys(links)).toHaveLength(3);
    });
});

// ============================================================================
// getTypeDisplay
// ============================================================================

describe("getTypeDisplay", () => {
    it("should return display when available", () => {
        const ti = makeTypeInfo({ display: "List[str]" });
        expect(getTypeDisplay(ti)).toBe("List[str]");
    });

    it("should fall back to resolvedPath", () => {
        const ti = makeTypeInfo({ resolvedPath: "typing.List[str]" });
        expect(getTypeDisplay(ti)).toBe("typing.List[str]");
    });

    it("should prefer display over resolvedPath", () => {
        const ti = makeTypeInfo({ display: "List[str]", resolvedPath: "typing.List[str]" });
        expect(getTypeDisplay(ti)).toBe("List[str]");
    });

    it("should return empty string for undefined", () => {
        expect(getTypeDisplay(undefined)).toBe("");
    });

    it("should return empty string when both are undefined", () => {
        const ti = makeTypeInfo({});
        expect(getTypeDisplay(ti)).toBe("");
    });
});

// ============================================================================
// getTypePathForSignature
// ============================================================================

describe("getTypePathForSignature", () => {
    it("should return resolvedPath when available", () => {
        const ti = makeTypeInfo({ resolvedPath: "typing.List[str]" });
        expect(getTypePathForSignature(ti)).toBe("typing.List[str]");
    });

    it("should fall back to display", () => {
        const ti = makeTypeInfo({ display: "List[str]" });
        expect(getTypePathForSignature(ti)).toBe("List[str]");
    });

    it("should prefer resolvedPath over display", () => {
        const ti = makeTypeInfo({ display: "List[str]", resolvedPath: "typing.List[str]" });
        expect(getTypePathForSignature(ti)).toBe("typing.List[str]");
    });

    it("should return empty string for undefined", () => {
        expect(getTypePathForSignature(undefined)).toBe("");
    });
});

// ============================================================================
// linkTypeInfo
// ============================================================================

describe("linkTypeInfo", () => {
    it("should return dash for undefined typeInfo", () => {
        const ctx = makeCtx();
        expect(linkTypeInfo(undefined, ctx)).toBe("-");
    });

    it("should return dash when no display or resolvedPath", () => {
        const ctx = makeCtx();
        const ti = makeTypeInfo({});
        expect(linkTypeInfo(ti, ctx)).toBe("-");
    });

    it("should return markdown link when basePath is valid", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.models.Response"])
        });
        const ti = makeTypeInfo({
            display: "Response",
            basePath: "pkg.models.Response"
        });

        expect(linkTypeInfo(ti, ctx)).toBe("[Response](/reference/pkg/models#pkg-models-Response)");
    });

    it("should return backtick-wrapped text when basePath is not in validPaths", () => {
        const ctx = makeCtx({ validPaths: new Set() });
        const ti = makeTypeInfo({
            display: "ExternalType",
            basePath: "external.ExternalType"
        });

        expect(linkTypeInfo(ti, ctx)).toBe("`ExternalType`");
    });

    it("should return backtick-wrapped text when basePath is undefined", () => {
        const ctx = makeCtx();
        const ti = makeTypeInfo({ display: "str" });

        expect(linkTypeInfo(ti, ctx)).toBe("`str`");
    });

    it("should escape MDX in display name", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.Foo"])
        });
        const ti = makeTypeInfo({
            display: "Foo<Bar>",
            basePath: "pkg.Foo"
        });

        expect(linkTypeInfo(ti, ctx)).toBe("[Foo&lt;Bar&gt;](/reference/pkg#pkg-Foo)");
    });

    it("should use same-page anchors with currentModulePath", () => {
        const ctx = makeCtx({
            validPaths: new Set(["pkg.models.Response"])
        });
        const ti = makeTypeInfo({
            display: "Response",
            basePath: "pkg.models.Response"
        });

        expect(linkTypeInfo(ti, ctx, "pkg.models")).toBe("[Response](#pkg-models-Response)");
    });

    it("should fall back to resolvedPath when display is absent", () => {
        const ctx = makeCtx({ validPaths: new Set() });
        const ti = makeTypeInfo({ resolvedPath: "typing.List[str]" });

        expect(linkTypeInfo(ti, ctx)).toBe("`typing.List[str]`");
    });
});

// ============================================================================
// renderCodeBlockWithLinks
// ============================================================================

describe("renderCodeBlockWithLinks", () => {
    it("should render code block without links", () => {
        const result = renderCodeBlockWithLinks("def foo():", {});
        expect(result).toBe(
            `<CodeBlock showLineNumbers={false} wordWrap={true}>\n\n\`\`\`python\ndef foo():\n\`\`\`\n\n</CodeBlock>`
        );
    });

    it("should render code block with links attribute", () => {
        const links = { "pkg.Foo": "/reference/pkg#pkg-Foo" };
        const result = renderCodeBlockWithLinks("def foo() -> pkg.Foo:", links);

        expect(result).toContain("links={");
        expect(result).toContain('"pkg.Foo"');
        expect(result).toContain('"/reference/pkg#pkg-Foo"');
        expect(result).toContain("def foo() -> pkg.Foo:");
    });

    it("should wrap code in python code fence", () => {
        const result = renderCodeBlockWithLinks("x = 1", {});
        expect(result).toContain("```python");
        expect(result).toContain("```");
    });
});

// ============================================================================
// formatSignatureMultiline
// ============================================================================

describe("formatSignatureMultiline", () => {
    it("should format empty params as single line", () => {
        expect(formatSignatureMultiline("def foo", [])).toBe("def foo()");
    });

    it("should format empty params with return type", () => {
        expect(formatSignatureMultiline("def foo", [], ["str"])).toBe("def foo() -> str");
    });

    it("should format single param on separate line", () => {
        const params: SignatureParam[] = [{ name: "x", type: "int" }];
        const result = formatSignatureMultiline("def foo", params);
        expect(result).toBe("def foo(\n    x: int\n)");
    });

    it("should format multiple params with commas", () => {
        const params: SignatureParam[] = [
            { name: "x", type: "int" },
            { name: "y", type: "str" }
        ];
        const result = formatSignatureMultiline("def foo", params);
        expect(result).toBe("def foo(\n    x: int,\n    y: str\n)");
    });

    it("should include default values", () => {
        const params: SignatureParam[] = [{ name: "x", type: "int", defaultValue: "42" }];
        const result = formatSignatureMultiline("def foo", params);
        expect(result).toBe("def foo(\n    x: int = 42\n)");
    });

    it("should truncate long default values", () => {
        const longDefault = "some_very_long_default_value_that_exceeds_limit";
        const params: SignatureParam[] = [{ name: "x", defaultValue: longDefault }];
        const result = formatSignatureMultiline("def foo", params);
        // MAX_DEFAULT_LENGTH is 30, so 27 chars + "..." = 30
        expect(result).toContain("some_very_long_default_valu...");
        expect(result).not.toContain(longDefault);
    });

    it("should handle params without types", () => {
        const params: SignatureParam[] = [{ name: "x" }, { name: "y" }];
        const result = formatSignatureMultiline("def foo", params);
        expect(result).toBe("def foo(\n    x,\n    y\n)");
    });

    it("should format return type with params", () => {
        const params: SignatureParam[] = [{ name: "x", type: "int" }];
        const result = formatSignatureMultiline("def foo", params, ["bool"]);
        expect(result).toBe("def foo(\n    x: int\n) -> bool");
    });

    it("should format multiple return types as tuple", () => {
        const result = formatSignatureMultiline("def foo", [], ["int", "str"]);
        expect(result).toBe("def foo() -> tuple[int, str]");
    });

    it("should work with class headers", () => {
        const params: SignatureParam[] = [{ name: "name", type: "str" }];
        const result = formatSignatureMultiline("class Foo", params);
        expect(result).toBe("class Foo(\n    name: str\n)");
    });
});
