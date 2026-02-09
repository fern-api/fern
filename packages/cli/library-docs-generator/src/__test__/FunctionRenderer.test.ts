import type { FdrAPI } from "@fern-api/fdr-sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { renderFunctionDetailed, renderMethodDetailed, renderProperty } from "../renderers/FunctionRenderer";
import type { RenderContext } from "../utils/TypeLinkResolver";

const NEMO_FUNCTIONS: Record<string, FdrAPI.libraryDocs.PythonFunctionIr> = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "nemo-functions.json"), "utf-8")
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal render context with no type linking. */
function emptyCtx(): RenderContext {
    return { baseSlug: "reference/python", validPaths: new Set(), pathAliases: new Map() };
}

/** Render context that knows about paths for type linking. */
function ctxWithPaths(paths: string[]): RenderContext {
    return { baseSlug: "reference/python", validPaths: new Set(paths), pathAliases: new Map() };
}

/** Build a minimal function IR for unit tests. */
function makeFunction(overrides: Partial<FdrAPI.libraryDocs.PythonFunctionIr>): FdrAPI.libraryDocs.PythonFunctionIr {
    return {
        name: "my_func",
        path: "pkg.my_func",
        signature: "def pkg.my_func()",
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

/** Build a minimal parameter IR. */
function makeParam(overrides: Partial<FdrAPI.libraryDocs.PythonParameterIr>): FdrAPI.libraryDocs.PythonParameterIr {
    return {
        name: "x",
        kind: "POSITIONAL" as FdrAPI.libraryDocs.PythonParameterKind,
        typeInfo: undefined,
        default: undefined,
        description: undefined,
        ...overrides
    } as FdrAPI.libraryDocs.PythonParameterIr;
}

// ---------------------------------------------------------------------------
// renderFunctionDetailed
// ---------------------------------------------------------------------------

describe("renderFunctionDetailed", () => {
    it("renders anchor with correct ID", () => {
        const result = renderFunctionDetailed(makeFunction({ path: "pkg.sub.my_func" }), emptyCtx());
        expect(result).toContain('<Anchor id="pkg-sub-my_func">');
    });

    it("renders signature in CodeBlock", () => {
        const result = renderFunctionDetailed(makeFunction({}), emptyCtx());
        expect(result).toContain("<CodeBlock");
        expect(result).toContain("```python");
        expect(result).toContain("pkg.my_func()");
        expect(result).toContain("```");
        expect(result).toContain("</CodeBlock>");
    });

    it("wraps content in Indent", () => {
        const result = renderFunctionDetailed(makeFunction({}), emptyCtx());
        expect(result).toContain("<Indent>");
        expect(result).toContain("</Indent>");
    });

    it("renders parameters in signature", () => {
        const func = makeFunction({
            path: "pkg.greet",
            parameters: [
                makeParam({
                    name: "name",
                    typeInfo: { display: "str", resolvedPath: "str", basePath: undefined }
                }),
                makeParam({
                    name: "count",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined },
                    default: "1"
                })
            ]
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("name: str,");
        expect(result).toContain("count: int = 1");
    });

    it("renders return type in signature", () => {
        const func = makeFunction({
            returnTypeInfo: { display: "bool", resolvedPath: "bool", basePath: undefined }
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("-> bool");
    });

    it("does NOT omit self/cls from module-level functions", () => {
        const func = makeFunction({
            parameters: [makeParam({ name: "self" }), makeParam({ name: "x" })]
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("self");
        expect(result).toContain("x");
    });

    // --- Badges ---

    it("renders no badges for plain function", () => {
        const result = renderFunctionDetailed(makeFunction({}), emptyCtx());
        expect(result).not.toContain("<Badge>");
    });

    it("renders async badge", () => {
        const func = makeFunction({ isAsync: true });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>async</Badge>");
    });

    it("renders classmethod badge", () => {
        const func = makeFunction({ isClassmethod: true, decorators: ["classmethod"] });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>classmethod</Badge>");
    });

    it("renders staticmethod badge", () => {
        const func = makeFunction({ isStaticmethod: true, decorators: ["staticmethod"] });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>staticmethod</Badge>");
    });

    it("renders property badge", () => {
        const func = makeFunction({ isProperty: true });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>property</Badge>");
    });

    it("renders abstract badge from decorators", () => {
        const func = makeFunction({ decorators: ["abstractmethod"] });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>abstract</Badge>");
    });

    it("renders multiple badges", () => {
        const func = makeFunction({
            isAsync: true,
            isStaticmethod: true,
            decorators: ["staticmethod", "abstractmethod"]
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>async</Badge>");
        expect(result).toContain("<Badge>staticmethod</Badge>");
        expect(result).toContain("<Badge>abstract</Badge>");
    });

    // --- Docstring ---

    it("renders docstring content", () => {
        const func = makeFunction({
            docstring: {
                summary: "Do something.",
                description: "Do something useful.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("Do something useful.");
    });

    it("uses param type annotations as docstring fallback", () => {
        const func = makeFunction({
            parameters: [
                makeParam({
                    name: "x",
                    typeInfo: { display: "float", resolvedPath: "float", basePath: undefined }
                })
            ],
            docstring: {
                summary: undefined,
                description: undefined,
                params: [{ name: "x", type: undefined, description: "A number", default: undefined }],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain('type="float"');
    });

    it("uses return type as docstring fallback", () => {
        const func = makeFunction({
            returnTypeInfo: { display: "int", resolvedPath: "int", basePath: undefined },
            docstring: {
                summary: undefined,
                description: undefined,
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: { type: undefined, description: "The count" }
            }
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).toContain("**Returns:** `int`");
    });

    it("renders no docstring section when docstring is null", () => {
        const func = makeFunction({ docstring: undefined });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).not.toContain("**Parameters:**");
        expect(result).not.toContain("**Returns:**");
    });

    // --- Type links ---

    it("extracts type links for known paths", () => {
        const func = makeFunction({
            path: "pkg.sub.my_func",
            parameters: [
                makeParam({
                    name: "x",
                    typeInfo: {
                        display: "MyClass",
                        resolvedPath: "pkg.sub.MyClass",
                        basePath: "pkg.sub.MyClass"
                    }
                })
            ]
        });
        const ctx = ctxWithPaths(["pkg.sub.MyClass"]);
        const result = renderFunctionDetailed(func, ctx);
        // Should have links attribute on CodeBlock
        expect(result).toContain("links={");
        expect(result).toContain("pkg.sub.MyClass");
    });

    it("does not generate links for unknown paths", () => {
        const func = makeFunction({
            parameters: [
                makeParam({
                    name: "x",
                    typeInfo: {
                        display: "ExternalType",
                        resolvedPath: "external.lib.ExternalType",
                        basePath: "external.lib.ExternalType"
                    }
                })
            ]
        });
        const result = renderFunctionDetailed(func, emptyCtx());
        expect(result).not.toContain("links={");
    });

    // --- Structure ---

    it("renders sections in correct order: Anchor > CodeBlock > Indent > badges > docstring", () => {
        const func = makeFunction({
            isAsync: true,
            docstring: {
                summary: "Do it.",
                description: "Do it fast.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderFunctionDetailed(func, emptyCtx());

        const anchorIdx = result.indexOf("<Anchor");
        const codeBlockIdx = result.indexOf("<CodeBlock");
        const indentIdx = result.indexOf("<Indent>");
        const badgeIdx = result.indexOf("<Badge>async</Badge>");
        const descIdx = result.indexOf("Do it fast.");
        const closeIndentIdx = result.indexOf("</Indent>");

        expect(anchorIdx).toBeLessThan(codeBlockIdx);
        expect(codeBlockIdx).toBeLessThan(indentIdx);
        expect(indentIdx).toBeLessThan(badgeIdx);
        expect(badgeIdx).toBeLessThan(descIdx);
        expect(descIdx).toBeLessThan(closeIndentIdx);
    });
});

// ---------------------------------------------------------------------------
// renderMethodDetailed
// ---------------------------------------------------------------------------

describe("renderMethodDetailed", () => {
    it("omits self from method signature", () => {
        const func = makeFunction({
            path: "pkg.MyClass.my_method",
            parameters: [
                makeParam({ name: "self" }),
                makeParam({ name: "x", typeInfo: { display: "int", resolvedPath: "int", basePath: undefined } })
            ]
        });
        const result = renderMethodDetailed(func, emptyCtx());
        expect(result).toContain("x: int");
        // self should not appear in the code block
        expect(result).not.toMatch(/```python[\s\S]*self[\s\S]*```/);
    });

    it("omits cls from classmethod signature", () => {
        const func = makeFunction({
            path: "pkg.MyClass.from_config",
            isClassmethod: true,
            decorators: ["classmethod"],
            parameters: [
                makeParam({ name: "cls" }),
                makeParam({
                    name: "config",
                    typeInfo: { display: "dict", resolvedPath: "dict", basePath: undefined }
                })
            ]
        });
        const result = renderMethodDetailed(func, emptyCtx());
        expect(result).toContain("config: dict");
        expect(result).not.toMatch(/```python[\s\S]*\bcls\b[\s\S]*```/);
        expect(result).toContain("<Badge>classmethod</Badge>");
    });

    it("uses provided currentModulePath for links", () => {
        const func = makeFunction({
            path: "pkg.mod.MyClass.method",
            parameters: [
                makeParam({ name: "self" }),
                makeParam({
                    name: "x",
                    typeInfo: {
                        display: "Other",
                        resolvedPath: "pkg.mod.Other",
                        basePath: "pkg.mod.Other"
                    }
                })
            ]
        });
        const ctx = ctxWithPaths(["pkg.mod.Other"]);
        // When same module, should get local anchor link
        const result = renderMethodDetailed(func, ctx, "pkg.mod");
        expect(result).toContain("#pkg-mod-Other");
        expect(result).not.toContain("/reference/python/");
    });

    it("renders anchor with full path ID", () => {
        const func = makeFunction({ path: "pkg.MyClass.method" });
        const result = renderMethodDetailed(func, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-MyClass-method">');
    });

    it("renders badges for method", () => {
        const func = makeFunction({
            path: "pkg.MyClass.my_prop",
            isProperty: true,
            decorators: ["property"]
        });
        const result = renderMethodDetailed(func, emptyCtx());
        expect(result).toContain("<Badge>property</Badge>");
    });

    it("renders method with no parameters (after self removal)", () => {
        const func = makeFunction({
            path: "pkg.MyClass.reset",
            parameters: [makeParam({ name: "self" })]
        });
        const result = renderMethodDetailed(func, emptyCtx());
        expect(result).toContain("pkg.MyClass.reset()");
    });
});

// ---------------------------------------------------------------------------
// renderProperty
// ---------------------------------------------------------------------------

describe("renderProperty", () => {
    it("renders property signature as name: Type", () => {
        const func = makeFunction({
            name: "value",
            path: "pkg.MyClass.value",
            isProperty: true,
            returnTypeInfo: { display: "int", resolvedPath: "int", basePath: undefined }
        });
        const result = renderProperty(func, emptyCtx());
        expect(result).toContain("value: int");
        expect(result).not.toContain("def ");
    });

    it("renders property with no type as just the name", () => {
        const func = makeFunction({
            name: "data",
            path: "pkg.MyClass.data",
            isProperty: true,
            returnTypeInfo: undefined
        });
        const result = renderProperty(func, emptyCtx());
        expect(result).toContain("```python\ndata\n```");
    });

    it("renders anchor with correct ID", () => {
        const func = makeFunction({
            name: "count",
            path: "pkg.MyClass.count",
            isProperty: true
        });
        const result = renderProperty(func, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-MyClass-count">');
    });

    it("renders docstring when present", () => {
        const func = makeFunction({
            name: "items",
            path: "pkg.MyClass.items",
            isProperty: true,
            docstring: {
                summary: "The items list.",
                description: "The items list.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderProperty(func, emptyCtx());
        expect(result).toContain("<Indent>");
        expect(result).toContain("The items list.");
        expect(result).toContain("</Indent>");
    });

    it("omits Indent when no docstring", () => {
        const func = makeFunction({
            name: "size",
            path: "pkg.MyClass.size",
            isProperty: true,
            docstring: undefined
        });
        const result = renderProperty(func, emptyCtx());
        expect(result).not.toContain("<Indent>");
    });

    it("generates type links for property type", () => {
        const func = makeFunction({
            name: "config",
            path: "pkg.MyClass.config",
            isProperty: true,
            returnTypeInfo: {
                display: "Config",
                resolvedPath: "pkg.Config",
                basePath: "pkg.Config"
            }
        });
        const ctx = ctxWithPaths(["pkg.Config"]);
        const result = renderProperty(func, ctx);
        expect(result).toContain("links={");
        expect(result).toContain("pkg.Config");
    });

    it("does not render badges (property badge is handled by caller)", () => {
        const func = makeFunction({
            name: "value",
            path: "pkg.MyClass.value",
            isProperty: true,
            returnTypeInfo: { display: "int", resolvedPath: "int", basePath: undefined }
        });
        const result = renderProperty(func, emptyCtx());
        // renderProperty doesn't render badges — that's the caller's responsibility
        expect(result).not.toContain("<Badge>");
    });
});

// ---------------------------------------------------------------------------
// NeMo IR fixture tests
// ---------------------------------------------------------------------------

describe("renderFunctionDetailed (NeMo fixtures)", () => {
    it("patch_transformers_module_dir: simple function with typed param, no docstring", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const func = NEMO_FUNCTIONS["patch_transformers_module_dir"]!;
        const result = renderFunctionDetailed(func, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-patch_transformers_module_dir">');

        // Signature contains function path and param
        expect(result).toContain("nemo_rl.patch_transformers_module_dir");
        expect(result).toContain("env_vars: dict[str, str]");

        // No return type
        expect(result).not.toContain("->");

        // No badges
        expect(result).not.toContain("<Badge>");

        // No docstring content
        expect(result).not.toContain("**Parameters:**");
        expect(result).not.toContain("**Returns:**");
    });

    it("_check_container_fingerprint: no-param function with description-only docstring", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const func = NEMO_FUNCTIONS["_check_container_fingerprint"]!;
        const result = renderFunctionDetailed(func, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-_check_container_fingerprint">');

        // Signature is just the path with empty parens
        expect(result).toContain("nemo_rl._check_container_fingerprint()");

        // Docstring description is rendered
        expect(result).toContain("Check if container dependencies match the current code");
        expect(result).toContain("NRL_CONTAINER=1");
        expect(result).toContain("RuntimeError");
    });
});

describe("renderMethodDetailed (NeMo fixtures)", () => {
    it("concat: classmethod omits cls, renders badge and type links", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const func = NEMO_FUNCTIONS["concat"]!;
        const ctx = ctxWithPaths(["nemo_rl.data.multimodal_utils.PackedTensor"]);
        const result = renderMethodDetailed(func, ctx);

        // Anchor uses full path
        expect(result).toContain('<Anchor id="nemo_rl-data-multimodal_utils-PackedTensor-concat">');

        // cls should be omitted from signature
        expect(result).not.toMatch(/```python[\s\S]*\bcls\b[\s\S]*```/);

        // Parameter should be present
        expect(result).toContain("from_packed_tensors");

        // Return type
        expect(result).toContain("nemo_rl.data.multimodal_utils.PackedTensor");

        // classmethod badge
        expect(result).toContain("<Badge>classmethod</Badge>");

        // Type links for the return type (PackedTensor is in valid paths)
        expect(result).toContain("links={");

        // Docstring description
        expect(result).toContain("Concatenate a list of PackedTensor objects");
    });

    it("backward: staticmethod with return type, no docstring", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const func = NEMO_FUNCTIONS["backward"]!;
        const result = renderMethodDetailed(func, emptyCtx());

        // staticmethod badge
        expect(result).toContain("<Badge>staticmethod</Badge>");

        // Parameters (staticmethod doesn't have self/cls to omit)
        expect(result).toContain("ctx");
        expect(result).toContain("grad_outputs");

        // Return type
        expect(result).toContain("tuple[torch.Tensor, None, None, None]");

        // No docstring
        expect(result).not.toContain("**Parameters:**");
    });

    it("push_with_wait_signal: method with self, docstring params, and return type", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const func = NEMO_FUNCTIONS["push_with_wait_signal"]!;
        const result = renderMethodDetailed(func, emptyCtx());

        // self should be omitted
        expect(result).not.toMatch(/```python[\s\S]*\bself\b[\s\S]*```/);

        // Other params should be present in signature
        expect(result).toContain("trajectory");
        expect(result).toContain("weight_version");
        expect(result).toContain("target_weight_version");

        // Docstring params rendered
        expect(result).toContain("**Parameters:**");
        expect(result).toContain('path="trajectory"');
        expect(result).toContain("data dict");
        expect(result).toContain('path="weight_version"');
        expect(result).toContain("version of the model weights used for generation");

        // Return type in signature
        expect(result).toContain("-> str");

        // No badges (not async, classmethod, or staticmethod)
        expect(result).not.toContain("<Badge>");
    });
});
