/**
 * Batch rendering validation script.
 *
 * Loads all 3 real C++ IR corpus files (CUB, Thrust, libcudacxx) and runs the
 * CppDocsGenerator against each one, writing MDX pages to the docs-starter
 * cudapages directory for live preview.
 *
 * Usage:
 *   npx tsx src/__test__/render-all-compounds.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

import type { CppLibraryDocsIr } from "../types/CppLibraryDocsIr.js";
import { generateCpp } from "../CppDocsGenerator.js";

const CONVERGENCE_DIR =
    "/Users/paarthgupta/fern/fern-platform/servers/fdr-cpp-library-docs-parser/convergence";

const OUTPUT_BASE = "/Users/paarthgupta/fern/docs-starter/fern/cudapages";

interface CorpusEntry {
    filename: string;
    slug: string;
    label: string;
}

const CORPORA: CorpusEntry[] = [
    { filename: "ir_output_cub_v3.json", slug: "cub", label: "CUB" },
    { filename: "ir_output_thrust_v3.json", slug: "thrust", label: "Thrust" },
    { filename: "ir_output_libcudacxx_v3.json", slug: "cuda", label: "libcudacxx" },
];

interface CorpusResult {
    label: string;
    slug: string;
    pageCount: number;
    files: string[];
    error?: string;
}

function main(): void {
    const results: CorpusResult[] = [];
    let totalPages = 0;

    for (const corpus of CORPORA) {
        const irPath = path.join(CONVERGENCE_DIR, corpus.filename);
        console.log(`\n${"=".repeat(60)}`);
        console.log(`Loading ${corpus.label} from ${corpus.filename}...`);

        if (!fs.existsSync(irPath)) {
            console.error(`  ERROR: file not found: ${irPath}`);
            results.push({ label: corpus.label, slug: corpus.slug, pageCount: 0, files: [], error: "file not found" });
            continue;
        }

        const raw = fs.readFileSync(irPath, "utf-8");
        const parsed = JSON.parse(raw);
        // V3 IR files have a { ir, metadata } wrapper; unwrap if present
        const ir: CppLibraryDocsIr = parsed.ir ?? parsed;

        const outputDir = path.join(OUTPUT_BASE, corpus.slug);

        // Clean slate: remove existing output dir and recreate
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(outputDir, { recursive: true });

        console.log(`  Output dir: ${outputDir}`);

        try {
            const result = generateCpp({ ir, outputDir, slug: corpus.slug });
            const relFiles = result.writtenFiles.map((f) => path.relative(outputDir, f));

            console.log(`  Pages rendered: ${result.pageCount}`);
            console.log(`  Files:`);
            for (const f of relFiles.sort()) {
                console.log(`    ${f}`);
            }

            results.push({ label: corpus.label, slug: corpus.slug, pageCount: result.pageCount, files: relFiles.sort() });
            totalPages += result.pageCount;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`  ERROR during rendering: ${msg}`);
            if (err instanceof Error && err.stack) {
                console.error(err.stack);
            }
            results.push({ label: corpus.label, slug: corpus.slug, pageCount: 0, files: [], error: msg });
        }
    }

    // Summary
    console.log(`\n${"=".repeat(60)}`);
    console.log("SUMMARY");
    console.log(`${"=".repeat(60)}`);
    for (const r of results) {
        const status = r.error ? `ERROR: ${r.error}` : `${r.pageCount} pages`;
        console.log(`  ${r.label.padEnd(12)} ${status}`);
    }
    console.log(`  ${"─".repeat(30)}`);
    console.log(`  TOTAL        ${totalPages} pages`);
}

main();
