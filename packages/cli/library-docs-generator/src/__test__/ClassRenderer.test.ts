import type { FdrAPI } from "@fern-api/fdr-sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { renderClassDetailed } from "../renderers/ClassRenderer";
import type { RenderContext } from "../utils/TypeLinkResolver";

const NEMO_CLASSES: Record<string, FdrAPI.libraryDocs.PythonClassIr> = JSON.parse(
    readFileSync(join(__dirname, "fixtures", "nemo-classes.json"), "utf-8")
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

/** Build a minimal class IR for unit tests. */
function makeClass(overrides: Partial<FdrAPI.libraryDocs.PythonClassIr>): FdrAPI.libraryDocs.PythonClassIr {
    return {
        name: "MyClass",
        path: "pkg.MyClass",
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

/** Build a minimal function IR (for methods). */
function makeMethod(overrides: Partial<FdrAPI.libraryDocs.PythonFunctionIr>): FdrAPI.libraryDocs.PythonFunctionIr {
    return {
        name: "my_method",
        path: "pkg.MyClass.my_method",
        signature: "def pkg.MyClass.my_method(self)",
        parameters: [makeParam({ name: "self" })],
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

/** Build a minimal attribute IR. */
function makeAttr(overrides: Partial<FdrAPI.libraryDocs.AttributeIr>): FdrAPI.libraryDocs.AttributeIr {
    return {
        name: "attr",
        path: "pkg.MyClass.attr",
        typeInfo: undefined,
        value: undefined,
        docstring: undefined,
        ...overrides
    } as FdrAPI.libraryDocs.AttributeIr;
}

// ---------------------------------------------------------------------------
// renderClassDetailed — Regular class
// ---------------------------------------------------------------------------

describe("renderClassDetailed (regular class)", () => {
    it("renders anchor with correct ID", () => {
        const result = renderClassDetailed(makeClass({ path: "pkg.sub.MyClass" }), emptyCtx());
        expect(result).toContain('<Anchor id="pkg-sub-MyClass">');
    });

    it("renders class signature in CodeBlock", () => {
        const result = renderClassDetailed(makeClass({}), emptyCtx());
        expect(result).toContain("<CodeBlock");
        expect(result).toContain("```python");
        expect(result).toContain("class pkg.MyClass()");
        expect(result).toContain("```");
    });

    it("wraps content in Indent", () => {
        const result = renderClassDetailed(makeClass({}), emptyCtx());
        expect(result).toContain("<Indent>");
        expect(result).toContain("</Indent>");
    });

    it("renders constructor params in signature", () => {
        const cls = makeClass({
            constructorParams: [
                makeParam({
                    name: "x",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined }
                }),
                makeParam({
                    name: "y",
                    typeInfo: { display: "str", resolvedPath: "str", basePath: undefined },
                    default: "hello"
                })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("x: int,");
        expect(result).toContain("y: str = hello");
    });

    it("renders params with no default when default is null", () => {
        const cls = makeClass({
            constructorParams: [
                makeParam({
                    name: "sep",
                    default: undefined
                })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        // No default value should appear
        expect(result).toContain("sep");
        expect(result).not.toContain("sep =");
    });

    it("renders no badges for plain class", () => {
        const result = renderClassDetailed(makeClass({}), emptyCtx());
        expect(result).not.toContain("<Badge>");
    });

    it("renders Protocol badge", () => {
        const cls = makeClass({ kind: "PROTOCOL" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Protocol</Badge>");
    });

    it("renders Dataclass badge", () => {
        const cls = makeClass({ kind: "DATACLASS" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Dataclass</Badge>");
    });

    it("renders Exception badge", () => {
        const cls = makeClass({ kind: "EXCEPTION" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Exception</Badge>");
    });

    it("renders Abstract badge", () => {
        const cls = makeClass({ isAbstract: true });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Abstract</Badge>");
    });

    it("renders multiple badges", () => {
        const cls = makeClass({ kind: "PROTOCOL" as FdrAPI.libraryDocs.PythonClassKind, isAbstract: true });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Protocol</Badge>");
        expect(result).toContain("<Badge>Abstract</Badge>");
    });

    // --- Base classes ---

    it("renders base classes as links when type info available", () => {
        const cls = makeClass({
            bases: [
                {
                    name: "BaseModel",
                    typeInfo: {
                        display: "BaseModel",
                        resolvedPath: "pkg.BaseModel",
                        basePath: "pkg.BaseModel"
                    }
                }
            ]
        });
        const ctx = ctxWithPaths(["pkg.BaseModel"]);
        const result = renderClassDetailed(cls, ctx);
        expect(result).toContain("**Bases:**");
        expect(result).toContain("[BaseModel]");
    });

    it("renders base classes as code when no type info", () => {
        const cls = makeClass({
            bases: [{ name: "SomeBase", typeInfo: undefined }]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("**Bases:** `SomeBase`");
    });

    it("filters out trivial bases (object, ABC, Protocol, TypedDict)", () => {
        const cls = makeClass({
            bases: [
                { name: "object", typeInfo: undefined },
                { name: "ABC", typeInfo: undefined }
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).not.toContain("**Bases:**");
    });

    it("renders no bases line when bases is empty", () => {
        const result = renderClassDetailed(makeClass({ bases: [] }), emptyCtx());
        expect(result).not.toContain("**Bases:**");
    });

    // --- Docstring ---

    it("renders docstring", () => {
        const cls = makeClass({
            docstring: {
                summary: "A test class.",
                description: "A test class with features.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("A test class with features.");
    });

    it("passes param annotations from constructorParams to docstring", () => {
        const cls = makeClass({
            constructorParams: [
                makeParam({
                    name: "x",
                    typeInfo: { display: "float", resolvedPath: "float", basePath: undefined }
                })
            ],
            docstring: {
                summary: undefined,
                description: undefined,
                params: [{ name: "x", type: undefined, description: "A value", default: undefined }],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('type="float"');
    });

    // --- Attributes ---

    it("renders meaningful attributes as ParamField", () => {
        const cls = makeClass({
            attributes: [
                makeAttr({
                    name: "count",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined }
                })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<ParamField path="count"');
        expect(result).toContain('type="int"');
    });

    it("renders attribute with value as default", () => {
        const cls = makeClass({
            attributes: [
                makeAttr({
                    name: "timeout",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined },
                    value: "30"
                })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('type="int = 30"');
    });

    it("skips redundant attributes (value === name)", () => {
        const cls = makeClass({
            attributes: [makeAttr({ name: "FOO", value: "FOO" })]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).not.toContain('<ParamField path="FOO"');
    });

    it("skips attributes with only Any type and no docstring/value", () => {
        const cls = makeClass({
            attributes: [
                makeAttr({
                    name: "data",
                    typeInfo: { display: "Any", resolvedPath: "typing.Any", basePath: undefined }
                })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).not.toContain('<ParamField path="data"');
    });

    it("keeps attributes with docstring even if type is Any", () => {
        const cls = makeClass({
            attributes: [
                makeAttr({
                    name: "data",
                    typeInfo: { display: "Any", resolvedPath: "typing.Any", basePath: undefined },
                    docstring: {
                        summary: "Important data.",
                        description: "Important data.",
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
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<ParamField path="data"');
        expect(result).toContain("Important data.");
    });

    // --- Methods ---

    it("renders methods (excludes __init__)", () => {
        const cls = makeClass({
            methods: [
                makeMethod({ name: "__init__", path: "pkg.MyClass.__init__" }),
                makeMethod({ name: "run", path: "pkg.MyClass.run" })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-MyClass-run">');
        expect(result).not.toContain('<Anchor id="pkg-MyClass-__init__">');
    });

    it("renders property methods via renderProperty", () => {
        const cls = makeClass({
            methods: [
                makeMethod({
                    name: "value",
                    path: "pkg.MyClass.value",
                    isProperty: true,
                    returnTypeInfo: { display: "int", resolvedPath: "int", basePath: undefined }
                })
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        // renderProperty renders name: Type without "def"
        expect(result).toContain("value: int");
        expect(result).not.toContain("def ");
    });

    // --- Type links ---

    it("extracts type links from constructor params", () => {
        const cls = makeClass({
            path: "pkg.sub.MyClass",
            constructorParams: [
                makeParam({
                    name: "config",
                    typeInfo: {
                        display: "Config",
                        resolvedPath: "pkg.sub.Config",
                        basePath: "pkg.sub.Config"
                    }
                })
            ]
        });
        const ctx = ctxWithPaths(["pkg.sub.Config"]);
        const result = renderClassDetailed(cls, ctx);
        expect(result).toContain("links={");
        expect(result).toContain("pkg.sub.Config");
    });

    // --- Structure ordering ---

    it("renders sections in correct order: Anchor > CodeBlock > Indent > badges > bases > docstring > attrs > methods", () => {
        const cls = makeClass({
            kind: "DATACLASS" as FdrAPI.libraryDocs.PythonClassKind,
            bases: [{ name: "BaseModel", typeInfo: undefined }],
            docstring: {
                summary: "A class.",
                description: "A class with stuff.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            },
            attributes: [
                makeAttr({
                    name: "count",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined }
                })
            ],
            methods: [makeMethod({ name: "run", path: "pkg.MyClass.run" })]
        });
        const result = renderClassDetailed(cls, emptyCtx());

        const anchorIdx = result.indexOf("<Anchor");
        const codeBlockIdx = result.indexOf("<CodeBlock");
        const indentIdx = result.indexOf("<Indent>");
        const badgeIdx = result.indexOf("<Badge>Dataclass</Badge>");
        const basesIdx = result.indexOf("**Bases:**");
        const descIdx = result.indexOf("A class with stuff.");
        const attrIdx = result.indexOf('<ParamField path="count"');
        const methodIdx = result.indexOf('id="pkg-MyClass-run"');
        const closeIndentIdx = result.lastIndexOf("</Indent>");

        expect(anchorIdx).toBeLessThan(codeBlockIdx);
        expect(codeBlockIdx).toBeLessThan(indentIdx);
        expect(indentIdx).toBeLessThan(badgeIdx);
        expect(badgeIdx).toBeLessThan(basesIdx);
        expect(basesIdx).toBeLessThan(descIdx);
        expect(descIdx).toBeLessThan(attrIdx);
        expect(attrIdx).toBeLessThan(methodIdx);
        expect(methodIdx).toBeLessThan(closeIndentIdx);
    });
});

// ---------------------------------------------------------------------------
// renderClassDetailed — TypedDict
// ---------------------------------------------------------------------------

describe("renderClassDetailed (TypedDict)", () => {
    it("renders anchor and signature", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            path: "pkg.MyConfig"
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-MyConfig">');
        expect(result).toContain("class pkg.MyConfig");
    });

    it("renders typing.TypedDict base", () => {
        const cls = makeClass({ kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("**Bases:** `typing.TypedDict`");
    });

    it("renders docstring as simple description", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            docstring: {
                summary: "Config options.",
                description: "Config options for the system.",
                params: [{ name: "x", type: "int", description: "A number", default: undefined }],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderClassDetailed(cls, emptyCtx());
        // TypedDict uses renderSimpleDocstring — only description, no params section
        expect(result).toContain("Config options for the system.");
        expect(result).not.toContain("**Parameters:**");
    });

    it("renders typed dict fields as ParamField", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            typedDictFields: [
                {
                    name: "batch_size",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined },
                    description: "Number of items per batch.",
                    required: true
                },
                {
                    name: "shuffle",
                    typeInfo: { display: "bool", resolvedPath: "bool", basePath: undefined },
                    description: undefined,
                    required: false
                }
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<ParamField path="batch_size" type="int">');
        expect(result).toContain("Number of items per batch.");
        expect(result).toContain('<ParamField path="shuffle" type="bool">');
    });

    it("renders empty ParamField when no description", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            typedDictFields: [
                {
                    name: "x",
                    typeInfo: { display: "int", resolvedPath: "int", basePath: undefined },
                    description: undefined,
                    required: true
                }
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<ParamField path="x" type="int">');
        expect(result).toContain("</ParamField>");
    });

    it("defaults type to Any when typeInfo is undefined", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            typedDictFields: [
                {
                    name: "data",
                    typeInfo: undefined,
                    description: undefined,
                    required: true
                }
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('type="Any"');
    });

    it("renders no fields when typedDictFields is undefined", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            typedDictFields: undefined
        });
        const result = renderClassDetailed(cls, emptyCtx());
        // Should have Bases but no ParamField
        expect(result).toContain("**Bases:**");
        expect(result).not.toContain("<ParamField");
    });

    it("does not render bases from bases array (TypedDict/Enum skip bases rendering)", () => {
        const cls = makeClass({
            kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind,
            bases: [{ name: "SomeMixin", typeInfo: undefined }]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        // TypedDict always shows typing.TypedDict as base, not the bases array
        expect(result).toContain("`typing.TypedDict`");
        expect(result).not.toContain("SomeMixin");
    });
});

// ---------------------------------------------------------------------------
// renderClassDetailed — Enum
// ---------------------------------------------------------------------------

describe("renderClassDetailed (Enum)", () => {
    it("renders anchor and signature", () => {
        const cls = makeClass({
            kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind,
            path: "pkg.Color"
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain('<Anchor id="pkg-Color">');
        expect(result).toContain("class pkg.Color");
    });

    it("renders enum.Enum base", () => {
        const cls = makeClass({ kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("**Bases:** `enum.Enum`");
    });

    it("renders docstring as simple description", () => {
        const cls = makeClass({
            kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind,
            docstring: {
                summary: "Available colors.",
                description: "Available colors for the theme.",
                params: [],
                raises: [],
                examples: [],
                notes: [],
                warnings: [],
                returns: undefined
            }
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("Available colors for the theme.");
    });

    it("renders enum members as ParamField with value", () => {
        const cls = makeClass({
            kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind,
            enumMembers: [
                { name: "RED", value: "'red'" },
                { name: "GREEN", value: "'green'" }
            ]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        // escapeMdx only escapes < > { } and ```, single quotes pass through
        expect(result).toContain('<ParamField path="RED" type="= \'red\'">');
        expect(result).toContain('<ParamField path="GREEN" type="= \'green\'">');
    });

    it("renders no members when enumMembers is undefined", () => {
        const cls = makeClass({
            kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind,
            enumMembers: undefined
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("**Bases:**");
        expect(result).not.toContain("<ParamField");
    });

    it("escapes MDX characters in enum values", () => {
        const cls = makeClass({
            kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind,
            enumMembers: [{ name: "OPTION", value: "<default>" }]
        });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("&lt;default&gt;");
        expect(result).not.toContain("<default>");
    });
});

// ---------------------------------------------------------------------------
// renderClassDetailed — dispatch
// ---------------------------------------------------------------------------

describe("renderClassDetailed (dispatch)", () => {
    it("dispatches TYPEDDICT to TypedDict renderer", () => {
        const cls = makeClass({ kind: "TYPEDDICT" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("`typing.TypedDict`");
    });

    it("dispatches ENUM to Enum renderer", () => {
        const cls = makeClass({ kind: "ENUM" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("`enum.Enum`");
    });

    it("dispatches CLASS to regular renderer", () => {
        const cls = makeClass({ kind: "CLASS" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        // Regular renderer has <Indent> but no fixed "Bases:" line
        expect(result).toContain("<Indent>");
        expect(result).not.toContain("`typing.TypedDict`");
        expect(result).not.toContain("`enum.Enum`");
    });

    it("dispatches PROTOCOL to regular renderer", () => {
        const cls = makeClass({ kind: "PROTOCOL" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Protocol</Badge>");
    });

    it("dispatches EXCEPTION to regular renderer", () => {
        const cls = makeClass({ kind: "EXCEPTION" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Exception</Badge>");
    });

    it("dispatches DATACLASS to regular renderer", () => {
        const cls = makeClass({ kind: "DATACLASS" as FdrAPI.libraryDocs.PythonClassKind });
        const result = renderClassDetailed(cls, emptyCtx());
        expect(result).toContain("<Badge>Dataclass</Badge>");
    });
});

// ---------------------------------------------------------------------------
// NeMo IR fixture tests
// ---------------------------------------------------------------------------

describe("renderClassDetailed (NeMo fixtures)", () => {
    it("PackedTensor: regular CLASS with constructor params and methods", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["PackedTensor"]!;
        const ctx = ctxWithPaths(["nemo_rl.data.multimodal_utils.PackedTensor"]);
        const result = renderClassDetailed(cls, ctx);

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-data-multimodal_utils-PackedTensor">');

        // Signature contains class path and constructor params
        expect(result).toContain("class nemo_rl.data.multimodal_utils.PackedTensor");
        expect(result).toContain("tensors:");
        expect(result).toContain("dim_to_pack: int");

        // Docstring description
        expect(result).toContain("Wrapper around a list of torch tensors");
        // `dim_to_pack` is in backtick-wrapped inline code, no curly braces to escape
        expect(result).toContain("`dim_to_pack`");

        // No class-level badges (badges may appear inside methods like concat's classmethod badge)
        // Check that no badge appears before the first method anchor
        // biome-ignore lint/style/noNonNullAssertion: split always has index 0
        const classContent = result.split('id="nemo_rl-data-multimodal_utils-PackedTensor-as_tensor"')[0]!;
        expect(classContent).not.toContain("<Badge>");

        // Methods rendered (excluding __init__)
        expect(result).toContain('id="nemo_rl-data-multimodal_utils-PackedTensor-as_tensor"');
        expect(result).toContain('id="nemo_rl-data-multimodal_utils-PackedTensor-concat"');
    });

    it("LossType: ENUM with members", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["LossType"]!;
        const result = renderClassDetailed(cls, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-interfaces-LossType">');

        // Enum base
        expect(result).toContain("**Bases:** `enum.Enum`");

        // Members
        expect(result).toContain('path="SEQUENCE_LEVEL"');
        expect(result).toContain('path="TOKEN_LEVEL"');
    });

    it("DistillationConfig: TYPEDDICT with fields", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["DistillationConfig"]!;
        const result = renderClassDetailed(cls, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-distillation-DistillationConfig">');

        // TypedDict base
        expect(result).toContain("**Bases:** `typing.TypedDict`");

        // Has ParamField entries for fields
        expect(result).toContain("<ParamField");
    });

    it("LossFunction: PROTOCOL with method", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["LossFunction"]!;
        const result = renderClassDetailed(cls, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-algorithms-interfaces-LossFunction">');

        // Protocol badge
        expect(result).toContain("<Badge>Protocol</Badge>");

        // __call__ method should be rendered (it's not __init__)
        expect(result).toContain('id="nemo_rl-algorithms-interfaces-LossFunction-__call__"');
    });

    it("OverridesError: EXCEPTION with base class", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["OverridesError"]!;
        const result = renderClassDetailed(cls, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-utils-config-OverridesError">');

        // Exception badge
        expect(result).toContain("<Badge>Exception</Badge>");

        // Base class (Exception is not in the filter list, so it should show)
        expect(result).toContain("**Bases:**");
        expect(result).toContain("`Exception`");
    });

    it("FLOPSConfig: DATACLASS with attributes", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["FLOPSConfig"]!;
        const result = renderClassDetailed(cls, emptyCtx());

        // Anchor
        expect(result).toContain('<Anchor id="nemo_rl-utils-flops_formulas-FLOPSConfig">');

        // Dataclass badge
        expect(result).toContain("<Badge>Dataclass</Badge>");

        // Constructor params in signature
        expect(result).toContain("class nemo_rl.utils.flops_formulas.FLOPSConfig");
    });

    it("AbstractClass (SequencePacker): abstract class with methods", () => {
        // biome-ignore lint/style/noNonNullAssertion: fixture lookup
        const cls = NEMO_CLASSES["AbstractClass"]!;
        const result = renderClassDetailed(cls, emptyCtx());

        // Abstract badge
        expect(result).toContain("<Badge>Abstract</Badge>");

        // Should have methods
        expect(result).toContain("<Anchor id=");
    });
});
