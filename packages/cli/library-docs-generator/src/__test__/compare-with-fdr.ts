/**
 * Compare CLI library-docs-generator output against FDR server PythonRenderer output.
 *
 * Usage:
 *   pnpm tsx src/__test__/compare-with-fdr.ts <path-to-nemo_rl_ir.json>
 *
 * Example:
 *   pnpm tsx src/__test__/compare-with-fdr.ts \
 *     /Users/paarthgupta/fern/fern-platform/servers/fdr/src/services/library-docs/__test__/nemo-rl-docs/nemo_rl_ir.json
 *
 * Outputs:
 *   - Writes CLI-generated pages to /tmp/libdocs-cli/
 *   - Reports page count, missing/extra pages vs FDR, and per-page diffs
 */

import * as fs from "fs";
import * as path from "path";
import type { FdrAPI } from "@fern-api/fdr-sdk";
import { generate } from "../PythonDocsGenerator";

const IR_PATH = process.argv[2];
if (!IR_PATH) {
    console.error("Usage: pnpm tsx src/__test__/compare-with-fdr.ts <path-to-nemo_rl_ir.json>");
    process.exit(1);
}

const CLI_OUTPUT_DIR = "/tmp/libdocs-cli";
const BASE_SLUG = "library-docs";

function main() {
    // Read IR
    console.log(`Reading IR from ${IR_PATH}...`);
    const parsed = JSON.parse(fs.readFileSync(IR_PATH, "utf-8"));
    const ir: FdrAPI.libraryDocs.PythonLibraryDocsIr = parsed.ir ?? parsed;

    // Run CLI generator
    console.log("Running CLI generator...");
    if (fs.existsSync(CLI_OUTPUT_DIR)) {
        fs.rmSync(CLI_OUTPUT_DIR, { recursive: true });
    }
    fs.mkdirSync(CLI_OUTPUT_DIR, { recursive: true });

    const startTime = Date.now();
    const result = generate({
        ir,
        outputDir: CLI_OUTPUT_DIR,
        slug: BASE_SLUG,
        title: "Library Reference",
    });
    const elapsed = Date.now() - startTime;

    console.log(`\nCLI Generator Results:`);
    console.log(`  Pages: ${result.pageCount}`);
    console.log(`  Root page: ${result.rootPageId}`);
    console.log(`  Nav items: ${result.navigation.length}`);
    console.log(`  Time: ${elapsed}ms`);

    // List all generated page keys (relative paths)
    const cliPages = new Map<string, string>();
    for (const filePath of result.writtenFiles) {
        const relPath = path.relative(CLI_OUTPUT_DIR, filePath);
        cliPages.set(relPath, fs.readFileSync(filePath, "utf-8"));
    }

    // Check FDR output if it exists
    const fdrOutputDir = path.join(
        path.dirname(IR_PATH),
        "fern/docs/pages",
    );

    if (fs.existsSync(fdrOutputDir)) {
        console.log(`\nComparing with FDR output at ${fdrOutputDir}...`);

        const fdrPages = new Map<string, string>();
        function collectPages(dir: string, prefix: string = "") {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
                if (entry.isDirectory()) {
                    collectPages(path.join(dir, entry.name), rel);
                } else if (entry.name.endsWith(".mdx")) {
                    fdrPages.set(rel, fs.readFileSync(path.join(dir, entry.name), "utf-8"));
                }
            }
        }
        collectPages(fdrOutputDir);

        console.log(`  FDR pages: ${fdrPages.size}`);
        console.log(`  CLI pages: ${cliPages.size}`);

        // Find missing/extra pages
        const cliKeys = new Set(cliPages.keys());
        const fdrKeys = new Set(fdrPages.keys());

        const onlyInFdr: string[] = [];
        const onlyInCli: string[] = [];
        const inBoth: string[] = [];

        for (const key of fdrKeys) {
            if (cliKeys.has(key)) {
                inBoth.push(key);
            } else {
                onlyInFdr.push(key);
            }
        }
        for (const key of cliKeys) {
            if (!fdrKeys.has(key)) {
                onlyInCli.push(key);
            }
        }

        if (onlyInFdr.length > 0) {
            console.log(`\n  Pages only in FDR (${onlyInFdr.length}):`);
            for (const p of onlyInFdr.sort()) {
                console.log(`    - ${p}`);
            }
        }

        if (onlyInCli.length > 0) {
            console.log(`\n  Pages only in CLI (${onlyInCli.length}):`);
            for (const p of onlyInCli.sort()) {
                console.log(`    - ${p}`);
            }
        }

        // Compare content of shared pages
        let identical = 0;
        let different = 0;
        const diffs: { page: string; cliLines: number; fdrLines: number; firstDiffLine: number }[] = [];

        for (const key of inBoth.sort()) {
            const cliContent = cliPages.get(key)!;
            const fdrContent = fdrPages.get(key)!;

            if (cliContent === fdrContent) {
                identical++;
            } else {
                different++;
                const cliLines = cliContent.split("\n");
                const fdrLines = fdrContent.split("\n");
                let firstDiffLine = 0;
                for (let i = 0; i < Math.max(cliLines.length, fdrLines.length); i++) {
                    if (cliLines[i] !== fdrLines[i]) {
                        firstDiffLine = i + 1;
                        break;
                    }
                }
                diffs.push({
                    page: key,
                    cliLines: cliLines.length,
                    fdrLines: fdrLines.length,
                    firstDiffLine,
                });
            }
        }

        console.log(`\n  Shared pages: ${inBoth.length}`);
        console.log(`    Identical: ${identical}`);
        console.log(`    Different: ${different}`);

        if (diffs.length > 0) {
            console.log(`\n  First 10 differences:`);
            for (const d of diffs.slice(0, 10)) {
                console.log(`    ${d.page}: CLI ${d.cliLines} lines vs FDR ${d.fdrLines} lines (first diff at line ${d.firstDiffLine})`);
            }

            // Write detailed diff for the first different page
            if (diffs.length > 0) {
                const firstDiff = diffs[0]!;
                const diffDir = "/tmp/libdocs-diff";
                if (fs.existsSync(diffDir)) {
                    fs.rmSync(diffDir, { recursive: true });
                }
                fs.mkdirSync(diffDir, { recursive: true });

                fs.writeFileSync(
                    path.join(diffDir, "cli.mdx"),
                    cliPages.get(firstDiff.page)!,
                );
                fs.writeFileSync(
                    path.join(diffDir, "fdr.mdx"),
                    fdrPages.get(firstDiff.page)!,
                );
                console.log(`\n  Detailed diff files for "${firstDiff.page}" written to ${diffDir}/`);
                console.log(`  Run: diff ${diffDir}/fdr.mdx ${diffDir}/cli.mdx`);
            }
        }
    } else {
        console.log(`\nNo FDR output found at ${fdrOutputDir}.`);
        console.log(`Run the FDR regenerate script first:`);
        console.log(`  cd /Users/paarthgupta/fern/fern-platform/servers/fdr`);
        console.log(`  pnpm tsx src/services/library-docs/__test__/regenerate-mdx.ts`);
    }

    // Print a few sample pages
    console.log(`\n--- Sample page list (first 15) ---`);
    const sortedKeys = [...cliPages.keys()].sort();
    for (const key of sortedKeys.slice(0, 15)) {
        const content = cliPages.get(key)!;
        console.log(`  ${key} (${content.split("\n").length} lines)`);
    }
    if (sortedKeys.length > 15) {
        console.log(`  ... and ${sortedKeys.length - 15} more`);
    }
}

main();
