/**
 * Convergence measurement script for C++ MDX renderer.
 *
 * Renders all fixtures, diffs actual vs expected, and prints a summary table.
 * Run: npx tsx cpp/src/__test__/measure-convergence.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { renderCompoundPage } from "../renderers/CompoundPageRenderer.js";
import type { CppClassIr, CppConceptIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "fixtures");

interface FixtureMeta {
    compound_name: string;
    qualified_name: string;
    repo: string;
    compound_kind: "class" | "concept";
    namespace_path: string[];
}

const fixtures = [
    "block_reduce_v5",
    "block_scan_v5",
    "simple_struct_v5",
    "warp_reduce_v5",
    "device_vector_v5",
    "pointer_v5",
    "deprecated_example_v5",
    "group_member_example_v5",
    "concept_example_v5",
    "deep_template_class_v5",
    "empty_docstring_class_v5",
    "raises_example_v5",
];

let totalDiffLines = 0;
const results: { name: string; expectedLines: number; actualLines: number; diffLines: number }[] = [];

for (const name of fixtures) {
    const dir = path.join(FIXTURES_DIR, name);
    const input = JSON.parse(fs.readFileSync(path.join(dir, "input.json"), "utf-8"));
    const meta: FixtureMeta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf-8"));

    const compoundMeta: CompoundMeta = {
        compoundName: meta.compound_name,
        qualifiedName: meta.qualified_name,
        repo: meta.repo,
        compoundKind: meta.compound_kind,
        namespacePath: meta.namespace_path,
    };

    const kind = meta.compound_kind === "concept" ? "concept" : "class";
    const compound = { kind, data: input } as
        | { kind: "class"; data: CppClassIr }
        | { kind: "concept"; data: CppConceptIr };

    const actual = renderCompoundPage(compound, compoundMeta);
    const actualPath = path.join(dir, "actual.mdx");
    const expectedPath = path.join(dir, "expected.mdx");

    fs.writeFileSync(actualPath, actual);

    const expected = fs.readFileSync(expectedPath, "utf-8");
    const expectedLines = expected.split("\n").length;
    const actualLines = actual.split("\n").length;

    // Count diff lines (excluding the diff header lines starting with ---, +++, @@)
    let diffLines = 0;
    try {
        execSync(`diff "${expectedPath}" "${actualPath}"`, { encoding: "utf-8" });
        // No diff = files match
    } catch (e: unknown) {
        const err = e as { stdout?: string };
        const diffOutput = err.stdout || "";
        // Count lines starting with < or > (actual content differences)
        diffLines = diffOutput
            .split("\n")
            .filter((line: string) => line.startsWith("<") || line.startsWith(">"))
            .length;
    }

    totalDiffLines += diffLines;
    results.push({ name, expectedLines, actualLines, diffLines });
}

// Print summary table
console.log("\n=== C++ Renderer Convergence Report ===\n");
console.log(
    "Fixture".padEnd(35) +
    "Expected".padStart(10) +
    "Actual".padStart(10) +
    "Diff Lines".padStart(12)
);
console.log("-".repeat(67));

for (const r of results) {
    console.log(
        r.name.padEnd(35) +
        String(r.expectedLines).padStart(10) +
        String(r.actualLines).padStart(10) +
        String(r.diffLines).padStart(12)
    );
}

console.log("-".repeat(67));
console.log(
    "TOTAL".padEnd(35) +
    "".padStart(10) +
    "".padStart(10) +
    String(totalDiffLines).padStart(12)
);
console.log();
