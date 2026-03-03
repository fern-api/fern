/**
 * Shared fixture utilities for C++ renderer tests and convergence measurement.
 *
 * Contains the canonical fixture list, metadata interface, and conversion helpers
 * used by both CppRenderer.test.ts and measure-convergence.ts.
 */

import * as path from "path";
import { fileURLToPath } from "url";
import type { CompoundMeta } from "../context.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FIXTURES_DIR = path.resolve(__dirname, "fixtures");

export interface FixtureMeta {
    compound_name: string;
    qualified_name: string;
    repo: string;
    compound_kind: "class" | "concept";
    namespace_path: string[];
    description?: string;
    golden_page: string;
    status: string;
}

export function metaToCompoundMeta(meta: FixtureMeta): CompoundMeta {
    return {
        compoundName: meta.compound_name,
        qualifiedName: meta.qualified_name,
        repo: meta.repo,
        compoundKind: meta.compound_kind,
        namespacePath: meta.namespace_path,
        description: meta.description,
    };
}

export const FIXTURES = [
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
] as const;
