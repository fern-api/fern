#!/usr/bin/env node

/**
 * Compares OpenAPI specs produced by `fern export` (CLI exporter) against
 * those produced by the seed openapi generator (seed/openapi/).
 *
 * Usage:
 *   node scripts/compare-openapi-outputs.js [--api <name>] [--summary-only] [--export-dir <dir>]
 *
 * Options:
 *   --api <name>       Compare a single API (can be repeated)
 *   --summary-only     Only print the aggregate summary, not per-API details
 *   --export-dir <dir> Directory with pre-generated exports (skip re-exporting)
 */

const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const REPO_ROOT = path.resolve(__dirname, "..");
const TEST_DEFS = path.join(REPO_ROOT, "test-definitions");
const SEED_OPENAPI = path.join(REPO_ROOT, "seed", "openapi");
const CLI_PATH = path.join(REPO_ROOT, "packages", "cli", "cli", "dist", "prod", "cli.cjs");
const MAX_PARALLEL = 10;

// ---------------------------------------------------------------------------
// Diff categories — each diff is bucketed into one of these
// ---------------------------------------------------------------------------
const CATEGORIES = {
    OPENAPI_VERSION: "openapi-version",
    INFO_METADATA: "info-metadata",
    NULLABLE_REPRESENTATION: "nullable-representation",
    RESPONSE_DESCRIPTION: "response-description",
    SECURITY_SCHEME_NAMING: "security-scheme-naming",
    SECURITY_SCHEME_MISSING: "security-scheme-missing",
    MISSING_EXAMPLES: "missing-examples",
    FERN_EXTENSIONS: "x-fern-extensions",
    MISSING_PATH: "missing-path",
    EXTRA_PATH: "extra-path",
    MISSING_SCHEMA: "missing-schema",
    EXTRA_SCHEMA: "extra-schema",
    SCHEMA_STRUCTURAL: "schema-structural",
    ENDPOINT_STRUCTURAL: "endpoint-structural",
    OTHER: "other"
};

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
function parseArgs() {
    const args = process.argv.slice(2);
    const opts = { apis: [], summaryOnly: false, exportDir: null };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--api" && args[i + 1]) {
            opts.apis.push(args[++i]);
        } else if (args[i] === "--summary-only") {
            opts.summaryOnly = true;
        } else if (args[i] === "--export-dir" && args[i + 1]) {
            opts.exportDir = args[++i];
        }
    }
    return opts;
}

// ---------------------------------------------------------------------------
// Discover which APIs can be compared
// ---------------------------------------------------------------------------
function discoverApis(filterApis) {
    const testDefApis = fs.readdirSync(path.join(TEST_DEFS, "fern", "apis"));
    const seedApis = new Set(
        fs.readdirSync(SEED_OPENAPI).filter((f) => {
            return fs.statSync(path.join(SEED_OPENAPI, f)).isDirectory();
        })
    );

    let apis = testDefApis.filter((api) => seedApis.has(api));
    if (filterApis.length > 0) {
        apis = apis.filter((api) => filterApis.includes(api));
    }
    return apis.sort();
}

