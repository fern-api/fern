import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateCpp } from "../CppDocsGenerator.js";
import type {
    CppClassIr,
    CppConceptIr,
    CppDocstringIr,
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

function makeIr(rootNamespace: CppNamespaceIr, metadata?: Partial<IrMetadata>): CppLibraryDocsIr {
    return {
        metadata: { ...DEFAULT_METADATA, ...metadata },
        rootNamespace,
        groups: []
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
});
