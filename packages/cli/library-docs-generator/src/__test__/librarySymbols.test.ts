import type { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLibrarySymbolRenderer, type LibrarySymbolSource } from "../symbols/createLibrarySymbolRenderer.js";
import {
    getLibraryIrPath,
    LIBRARY_IR_SCHEMA_VERSION,
    LibraryIrReadError,
    type PersistedLibraryIr,
    readLibraryIr,
    writeLibraryIr
} from "../symbols/libraryIrFile.js";
import { LibrarySymbolError, renderLibrarySymbol } from "../symbols/renderLibrarySymbol.js";
import type {
    CppClassIr,
    CppDocstringIr,
    CppFunctionIr,
    CppLibraryDocsIr,
    CppMacroIr,
    CppNamespaceIr,
    CppTypedefIr
} from "../types/CppLibraryDocsIr.js";
import { generateAnchorId } from "../utils/mdx.js";

// ---------------------------------------------------------------------------
// Python fixture
// ---------------------------------------------------------------------------

function pyFunction(overrides: Partial<FdrAPI.libraryDocs.PythonFunctionIr>): FdrAPI.libraryDocs.PythonFunctionIr {
    return {
        name: "func",
        path: "cuopt.func",
        signature: "def func()",
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

function pyClass(overrides: Partial<FdrAPI.libraryDocs.PythonClassIr>): FdrAPI.libraryDocs.PythonClassIr {
    return {
        name: "SolverSettings",
        path: "cuopt.linear_programming.SolverSettings",
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

function pyModule(overrides: Partial<FdrAPI.libraryDocs.PythonModuleIr>): FdrAPI.libraryDocs.PythonModuleIr {
    return {
        name: "cuopt",
        path: "cuopt",
        docstring: undefined,
        submodules: [],
        classes: [],
        functions: [],
        attributes: [],
        ...overrides
    } as FdrAPI.libraryDocs.PythonModuleIr;
}

const solverSettings = pyClass({
    methods: [
        pyFunction({
            name: "set_parameter",
            path: "cuopt.linear_programming.SolverSettings.set_parameter",
            signature: "def set_parameter(self, name: str, value: float) -> None"
        }),
        pyFunction({
            name: "get_parameter",
            path: "cuopt.linear_programming.SolverSettings.get_parameter",
            signature: "def get_parameter(self, name: str) -> float"
        }),
        pyFunction({
            name: "reset",
            path: "cuopt.linear_programming.SolverSettings.reset",
            signature: "def reset(self) -> None"
        }),
        pyFunction({
            name: "copy",
            path: "cuopt.linear_programming.SolverSettings.copy",
            signature: "def copy(self) -> SolverSettings",
            returnTypeInfo: {
                display: "SolverSettings",
                resolvedPath: "cuopt.linear_programming.SolverSettings",
                basePath: "cuopt.linear_programming.SolverSettings"
            }
        })
    ]
});

const pythonIr = {
    rootModule: pyModule({
        functions: [
            pyFunction({
                name: "solve",
                path: "cuopt.solve",
                signature: "def solve(model) -> SolverSettings",
                returnTypeInfo: {
                    display: "SolverSettings",
                    resolvedPath: "cuopt.linear_programming.SolverSettings",
                    basePath: "cuopt.linear_programming.SolverSettings"
                }
            })
        ],
        submodules: [
            pyModule({
                name: "linear_programming",
                path: "cuopt.linear_programming",
                classes: [solverSettings]
            })
        ]
    })
} as FdrAPI.libraryDocs.PythonLibraryDocsIr;

const persistedPython: PersistedLibraryIr = {
    schemaVersion: LIBRARY_IR_SCHEMA_VERSION,
    lang: "python",
    library: "cuopt-python",
    ir: pythonIr
};

// ---------------------------------------------------------------------------
// C++ fixture
// ---------------------------------------------------------------------------

function cppDocstring(summary: string): CppDocstringIr {
    return {
        summary: [{ type: "text", text: summary }],
        description: [],
        params: [],
        templateParamsDoc: [],
        returns: undefined,
        raises: [],
        examples: [],
        notes: [],
        warnings: [],
        remarks: [],
        preconditions: [],
        postconditions: [],
        seeAlso: [],
        sinceVersion: undefined,
        deprecated: undefined
    };
}

function cppFunction(overrides: Partial<CppFunctionIr>): CppFunctionIr {
    return {
        name: "cuOptGetIntSize",
        path: "cuOptGetIntSize",
        signature: "int8_t cuOptGetIntSize(void)",
        templateParams: [],
        parameters: [],
        returnType: undefined,
        docstring: cppDocstring("Returns the size in bytes of cuopt_int_t."),
        isStatic: false,
        isConst: false,
        isConstexpr: false,
        isVolatile: false,
        isInline: false,
        isExplicit: false,
        isNoexcept: false,
        noexceptExpression: undefined,
        isNoDiscard: false,
        virtuality: "non-virtual",
        refQualifier: undefined,
        requiresClause: undefined,
        isDeleted: false,
        ...overrides
    };
}

function cppClass(overrides: Partial<CppClassIr>): CppClassIr {
    return {
        name: "Solver",
        path: "cuopt::Solver",
        kind: "class",
        templateParams: [],
        baseClasses: [],
        derivedClasses: [],
        docstring: cppDocstring("A solver."),
        isAbstract: false,
        isFinal: false,
        includeHeader: undefined,
        methods: [],
        staticMethods: [],
        friendFunctions: [],
        typedefs: [],
        memberVariables: [],
        enums: [],
        innerClasses: [],
        relatedMemberRefs: [],
        sectionLabels: {},
        ...overrides
    };
}

const cppTypedef: CppTypedefIr = {
    name: "cuopt_int_t",
    path: "cuopt_int_t",
    typeInfo: { parts: [], display: "int32_t", resolvedPath: undefined, basePath: undefined },
    templateParams: [],
    docstring: cppDocstring("The integer type used by the solver.")
};

const cppMacro: CppMacroIr = {
    name: "CUOPT_ABSOLUTE_PRIMAL_TOLERANCE",
    path: "CUOPT_ABSOLUTE_PRIMAL_TOLERANCE",
    parameters: undefined,
    initializer: '"absolute_primal_tolerance"',
    docstring: cppDocstring("Absolute primal tolerance parameter name.")
};

const cuoptNamespace: CppNamespaceIr = {
    name: "cuopt",
    path: "cuopt",
    docstring: undefined,
    classes: [
        cppClass({
            methods: [
                cppFunction({ name: "solve", path: "cuopt::Solver::solve", signature: "void solve()" }),
                cppFunction({ name: "reset", path: "cuopt::Solver::reset", signature: "void reset()" })
            ]
        })
    ],
    functions: [],
    enums: [],
    typedefs: [],
    variables: [],
    concepts: [],
    namespaces: []
};

const cppNamespace: CppNamespaceIr = {
    name: "",
    path: "",
    docstring: undefined,
    classes: [],
    functions: [
        cppFunction({}),
        cppFunction({
            name: "cuOptNewEngine",
            path: "cuOptNewEngine",
            signature: "cuopt::Solver* cuOptNewEngine(void)",
            returnType: {
                parts: [{ text: "cuopt::Solver", refid: "classcuopt_1_1Solver", kindref: "compound" }, " *"],
                display: "cuopt::Solver *",
                resolvedPath: "cuopt::Solver",
                basePath: "cuopt::Solver"
            },
            docstring: cppDocstring("Creates a solver.")
        })
    ],
    enums: [],
    typedefs: [cppTypedef],
    variables: [],
    macros: [cppMacro],
    concepts: [],
    namespaces: [cuoptNamespace]
};

const cppIr: CppLibraryDocsIr = {
    metadata: { packageName: "cuopt", language: "cpp", sourceUrl: undefined, branch: undefined, version: "1.0.0" },
    rootNamespace: cppNamespace,
    groups: []
};

const persistedCpp: PersistedLibraryIr = {
    schemaVersion: LIBRARY_IR_SCHEMA_VERSION,
    lang: "cpp",
    library: "cuopt-c",
    ir: cppIr
};

// ---------------------------------------------------------------------------
// renderLibrarySymbol
// ---------------------------------------------------------------------------

describe("renderLibrarySymbol (python)", () => {
    it("renders a module-level function with the generated-page anchor", () => {
        const result = renderLibrarySymbol(persistedPython, {
            name: "cuopt.solve",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorIds).toEqual([generateAnchorId("cuopt.solve")]);
        expect(result.mdx).toContain("## `solve`");
        expect(result.mdx).toContain('<Anchor id="cuopt-solve">');
        expect(result.mdx).toContain("cuopt.solve()");
    });

    it("renders a class and honours the heading level", () => {
        const result = renderLibrarySymbol(persistedPython, {
            name: "cuopt.linear_programming.SolverSettings",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.mdx.startsWith("### `SolverSettings`")).toBe(true);
        expect(result.mdx).toContain('<Anchor id="cuopt-linear_programming-SolverSettings">');
        expect(result.mdx).toContain("set_parameter");
        expect(result.mdx).toContain("get_parameter");
        expect(result.mdx).toContain("reset");
    });

    it("filters class members with the allowlist", () => {
        const result = renderLibrarySymbol(persistedPython, {
            name: "cuopt.linear_programming.SolverSettings",
            heading: 2,
            members: ["set_parameter", "get_parameter"],
            linkToGeneratedPages: true
        });
        expect(result.mdx).toContain("set_parameter");
        expect(result.mdx).toContain("get_parameter");
        expect(result.mdx).not.toContain("reset");
    });

    it("renders a single method", () => {
        const result = renderLibrarySymbol(persistedPython, {
            name: "cuopt.linear_programming.SolverSettings.set_parameter",
            heading: 4,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.mdx.startsWith("#### `set_parameter`")).toBe(true);
        expect(result.mdx).toContain('<Anchor id="cuopt-linear_programming-SolverSettings-set_parameter">');
        expect(result.mdx).not.toContain("get_parameter");
    });

    it("throws an actionable error for unknown symbols, suggesting close matches", () => {
        expect(() =>
            renderLibrarySymbol(persistedPython, {
                name: "cuopt.SolverSettings",
                heading: 2,
                members: undefined,
                linkToGeneratedPages: true
            })
        ).toThrow(
            /Symbol 'cuopt\.SolverSettings' was not found.*Did you mean: 'cuopt\.linear_programming\.SolverSettings'/
        );
    });

    it("resolves symbols by their public re-export path", () => {
        const client = pyClass({
            name: "Client",
            path: "pkg.grpc.grpc_client.Client",
            methods: [
                pyFunction({
                    name: "submit",
                    path: "pkg.grpc.grpc_client.Client.submit",
                    signature: "def submit(self, model) -> str"
                })
            ]
        });
        const reexported: PersistedLibraryIr = {
            schemaVersion: LIBRARY_IR_SCHEMA_VERSION,
            lang: "python",
            library: "pkg",
            ir: {
                rootModule: pyModule({
                    name: "pkg",
                    path: "pkg",
                    submodules: [
                        pyModule({
                            name: "grpc",
                            path: "pkg.grpc",
                            classes: [client],
                            submodules: [
                                pyModule({ name: "grpc_client", path: "pkg.grpc.grpc_client", classes: [client] })
                            ]
                        })
                    ]
                })
            } as FdrAPI.libraryDocs.PythonLibraryDocsIr
        };
        const viaPublic = renderLibrarySymbol(reexported, {
            name: "pkg.grpc.Client",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: false
        });
        const viaDefinition = renderLibrarySymbol(reexported, {
            name: "pkg.grpc.grpc_client.Client",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: false
        });
        expect(viaPublic.mdx).toBe(viaDefinition.mdx);
        const method = renderLibrarySymbol(reexported, {
            name: "pkg.grpc.Client.submit",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: false
        });
        expect(method.mdx).toContain('<Anchor id="pkg-grpc-grpc_client-Client-submit">');
    });

    it("throws for unknown members and lists the available ones", () => {
        expect(() =>
            renderLibrarySymbol(persistedPython, {
                name: "cuopt.linear_programming.SolverSettings",
                heading: 2,
                members: ["nope"],
                linkToGeneratedPages: true
            })
        ).toThrow(/Unknown member\(s\) 'nope'.*Available members: set_parameter, get_parameter, reset/);
    });

    it("rejects members on non-class symbols", () => {
        expect(() =>
            renderLibrarySymbol(persistedPython, {
                name: "cuopt.solve",
                heading: 2,
                members: ["x"],
                linkToGeneratedPages: true
            })
        ).toThrow(LibrarySymbolError);
    });

    it("links referenced types to generated pages only when those pages exist", () => {
        const linked = renderLibrarySymbol(persistedPython, {
            name: "cuopt.solve",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(linked.mdx).toMatch(/links=\{.*cuopt\.linear_programming\.SolverSettings/);

        const unlinked = renderLibrarySymbol(persistedPython, {
            name: "cuopt.solve",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: false
        });
        expect(unlinked.mdx).toContain("SolverSettings");
        expect(unlinked.mdx).not.toContain("links={");
    });

    it("links types as relative .mdx paths into the generated output when given the output dir", () => {
        const result = renderLibrarySymbol(persistedPython, {
            name: "cuopt.solve",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true,
            relativePathToOutputDir: "../generated/python"
        });
        expect(result.mdx).toContain(
            '"cuopt.linear_programming.SolverSettings":"../generated/python/cuopt-python/cuopt/linear_programming.mdx#cuopt-linear_programming-SolverSettings"'
        );
    });

    it("never links a type to a same-page anchor, since the anchor lives on the generated page", () => {
        const result = renderLibrarySymbol(persistedPython, {
            name: "cuopt.linear_programming.SolverSettings",
            heading: 2,
            members: ["copy"],
            linkToGeneratedPages: true,
            relativePathToOutputDir: "."
        });
        expect(result.mdx).not.toMatch(/"cuopt\.linear_programming\.SolverSettings":"#/);
        expect(result.mdx).toContain(
            '"cuopt.linear_programming.SolverSettings":"./cuopt-python/cuopt/linear_programming.mdx#cuopt-linear_programming-SolverSettings"'
        );
    });

    it("explains that modules must be included member by member", () => {
        expect(() =>
            renderLibrarySymbol(persistedPython, {
                name: "cuopt.linear_programming",
                heading: 2,
                members: undefined,
                linkToGeneratedPages: true
            })
        ).toThrow(/'cuopt.linear_programming' is a module.*'cuopt.linear_programming.SolverSettings'/);
    });
});

describe("renderLibrarySymbol (cpp)", () => {
    it("renders a free C function with the generated-page anchor", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuOptGetIntSize",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorIds).toEqual(["cuoptgetintsize"]);
        expect(result.mdx.startsWith("## `cuOptGetIntSize` [#cuoptgetintsize]")).toBe(true);
        expect(result.mdx).not.toContain("---\ntitle:");
        expect(result.mdx).toContain("cuOptGetIntSize");
        expect(result.mdx).toContain("Returns the size in bytes of cuopt_int_t.");
    });

    it("renders a typedef", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuopt_int_t",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorIds).toEqual(["cuoptintt"]);
        expect(result.mdx.startsWith("### `cuopt_int_t` [#cuoptintt]")).toBe(true);
        expect(result.mdx).toContain("The integer type used by the solver.");
    });

    it("renders a macro", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "CUOPT_ABSOLUTE_PRIMAL_TOLERANCE",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorIds).toEqual(["cuoptabsoluteprimaltolerance"]);
        expect(result.mdx.startsWith("### `CUOPT_ABSOLUTE_PRIMAL_TOLERANCE` [#cuoptabsoluteprimaltolerance]")).toBe(
            true
        );
        expect(result.mdx).toContain('#define CUOPT_ABSOLUTE_PRIMAL_TOLERANCE "absolute_primal_tolerance"');
        expect(result.mdx).toContain("Absolute primal tolerance parameter name.");
    });

    it("renders a class with a member allowlist", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuopt::Solver",
            heading: 2,
            members: ["solve"],
            linkToGeneratedPages: true
        });
        expect(result.mdx).toContain("solve");
        expect(result.mdx).not.toContain("reset");
        expect(result.anchorIds).toContain("solve");
        expect(result.anchorIds).not.toContain("reset");
    });

    it("nests the generated body headings under the requested heading level", () => {
        const h2 = renderLibrarySymbol(persistedCpp, {
            name: "cuopt::Solver",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true
        });
        const h4 = renderLibrarySymbol(persistedCpp, {
            name: "cuopt::Solver",
            heading: 4,
            members: undefined,
            linkToGeneratedPages: true
        });
        const levels = (mdx: string) => mdx.split("\n").flatMap((l) => /^(#{1,6}) /.exec(l)?.[1]?.length ?? []);
        const [h2Top, ...h2Body] = levels(h2.mdx);
        const [h4Top, ...h4Body] = levels(h4.mdx);
        expect(h2Top).toBe(2);
        expect(h4Top).toBe(4);
        expect(h2Body.length).toBeGreaterThan(0);
        expect(Math.min(...h2Body)).toBeGreaterThan(2);
        expect(h4Body).toEqual(h2Body.map((l) => Math.min(6, l + 2)));
        expect(h4.anchorIds).toEqual(h2.anchorIds);
    });

    it("keeps positional sectionLabels attached to the retained methods when filtering", () => {
        const cls = cppClass({
            path: "labels::Api",
            name: "Api",
            methods: [
                cppFunction({ name: "open", path: "labels::Api::open", signature: "void open()" }),
                cppFunction({ name: "close", path: "labels::Api::close", signature: "void close()" })
            ],
            sectionLabels: { refid_open: "Lifecycle", refid_close: "Cleanup" }
        });
        const ir: CppLibraryDocsIr = {
            ...cppIr,
            rootNamespace: { ...cppNamespace, classes: [cls], namespaces: [] }
        };
        const result = renderLibrarySymbol(
            { ...persistedCpp, ir },
            { name: "labels::Api", heading: 2, members: ["close"], linkToGeneratedPages: true }
        );
        expect(result.mdx).toContain("Cleanup");
        expect(result.mdx).not.toContain("Lifecycle");
    });

    it("keeps distinct positional labels for retained overloads sharing a path", () => {
        const cls = cppClass({
            path: "labels::Api",
            name: "Api",
            methods: [
                cppFunction({ name: "open", path: "labels::Api::open", signature: "void open()" }),
                cppFunction({ name: "scan", path: "labels::Api::scan", signature: "void scan(int)" }),
                cppFunction({ name: "scan", path: "labels::Api::scan", signature: "void scan(int, int)" })
            ],
            sectionLabels: { refid_open: "Lifecycle", refid_scan1: "Single value", refid_scan2: "Multiple values" }
        });
        const ir: CppLibraryDocsIr = {
            ...cppIr,
            rootNamespace: { ...cppNamespace, classes: [cls], namespaces: [] }
        };
        const result = renderLibrarySymbol(
            { ...persistedCpp, ir },
            { name: "labels::Api", heading: 2, members: ["scan"], linkToGeneratedPages: true }
        );
        expect(result.mdx).toContain("Single value");
        expect(result.mdx).toContain("Multiple values");
        expect(result.mdx).not.toContain("Lifecycle");
    });

    it("reports every member anchor emitted by a class render", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuopt::Solver",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorIds[0]).toBe("solver");
        expect(result.anchorIds).toEqual(expect.arrayContaining(["solver", "solve", "reset"]));
    });

    it("renders a single method by qualified name", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuopt::Solver::reset",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorIds).toEqual(["reset"]);
        expect(result.mdx).toContain("void reset()");
        expect(result.mdx).not.toContain("void solve()");
    });

    it("throws an actionable error for unknown symbols", () => {
        expect(() =>
            renderLibrarySymbol(persistedCpp, {
                name: "Solver",
                heading: 2,
                members: undefined,
                linkToGeneratedPages: true
            })
        ).toThrow(/Symbol 'Solver' was not found.*Did you mean: 'cuopt::Solver'/);
    });

    it("explains that namespaces must be included member by member", () => {
        expect(() =>
            renderLibrarySymbol(persistedCpp, {
                name: "cuopt",
                heading: 2,
                members: undefined,
                linkToGeneratedPages: true
            })
        ).toThrow(/'cuopt' is a namespace.*'cuopt::Solver'/);
    });
});

// ---------------------------------------------------------------------------
// IR persistence + renderer factory
// ---------------------------------------------------------------------------

describe("renderLibrarySymbol (cpp) type links", () => {
    it("links referenced types to the generated MDX files relative to the output dir", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuOptNewEngine",
            heading: 2,
            members: undefined,
            linkToGeneratedPages: true,
            relativePathToOutputDir: "../generated/c"
        });
        expect(result.mdx).toContain('links={{"Solver": "../generated/c/cuopt/classes/Solver.mdx"}}');
    });

    it("renders types as plain code without the output dir or generated pages", () => {
        for (const request of [
            { linkToGeneratedPages: true },
            { linkToGeneratedPages: false, relativePathToOutputDir: "../generated/c" }
        ]) {
            const result = renderLibrarySymbol(persistedCpp, {
                name: "cuOptNewEngine",
                heading: 2,
                members: undefined,
                ...request
            });
            expect(result.mdx).toContain("cuOptNewEngine");
            expect(result.mdx).not.toContain(".mdx");
        }
    });
});

describe("library IR persistence", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "library-ir-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("writes .fern/library-ir.json with schema version and lang, and reads it back", async () => {
        const outputDir = AbsoluteFilePath.of(tmpDir);
        const irPath = await writeLibraryIr({ outputDir, persisted: persistedPython });
        expect(irPath).toBe(join(tmpDir, ".fern", "library-ir.json"));
        expect(existsSync(irPath)).toBe(true);

        const raw = JSON.parse(readFileSync(irPath, "utf-8"));
        expect(raw.schemaVersion).toBe(LIBRARY_IR_SCHEMA_VERSION);
        expect(raw.lang).toBe("python");
        expect(raw.library).toBe("cuopt-python");

        const read = await readLibraryIr(outputDir);
        expect(read).toEqual(persistedPython);
    });

    it("rejects a missing file with a hint to run md generate", async () => {
        await expect(readLibraryIr(AbsoluteFilePath.of(tmpDir))).rejects.toThrow(/Run 'fern docs md generate' first/);
    });

    it("rejects an unsupported schema version", async () => {
        const outputDir = AbsoluteFilePath.of(tmpDir);
        const irPath = getLibraryIrPath(outputDir);
        await writeLibraryIr({ outputDir, persisted: persistedCpp });
        writeFileSync(irPath, JSON.stringify({ ...persistedCpp, schemaVersion: 999 }));
        await expect(readLibraryIr(outputDir)).rejects.toBeInstanceOf(LibraryIrReadError);
        await expect(readLibraryIr(outputDir)).rejects.toThrow(/schema version 999/);
    });

    it("createLibrarySymbolRenderer resolves libraries per page and rejects unknown libraries", async () => {
        const pyDir = AbsoluteFilePath.of(join(tmpDir, "py"));
        const cDir = AbsoluteFilePath.of(join(tmpDir, "c"));
        await writeLibraryIr({ outputDir: pyDir, persisted: persistedPython });
        await writeLibraryIr({ outputDir: cDir, persisted: persistedCpp });

        const sources = new Map<string, LibrarySymbolSource>([
            ["cuopt-python", { outputDir: pyDir, lang: "python", generatesPages: true }],
            ["cuopt-c", { outputDir: cDir, lang: "cpp", generatesPages: true }]
        ]);
        const page = AbsoluteFilePath.of("/docs/pages/a.mdx");
        const render = createLibrarySymbolRenderer({
            getLibrarySource: (lib) => sources.get(lib),
            knownLibraries: () => [...sources.keys()]
        });

        const py = await render(
            { library: "cuopt-python", name: "cuopt.solve", heading: undefined, members: undefined },
            page
        );
        expect(py.mdx).toContain("## `solve`");
        expect(py.anchorIds).toEqual(["cuopt-solve"]);

        const c = await render(
            { library: "cuopt-c", name: "cuOptGetIntSize", heading: undefined, members: undefined },
            page
        );
        expect(c.mdx).toContain("## `cuOptGetIntSize` [#cuoptgetintsize]");
        expect(c.anchorIds).toEqual(["cuoptgetintsize"]);

        await expect(
            render({ library: "nope", name: "x", heading: undefined, members: undefined }, page)
        ).rejects.toThrow(/Unknown library 'nope'. Libraries configured in docs.yml: cuopt-python, cuopt-c/);
    });

    it("createLibrarySymbolRenderer links types relative to the authored page's directory", async () => {
        const pyDir = AbsoluteFilePath.of(join(tmpDir, "generated", "python"));
        await writeLibraryIr({ outputDir: pyDir, persisted: persistedPython });
        const render = createLibrarySymbolRenderer({
            getLibrarySource: () => ({ outputDir: pyDir, lang: "python", generatesPages: true }),
            knownLibraries: () => ["cuopt-python"]
        });
        const page = AbsoluteFilePath.of(join(tmpDir, "authored", "lp", "reference.mdx"));
        const result = await render(
            { library: "cuopt-python", name: "cuopt.solve", heading: undefined, members: undefined },
            page
        );
        expect(result.mdx).toContain(
            '"cuopt.linear_programming.SolverSettings":"../../generated/python/cuopt-python/cuopt/linear_programming.mdx#cuopt-linear_programming-SolverSettings"'
        );
    });

    it("createLibrarySymbolRenderer resolves the same library name to different IR per page", async () => {
        const v1Dir = AbsoluteFilePath.of(join(tmpDir, "v1"));
        const v2Dir = AbsoluteFilePath.of(join(tmpDir, "v2"));
        await writeLibraryIr({ outputDir: v1Dir, persisted: { ...persistedPython, library: "sdk" } });
        await writeLibraryIr({ outputDir: v2Dir, persisted: { ...persistedCpp, library: "sdk" } });

        const v1Page = AbsoluteFilePath.of("/checkouts/v1/fern/pages/a.mdx");
        const v2Page = AbsoluteFilePath.of("/checkouts/v2/fern/pages/a.mdx");
        const render = createLibrarySymbolRenderer({
            getLibrarySource: (lib, page) =>
                lib !== "sdk"
                    ? undefined
                    : page === v1Page
                      ? { outputDir: v1Dir, lang: "python", generatesPages: true }
                      : { outputDir: v2Dir, lang: "cpp", generatesPages: true },
            knownLibraries: () => ["sdk"]
        });

        const v1 = await render(
            { library: "sdk", name: "cuopt.solve", heading: undefined, members: undefined },
            v1Page
        );
        expect(v1.anchorIds).toEqual(["cuopt-solve"]);
        const v2 = await render(
            { library: "sdk", name: "cuOptGetIntSize", heading: undefined, members: undefined },
            v2Page
        );
        expect(v2.anchorIds).toEqual(["cuoptgetintsize"]);
    });

    it("createLibrarySymbolRenderer rejects persisted IR whose library or language does not match", async () => {
        const dir = AbsoluteFilePath.of(join(tmpDir, "stale"));
        await writeLibraryIr({ outputDir: dir, persisted: persistedPython });
        const page = AbsoluteFilePath.of("/docs/pages/a.mdx");
        const request = { name: "cuopt.solve", heading: undefined, members: undefined };

        const staleName = createLibrarySymbolRenderer({
            getLibrarySource: () => ({ outputDir: dir, lang: "python", generatesPages: true }),
            knownLibraries: () => ["cuopt-c"]
        });
        await expect(staleName({ ...request, library: "cuopt-c" }, page)).rejects.toThrow(
            /was generated for library 'cuopt-python', not 'cuopt-c'. Re-run 'fern docs md generate'/
        );

        const wrongLang = createLibrarySymbolRenderer({
            getLibrarySource: () => ({ outputDir: dir, lang: "cpp", generatesPages: true }),
            knownLibraries: () => ["cuopt-python"]
        });
        await expect(wrongLang({ ...request, library: "cuopt-python" }, page)).rejects.toThrow(
            /is 'python', but library 'cuopt-python' is configured with language 'cpp'/
        );

        const ok = createLibrarySymbolRenderer({
            getLibrarySource: () => ({ outputDir: dir, lang: undefined, generatesPages: true }),
            knownLibraries: () => ["cuopt-python"]
        });
        await expect(ok({ ...request, library: "cuopt-python" }, page)).resolves.toBeDefined();
    });

    it("createLibrarySymbolRenderer warns once per library when output.pages is false", async () => {
        const dir = AbsoluteFilePath.of(join(tmpDir, "no-pages"));
        await writeLibraryIr({ outputDir: dir, persisted: persistedPython });
        const page = AbsoluteFilePath.of("/docs/pages/a.mdx");
        const warnings: string[] = [];

        const render = createLibrarySymbolRenderer({
            getLibrarySource: () => ({ outputDir: dir, lang: "python", generatesPages: false }),
            knownLibraries: () => ["cuopt-python"],
            onWarning: (message) => warnings.push(message)
        });
        const rendered = await render(
            { library: "cuopt-python", name: "cuopt.solve", heading: undefined, members: undefined },
            page
        );
        await render(
            {
                library: "cuopt-python",
                name: "cuopt.linear_programming.SolverSettings",
                heading: undefined,
                members: undefined
            },
            page
        );

        expect(rendered.mdx).not.toContain("](");
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("Library 'cuopt-python' is configured with 'output.pages: false'");
    });

    it("createLibrarySymbolRenderer does not warn when output.pages is true", async () => {
        const dir = AbsoluteFilePath.of(join(tmpDir, "with-pages"));
        await writeLibraryIr({ outputDir: dir, persisted: persistedPython });
        const warnings: string[] = [];

        const render = createLibrarySymbolRenderer({
            getLibrarySource: () => ({ outputDir: dir, lang: "python", generatesPages: true }),
            knownLibraries: () => ["cuopt-python"],
            onWarning: (message) => warnings.push(message)
        });
        await render(
            { library: "cuopt-python", name: "cuopt.solve", heading: undefined, members: undefined },
            AbsoluteFilePath.of("/docs/pages/a.mdx")
        );

        expect(warnings).toEqual([]);
    });
});
