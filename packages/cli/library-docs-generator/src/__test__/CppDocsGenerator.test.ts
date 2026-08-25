import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateCpp } from "../CppDocsGenerator.js";
import type {
    CppClassIr,
    CppConceptIr,
    CppDocstringIr,
    CppFunctionIr,
    CppGroupIr,
    CppLibraryDocsIr,
    CppNamespaceIr,
    IrMetadata
} from "../types/CppLibraryDocsIr.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const DEFAULT_METADATA: IrMetadata = {
    packageName: "CUB",
    language: "cpp",
    sourceUrl: undefined,
    branch: undefined,
    version: "2.0.0"
};

function makeDocstring(overrides: Partial<CppDocstringIr> = {}): CppDocstringIr {
    return {
        summary: [],
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
        deprecated: undefined,
        ...overrides
    };
}

function makeClass(overrides: Partial<CppClassIr>): CppClassIr {
    return {
        name: "MyClass",
        path: "cub::MyClass",
        kind: "class",
        templateParams: [],
        baseClasses: [],
        derivedClasses: [],
        docstring: makeDocstring(),
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

function makeConcept(overrides: Partial<CppConceptIr>): CppConceptIr {
    return {
        name: "MyConcept",
        path: "cub::MyConcept",
        templateParams: [],
        constraintExpression: undefined,
        docstring: makeDocstring(),
        ...overrides
    };
}

function makeFunction(overrides: Partial<CppFunctionIr>): CppFunctionIr {
    return {
        name: "my_func",
        path: "cub::my_func",
        signature: "void my_func()",
        templateParams: [],
        parameters: [],
        returnType: undefined,
        docstring: makeDocstring(),
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

function makeGroup(overrides: Partial<CppGroupIr>): CppGroupIr {
    return {
        id: "group__my__group",
        name: "my_group",
        title: "My Group",
        docstring: undefined,
        memberRefs: [],
        innerClassRefs: [],
        innerNamespaceRefs: [],
        classes: [],
        functions: [],
        enums: [],
        typedefs: [],
        variables: [],
        subgroups: [],
        ...overrides
    };
}

function makeNamespace(overrides: Partial<CppNamespaceIr>): CppNamespaceIr {
    return {
        name: "",
        path: "",
        docstring: undefined,
        classes: [],
        functions: [],
        enums: [],
        typedefs: [],
        variables: [],
        concepts: [],
        namespaces: [],
        ...overrides
    };
}

function makeIr(
    rootNamespace: CppNamespaceIr,
    metadata?: Partial<IrMetadata>,
    groups: CppGroupIr[] = []
): CppLibraryDocsIr {
    return {
        metadata: { ...DEFAULT_METADATA, ...metadata },
        rootNamespace,
        groups
    };
}

/** Recursively collect all .mdx files under a directory. */
function collectMdxFiles(dir: string): string[] {
    const results: string[] = [];
    if (!existsSync(dir)) {
        return results;
    }
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("generateCpp()", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "cpp-gen-test-"));
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    // ------------------------------------------------------------------
    // 1. Phantom namespace filtering
    // ------------------------------------------------------------------
    it("filters out classes whose path does not start with the root namespace prefix", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                classes: [
                    makeClass({ name: "BlockReduce", path: "cub::BlockReduce" }),
                    makeClass({ name: "BlockScan", path: "cub::BlockScan" })
                ],
                namespaces: [
                    makeNamespace({
                        name: "std",
                        path: "std",
                        classes: [makeClass({ name: "tuple", path: "std::tuple" })]
                    })
                ]
            })
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        // Only the 2 cub:: classes should produce pages; std::tuple is filtered
        expect(result.pageCount).toBe(2);
        const mdxFiles = collectMdxFiles(tmpDir);
        expect(mdxFiles).toHaveLength(2);

        const filenames = mdxFiles.map((f) => f.split("/").pop());
        expect(filenames).toContain("BlockReduce.mdx");
        expect(filenames).toContain("BlockScan.mdx");
    });

    // ------------------------------------------------------------------
    // 2. Collision resolution for template specializations
    // ------------------------------------------------------------------
    it("resolves filename collisions for template specializations", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                classes: [
                    makeClass({ name: "Foo", path: "cub::Foo" }),
                    makeClass({ name: "Foo< T, false >", path: "cub::Foo< T, false >" })
                ]
            })
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        expect(result.pageCount).toBe(2);
        const mdxFiles = collectMdxFiles(tmpDir);
        expect(mdxFiles).toHaveLength(2);

        const filenames = mdxFiles.map((f) => f.split("/").pop()).sort();
        // The base class gets no suffix, the specialization gets sanitized template args
        expect(filenames).toContain("Foo.mdx");
        expect(filenames).toContain("Foo_T_false.mdx");
    });

    // ------------------------------------------------------------------
    // 3. Meta derivation / frontmatter
    // ------------------------------------------------------------------
    it("writes correct title and description in frontmatter", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                classes: [
                    makeClass({
                        name: "BlockReduce",
                        path: "cub::BlockReduce",
                        docstring: makeDocstring({
                            summary: [{ type: "text", text: "A block-level reduction primitive." }]
                        })
                    })
                ]
            })
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        expect(result.pageCount).toBe(1);
        const filePath = result.writtenFiles[0];
        expect(filePath).toBeDefined();
        const content = readFileSync(filePath as string, "utf-8");

        // Frontmatter should contain the qualified path as title
        expect(content).toMatch(/^---\n/);
        expect(content).toContain("title: cub::BlockReduce");
        expect(content).toContain('description: "A block-level reduction primitive."');
    });

    // ------------------------------------------------------------------
    // 4. Empty namespace produces 0 files
    // ------------------------------------------------------------------
    it("produces 0 files for an empty namespace", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                classes: [],
                concepts: [],
                namespaces: []
            })
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        expect(result.pageCount).toBe(0);
        expect(result.writtenFiles).toHaveLength(0);
        expect(collectMdxFiles(tmpDir)).toHaveLength(0);
    });

    // ------------------------------------------------------------------
    // 5. Concept page renders valid MDX
    // ------------------------------------------------------------------
    it("generates a valid MDX page for a concept compound", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                concepts: [
                    makeConcept({
                        name: "random_access_range",
                        path: "cub::random_access_range",
                        templateParams: [{ type: "class", name: "Range", defaultValue: undefined, isVariadic: false }],
                        constraintExpression: "std::ranges::random_access_range<Range>",
                        docstring: makeDocstring({
                            summary: [{ type: "text", text: "A random access range concept." }]
                        })
                    })
                ]
            })
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        expect(result.pageCount).toBe(1);
        const filePath = result.writtenFiles[0];
        expect(filePath).toBeDefined();
        expect(filePath).toMatch(/random_access_range\.mdx$/);

        const content = readFileSync(filePath as string, "utf-8");

        // Frontmatter
        expect(content).toMatch(/^---\n/);
        expect(content).toContain("title: cub::random_access_range");
        expect(content).toContain('description: "A random access range concept."');

        // Concept badge
        expect(content).toContain('<Badge intent="info">C++20 concept</Badge>');

        // Signature should include the constraint expression
        expect(content).toContain("concept random_access_range");
        expect(content).toContain("std::ranges::random_access_range<Range>");
    });

    // ------------------------------------------------------------------
    // 6. Doxygen group pages
    // ------------------------------------------------------------------
    it("generates group pages linking to entity pages, including nested subgroups", () => {
        const blockScan = makeClass({ name: "BlockScan", path: "cub::BlockScan" });
        const deviceScan = makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" });
        const tune = makeFunction({ name: "Tune", path: "cub::Tune" });

        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                classes: [blockScan],
                functions: [deviceScan, tune]
            }),
            undefined,
            [
                makeGroup({
                    id: "group__scan",
                    name: "scan",
                    title: "Scan",
                    docstring: makeDocstring({ summary: [{ type: "text", text: "Prefix scan primitives." }] }),
                    classes: [blockScan],
                    functions: [deviceScan],
                    subgroups: [
                        makeGroup({
                            id: "group__scan__advanced",
                            name: "scan_advanced",
                            title: "Advanced scan",
                            functions: [tune]
                        })
                    ]
                })
            ]
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        const relativePaths = collectMdxFiles(tmpDir).map((f) => f.substring(tmpDir.length + 1));
        expect(relativePaths).toContain("groups/index.mdx");
        expect(relativePaths).toContain("groups/scan/index.mdx");
        expect(relativePaths).toContain("groups/scan/scan_advanced/index.mdx");
        expect(result.pageCount).toBe(relativePaths.length);

        const groupsIndex = readFileSync(join(tmpDir, "groups/index.mdx"), "utf-8");
        expect(groupsIndex).toContain("- [Scan](groups/scan)");

        const scanPage = readFileSync(join(tmpDir, "groups/scan/index.mdx"), "utf-8");
        expect(scanPage).toContain("title: Scan");
        expect(scanPage).toContain("Prefix scan primitives.");
        expect(scanPage).toContain("## Classes");
        expect(scanPage).toContain("- [`cub::BlockScan`](../classes/blockscan)");
        expect(scanPage).toContain("## Functions");
        expect(scanPage).toContain("- [`cub::DeviceScan`](../functions/devicescan)");
        expect(scanPage).toContain("## Subgroups");
        expect(scanPage).toContain("- [Advanced scan](scan/scanadvanced)");

        const subgroupPage = readFileSync(join(tmpDir, "groups/scan/scan_advanced/index.mdx"), "utf-8");
        expect(subgroupPage).toContain("title: Advanced scan");
        expect(subgroupPage).toContain("- [`cub::Tune`](../../functions/tune)");
    });

    it("writes no group pages when the IR has no groups with members", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                classes: [makeClass({ name: "BlockScan", path: "cub::BlockScan" })]
            }),
            undefined,
            [makeGroup({ id: "group__empty", name: "empty", title: "Empty" })]
        );

        generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        expect(existsSync(join(tmpDir, "groups"))).toBe(false);
    });

    it("skips anonymous group members, which have no page to link to", () => {
        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                functions: [makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" })]
            }),
            undefined,
            [
                makeGroup({
                    id: "group__scan",
                    name: "scan",
                    title: "Scan",
                    functions: [makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" })],
                    // Doxygen emits an unnamed enum with no name and no path
                    enums: [
                        {
                            name: "",
                            path: "",
                            isScoped: false,
                            underlyingType: undefined,
                            values: [],
                            docstring: undefined
                        }
                    ]
                }),
                makeGroup({
                    id: "group__anon__only",
                    name: "anon_only",
                    title: "Anonymous only",
                    enums: [
                        {
                            name: "",
                            path: "",
                            isScoped: false,
                            underlyingType: undefined,
                            values: [],
                            docstring: undefined
                        }
                    ]
                })
            ]
        );

        generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        const scanPage = readFileSync(join(tmpDir, "groups/scan/index.mdx"), "utf-8");
        expect(scanPage).not.toContain("## Enumerations");
        expect(scanPage).not.toContain("[``]");

        // A group whose only members are anonymous has nothing to render
        expect(existsSync(join(tmpDir, "groups/anon_only"))).toBe(false);
        expect(readFileSync(join(tmpDir, "groups/index.mdx"), "utf-8")).not.toContain("Anonymous only");
    });

    it("titles the groups index from the library name, falling back when the IR has none", () => {
        const makeGroupedIr = (packageName: string) =>
            makeIr(
                makeNamespace({
                    name: "cub",
                    path: "cub",
                    functions: [makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" })]
                }),
                { packageName },
                [
                    makeGroup({
                        id: "group__scan",
                        name: "scan",
                        title: "Scan",
                        functions: [makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" })]
                    })
                ]
            );

        generateCpp({ ir: makeGroupedIr("CUB"), outputDir: tmpDir, slug: "reference/cub" });
        expect(readFileSync(join(tmpDir, "groups/index.mdx"), "utf-8")).toContain("title: CUB — Groups");

        const fallbackDir = mkdtempSync(join(tmpdir(), "cpp-gen-test-"));
        try {
            generateCpp({ ir: makeGroupedIr(""), outputDir: fallbackDir, slug: "reference/cub" });
            const index = readFileSync(join(fallbackDir, "groups/index.mdx"), "utf-8");
            expect(index).toContain("title: cub — Groups");
            expect(index).not.toContain("Documentation groups in .");
        } finally {
            rmSync(fallbackDir, { recursive: true, force: true });
        }
    });

    it("links the groups folder from the library index page", () => {
        const deviceScan = makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" });
        const ir = makeIr(
            makeNamespace({
                namespaces: [makeNamespace({ name: "cub", path: "cub", functions: [deviceScan] })]
            }),
            undefined,
            [makeGroup({ id: "group__scan", name: "scan", title: "Scan", functions: [deviceScan] })]
        );

        generateCpp({ ir, outputDir: join(tmpDir, "cub"), slug: "cub" });

        const libraryIndex = readFileSync(join(tmpDir, "cub/index.mdx"), "utf-8");
        expect(libraryIndex).toContain("- [Functions](cub/functions)");
        expect(libraryIndex).toContain("- [Groups](cub/groups)");
    });

    it("terminates on a group tree whose subgroup references an ancestor", () => {
        const scan = makeGroup({
            id: "group__scan",
            name: "scan",
            title: "Scan",
            functions: [makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" })]
        });
        // A malformed IR: the subgroup points back at its parent
        scan.subgroups.push(makeGroup({ id: "group__nested", name: "nested", subgroups: [scan] }));

        const ir = makeIr(
            makeNamespace({
                name: "cub",
                path: "cub",
                functions: [makeFunction({ name: "DeviceScan", path: "cub::DeviceScan" })]
            }),
            undefined,
            [scan]
        );

        const result = generateCpp({ ir, outputDir: tmpDir, slug: "reference/cub" });

        expect(result.writtenFiles.filter((file) => file.includes("/groups/")).length).toBe(3);
        expect(existsSync(join(tmpDir, "groups/scan/nested/index.mdx"))).toBe(true);
        expect(existsSync(join(tmpDir, "groups/scan/nested/scan"))).toBe(false);
    });
});
