/**
 * C++ Renderer Golden Page Convergence Tests
 *
 * Each test renders a fixture's input.json through the renderer and
 * compares against expected.mdx via snapshots. The actual rendered
 * output is written to actual.mdx for manual diff inspection.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

import { renderCompoundPage } from "../renderers/CompoundPageRenderer.js";
import type { CppClassIr, CppConceptIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";

const FIXTURES_DIR = path.resolve(__dirname, "fixtures");

interface FixtureMeta {
    compound_name: string;
    qualified_name: string;
    repo: string;
    compound_kind: "class" | "concept";
    namespace_path: string[];
    golden_page: string;
    status: string;
}

function metaToCompoundMeta(meta: FixtureMeta): CompoundMeta {
    return {
        compoundName: meta.compound_name,
        qualifiedName: meta.qualified_name,
        repo: meta.repo,
        compoundKind: meta.compound_kind,
        namespacePath: meta.namespace_path,
    };
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

describe("C++ Renderer Golden Page Convergence", () => {
    for (const name of fixtures) {
        it(`renders ${name}`, () => {
            const dir = path.join(FIXTURES_DIR, name);
            const input = JSON.parse(fs.readFileSync(path.join(dir, "input.json"), "utf-8"));
            const meta: FixtureMeta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf-8"));

            const compoundMeta = metaToCompoundMeta(meta);
            const kind = meta.compound_kind === "concept" ? "concept" : "class";
            const compound = { kind, data: input } as
                | { kind: "class"; data: CppClassIr }
                | { kind: "concept"; data: CppConceptIr };

            const actual = renderCompoundPage(compound, compoundMeta);

            // Write actual output for manual diff inspection
            fs.writeFileSync(path.join(dir, "actual.mdx"), actual);

            expect(actual).toMatchSnapshot();
        });
    }
});