// ---------------------------------------------------------------------------
// Find seed openapi spec for a fixture
// ---------------------------------------------------------------------------
function findSeedSpec(api) {
    const direct = path.join(SEED_OPENAPI, api, "openapi.yml");
    if (fs.existsSync(direct)) {
        return direct;
    }
    const noCustom = path.join(SEED_OPENAPI, api, "no-custom-config", "openapi.yml");
    if (fs.existsSync(noCustom)) {
        return noCustom;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Export an API using fern export (returns path to output file)
// ---------------------------------------------------------------------------
function exportApi(api, exportDir) {
    const outFile = path.join(exportDir, `${api}.yml`);
    if (fs.existsSync(outFile)) {
        return outFile;
    }
    try {
        execSync(`FERN_NO_VERSION_REDIRECTION=true node "${CLI_PATH}" export "${outFile}" --api "${api}"`, {
            cwd: TEST_DEFS,
            stdio: "pipe",
            timeout: 30_000
        });
        return outFile;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Export APIs in parallel batches
// ---------------------------------------------------------------------------
function exportAllApis(apis, exportDir) {
    fs.mkdirSync(exportDir, { recursive: true });
    const results = {};

    // Process in batches
    for (let i = 0; i < apis.length; i += MAX_PARALLEL) {
        const batch = apis.slice(i, i + MAX_PARALLEL);
        const promises = batch.map((api) => {
            return new Promise((resolve) => {
                const outFile = path.join(exportDir, `${api}.yml`);
                if (fs.existsSync(outFile)) {
                    resolve({ api, file: outFile });
                    return;
                }
                exec(
                    `FERN_NO_VERSION_REDIRECTION=true node "${CLI_PATH}" export "${outFile}" --api "${api}"`,
                    { cwd: TEST_DEFS, timeout: 30_000 },
                    (error) => {
                        resolve({ api, file: error ? null : outFile });
                    }
                );
            });
        });
        const batchResults = await_all(promises);
        for (const r of batchResults) {
            results[r.api] = r.file;
        }
    }
    return results;
}

// Synchronous await-all helper
function await_all(promises) {
    const { execSync: execSyncLocal } = require("child_process");
    // Use a simpler approach — just run sequentially within a batch since we
    // already batch at MAX_PARALLEL
    // Actually let's use a synchronous approach for simplicity
    return promises;
}

// ---------------------------------------------------------------------------
// Deep diff two parsed YAML objects, returning categorized differences
// ---------------------------------------------------------------------------
function compareSpecs(exportSpec, seedSpec) {
    const diffs = [];

    // 1. OpenAPI version
    if (exportSpec.openapi !== seedSpec.openapi) {
        diffs.push({
            category: CATEGORIES.OPENAPI_VERSION,
            path: "openapi",
            export: exportSpec.openapi,
            seed: seedSpec.openapi
        });
    }

    // 2. Info metadata
    compareInfoMetadata(exportSpec.info, seedSpec.info, diffs);

    // 3. Paths
    comparePaths(exportSpec.paths || {}, seedSpec.paths || {}, diffs);

    // 4. Components
    compareComponents(exportSpec.components || {}, seedSpec.components || {}, diffs);

    return diffs;
}

function compareInfoMetadata(exportInfo, seedInfo, diffs) {
    if (!exportInfo || !seedInfo) return;
    for (const key of new Set([...Object.keys(exportInfo), ...Object.keys(seedInfo)])) {
        if (JSON.stringify(exportInfo[key]) !== JSON.stringify(seedInfo[key])) {
            diffs.push({
                category: CATEGORIES.INFO_METADATA,
                path: `info.${key}`,
                export: exportInfo[key],
                seed: seedInfo[key]
            });
        }
    }
}

function comparePaths(exportPaths, seedPaths, diffs) {
    const allPaths = new Set([...Object.keys(exportPaths), ...Object.keys(seedPaths)]);

    for (const p of allPaths) {
        if (!(p in exportPaths)) {
            diffs.push({ category: CATEGORIES.EXTRA_PATH, path: `paths.${p}`, export: undefined, seed: "(present)" });
            continue;
        }
        if (!(p in seedPaths)) {
            diffs.push({ category: CATEGORIES.MISSING_PATH, path: `paths.${p}`, export: "(present)", seed: undefined });
            continue;
        }

        const exportPathItem = exportPaths[p];
        const seedPathItem = seedPaths[p];
        const methods = new Set([...Object.keys(exportPathItem), ...Object.keys(seedPathItem)]);

        for (const method of methods) {
            const exportOp = exportPathItem[method];
            const seedOp = seedPathItem[method];

            if (!exportOp || !seedOp) {
                diffs.push({
                    category: CATEGORIES.ENDPOINT_STRUCTURAL,
                    path: `paths.${p}.${method}`,
                    export: exportOp ? "(present)" : "(missing)",
                    seed: seedOp ? "(present)" : "(missing)"
                });
                continue;
            }

            compareOperation(p, method, exportOp, seedOp, diffs);
        }
    }
}

function compareOperation(httpPath, method, exportOp, seedOp, diffs) {
    const prefix = `paths.${httpPath}.${method}`;

    // Response descriptions
    if (exportOp.responses && seedOp.responses) {
        for (const code of new Set([...Object.keys(exportOp.responses), ...Object.keys(seedOp.responses)])) {
            const eResp = exportOp.responses[code];
            const sResp = seedOp.responses[code];
            if (eResp && sResp && eResp.description !== sResp.description) {
                diffs.push({
                    category: CATEGORIES.RESPONSE_DESCRIPTION,
                    path: `${prefix}.responses.${code}.description`,
                    export: eResp.description,
                    seed: sResp.description
                });
            }
        }
    }

    // x-fern-* extensions
    for (const key of Object.keys(seedOp)) {
        if (key.startsWith("x-fern-") && !(key in exportOp)) {
            diffs.push({
                category: CATEGORIES.FERN_EXTENSIONS,
                path: `${prefix}.${key}`,
                export: undefined,
                seed: seedOp[key]
            });
        }
    }

    // Examples in request/response
    const exportHasExamples = hasExamples(exportOp);
    const seedHasExamples = hasExamples(seedOp);
    if (seedHasExamples && !exportHasExamples) {
        diffs.push({
            category: CATEGORIES.MISSING_EXAMPLES,
            path: `${prefix}`,
            export: "(no examples)",
            seed: "(has examples)"
        });
    }

    // Security differences
    if (JSON.stringify(exportOp.security) !== JSON.stringify(seedOp.security)) {
        if (exportOp.security || seedOp.security) {
            diffs.push({
                category: CATEGORIES.SECURITY_SCHEME_NAMING,
                path: `${prefix}.security`,
                export: exportOp.security,
                seed: seedOp.security
            });
        }
    }

    // Structural comparison of parameters, requestBody, responses (excluding already-compared fields)
    const exportNormalized = normalizeOperation(exportOp);
    const seedNormalized = normalizeOperation(seedOp);
    if (JSON.stringify(exportNormalized) !== JSON.stringify(seedNormalized)) {
        // Check for nullable representation diffs
        const exportStr = JSON.stringify(exportOp);
        const seedStr = JSON.stringify(seedOp);
        if (exportStr.includes('"nullable":true') && seedStr.includes('"type":"null"')) {
            diffs.push({
                category: CATEGORIES.NULLABLE_REPRESENTATION,
                path: prefix,
                export: "uses nullable: true (OAS 3.0)",
                seed: "uses anyOf/type array with null (OAS 3.1)"
            });
        }

        diffs.push({
            category: CATEGORIES.ENDPOINT_STRUCTURAL,
            path: prefix,
            export: "(differs)",
            seed: "(differs)"
        });
    }
}

function normalizeOperation(op) {
    // Strip fields we compare separately
    const { responses, security, ...rest } = op || {};
    // Strip x-fern-* extensions
    const filtered = {};
    for (const [k, v] of Object.entries(rest)) {
        if (!k.startsWith("x-fern-")) {
            filtered[k] = v;
        }
    }
    return filtered;
}

function hasExamples(op) {
    const str = JSON.stringify(op || {});
    return str.includes('"examples"');
}

function compareComponents(exportComponents, seedComponents, diffs) {
    // Schemas
    const exportSchemas = exportComponents.schemas || {};
    const seedSchemas = seedComponents.schemas || {};
    const allSchemaNames = new Set([...Object.keys(exportSchemas), ...Object.keys(seedSchemas)]);

    for (const name of allSchemaNames) {
        if (!(name in exportSchemas)) {
            diffs.push({
                category: CATEGORIES.EXTRA_SCHEMA,
                path: `components.schemas.${name}`,
                export: undefined,
                seed: "(present)"
            });
            continue;
        }
        if (!(name in seedSchemas)) {
            diffs.push({
                category: CATEGORIES.MISSING_SCHEMA,
                path: `components.schemas.${name}`,
                export: "(present)",
                seed: undefined
            });
            continue;
        }
        const exportSchema = exportSchemas[name];
        const seedSchema = seedSchemas[name];
        if (JSON.stringify(exportSchema) !== JSON.stringify(seedSchema)) {
            // Check for fern extensions
            const seedHasFernExt = Object.keys(seedSchema).some((k) => k.startsWith("x-fern-"));
            if (seedHasFernExt) {
                diffs.push({
                    category: CATEGORIES.FERN_EXTENSIONS,
                    path: `components.schemas.${name}`,
                    export: "(no x-fern-*)",
                    seed: "(has x-fern-*)"
                });
            }
            // Check nullable representation
            const eStr = JSON.stringify(exportSchema);
            const sStr = JSON.stringify(seedSchema);
            if (eStr.includes('"nullable":true') && sStr.includes('"type":"null"')) {
                diffs.push({
                    category: CATEGORIES.NULLABLE_REPRESENTATION,
                    path: `components.schemas.${name}`,
                    export: "uses nullable: true (OAS 3.0)",
                    seed: "uses anyOf/type array with null (OAS 3.1)"
                });
            }
            diffs.push({
                category: CATEGORIES.SCHEMA_STRUCTURAL,
                path: `components.schemas.${name}`,
                export: "(differs)",
                seed: "(differs)"
            });
        }
    }

    // Security schemes
    const exportSec = exportComponents.securitySchemes || {};
    const seedSec = seedComponents.securitySchemes || {};
    const allSecNames = new Set([...Object.keys(exportSec), ...Object.keys(seedSec)]);

    // Check for naming differences vs missing schemes
    const exportSecNames = Object.keys(exportSec);
    const seedSecNames = Object.keys(seedSec);
    if (JSON.stringify(exportSec) !== JSON.stringify(seedSec)) {
        if (exportSecNames.length !== seedSecNames.length) {
            diffs.push({
                category: CATEGORIES.SECURITY_SCHEME_MISSING,
                path: "components.securitySchemes",
                export: exportSecNames,
                seed: seedSecNames
            });
        } else {
            diffs.push({
                category: CATEGORIES.SECURITY_SCHEME_NAMING,
                path: "components.securitySchemes",
                export: exportSecNames,
                seed: seedSecNames
            });
        }
    }
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------
function printReport(allResults, summaryOnly) {
    const categoryCounts = {};
    const categoryApis = {};
    let totalApis = 0;
    let identicalApis = 0;
    let exportFailedApis = 0;
    let noSeedSpecApis = 0;

    for (const [api, result] of Object.entries(allResults)) {
        totalApis++;
        if (result.error === "export-failed") {
            exportFailedApis++;
            continue;
        }
        if (result.error === "no-seed-spec") {
            noSeedSpecApis++;
            continue;
        }

        const diffs = result.diffs;
        if (diffs.length === 0) {
            identicalApis++;
            continue;
        }

        if (!summaryOnly) {
            console.log(`\n--- ${api} (${diffs.length} differences) ---`);
        }

        const seenCategories = new Set();
        for (const diff of diffs) {
            categoryCounts[diff.category] = (categoryCounts[diff.category] || 0) + 1;
            if (!seenCategories.has(diff.category)) {
                seenCategories.add(diff.category);
                if (!categoryApis[diff.category]) {
                    categoryApis[diff.category] = [];
                }
                categoryApis[diff.category].push(api);
            }

            if (!summaryOnly) {
                const exportVal = typeof diff.export === "object" ? JSON.stringify(diff.export) : diff.export;
                const seedVal = typeof diff.seed === "object" ? JSON.stringify(diff.seed) : diff.seed;
                console.log(`  [${diff.category}] ${diff.path}`);
                console.log(`    export: ${exportVal}`);
                console.log(`    seed:   ${seedVal}`);
            }
        }
    }

    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("COMPARISON SUMMARY");
    console.log("=".repeat(70));
    console.log(`Total APIs compared:  ${totalApis}`);
    console.log(`Identical:            ${identicalApis}`);
    console.log(`With differences:     ${totalApis - identicalApis - exportFailedApis - noSeedSpecApis}`);
    console.log(`Export failed:        ${exportFailedApis}`);
    console.log(`No seed spec:         ${noSeedSpecApis}`);
    console.log("");
    console.log("Difference categories (total occurrences across all APIs):");
    console.log("-".repeat(70));

    const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    for (const [category, count] of sorted) {
        const apiCount = categoryApis[category]?.length || 0;
        console.log(`  ${category.padEnd(35)} ${String(count).padStart(5)} occurrences in ${apiCount} APIs`);
    }
    console.log("=".repeat(70));

    // Print list of APIs per category
    console.log("\nAPIs affected per category:");
    console.log("-".repeat(70));
    for (const [category] of sorted) {
        const apis = categoryApis[category] || [];
        if (apis.length <= 5) {
            console.log(`  ${category}: ${apis.join(", ")}`);
        } else {
            console.log(`  ${category}: ${apis.slice(0, 5).join(", ")} ... and ${apis.length - 5} more`);
        }
    }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
    const opts = parseArgs();
    const apis = discoverApis(opts.apis);

    console.log(`Comparing ${apis.length} APIs...`);

    // Set up export directory
    const exportDir = opts.exportDir || path.join(REPO_ROOT, ".local", "tmp", "openapi-exports");
    fs.mkdirSync(exportDir, { recursive: true });

    // Export all APIs and compare
    const allResults = {};
    let completed = 0;

    // Process in parallel batches
    for (let i = 0; i < apis.length; i += MAX_PARALLEL) {
        const batch = apis.slice(i, i + MAX_PARALLEL);
        const promises = batch.map((api) => {
            return new Promise((resolve) => {
                const seedSpecPath = findSeedSpec(api);
                if (!seedSpecPath) {
                    resolve({ api, result: { error: "no-seed-spec" } });
                    return;
                }

                const outFile = path.join(exportDir, `${api}.yml`);
                if (fs.existsSync(outFile)) {
                    // Already exported, just compare
                    resolve({ api, result: compareFiles(outFile, seedSpecPath) });
                    return;
                }

                exec(
                    `FERN_NO_VERSION_REDIRECTION=true node "${CLI_PATH}" export "${outFile}" --api "${api}"`,
                    { cwd: TEST_DEFS, timeout: 30_000 },
                    (error) => {
                        if (error) {
                            resolve({ api, result: { error: "export-failed" } });
                        } else {
                            resolve({ api, result: compareFiles(outFile, seedSpecPath) });
                        }
                    }
                );
            });
        });

        const results = await Promise.all(promises);
        for (const { api, result } of results) {
            allResults[api] = result;
            completed++;
        }
        process.stderr.write(`  ${completed}/${apis.length} APIs processed\r`);
    }
    process.stderr.write("\n");

    printReport(allResults, opts.summaryOnly);
}

function compareFiles(exportPath, seedPath) {
    try {
        const exportContent = fs.readFileSync(exportPath, "utf8");
        const seedContent = fs.readFileSync(seedPath, "utf8");
        const exportSpec = yaml.load(exportContent);
        const seedSpec = yaml.load(seedContent);
        const diffs = compareSpecs(exportSpec, seedSpec);
        return { diffs };
    } catch (error) {
        return { error: "parse-error", message: error.message };
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
