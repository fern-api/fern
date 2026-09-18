import type { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createLibrarySymbolRenderer } from "../symbols/createLibrarySymbolRenderer.js";
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
    functions: [cppFunction({})],
    enums: [],
    typedefs: [cppTypedef],
    variables: [],
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
        expect(result.anchorId).toBe(generateAnchorId("cuopt.solve"));
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
        expect(result.anchorId).toBe("cuoptgetintsize");
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
        expect(result.anchorId).toBe("cuoptintt");
        expect(result.mdx.startsWith("### `cuopt_int_t` [#cuoptintt]")).toBe(true);
        expect(result.mdx).toContain("The integer type used by the solver.");
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
    });

    it("renders a single method by qualified name", () => {
        const result = renderLibrarySymbol(persistedCpp, {
            name: "cuopt::Solver::reset",
            heading: 3,
            members: undefined,
            linkToGeneratedPages: true
        });
        expect(result.anchorId).toBe("reset");
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

    it("createLibrarySymbolRenderer resolves libraries from persisted IR and rejects unknown libraries", async () => {
        const pyDir = AbsoluteFilePath.of(join(tmpDir, "py"));
        const cDir = AbsoluteFilePath.of(join(tmpDir, "c"));
        await writeLibraryIr({ outputDir: pyDir, persisted: persistedPython });
        await writeLibraryIr({ outputDir: cDir, persisted: persistedCpp });

        const dirs = new Map<string, AbsoluteFilePath>([
            ["cuopt-python", pyDir],
            ["cuopt-c", cDir]
        ]);
        const render = createLibrarySymbolRenderer({
            getLibraryOutputDir: (lib) => dirs.get(lib),
            hasGeneratedPages: () => true,
            knownLibraries: () => [...dirs.keys()]
        });

        const py = await render({
            library: "cuopt-python",
            name: "cuopt.solve",
            heading: undefined,
            members: undefined
        });
        expect(py.mdx).toContain("## `solve`");
        expect(py.anchorId).toBe("cuopt-solve");

        const c = await render({
            library: "cuopt-c",
            name: "cuOptGetIntSize",
            heading: undefined,
            members: undefined
        });
        expect(c.mdx).toContain("## `cuOptGetIntSize` [#cuoptgetintsize]");
        expect(c.anchorId).toBe("cuoptgetintsize");

        await expect(render({ library: "nope", name: "x", heading: undefined, members: undefined })).rejects.toThrow(
            /Unknown library 'nope'. Libraries configured in docs.yml: cuopt-python, cuopt-c/
        );
    });
});
