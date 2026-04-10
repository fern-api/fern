import { execSync } from "child_process";
import { cpSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(__dirname, "..");
const TEST_DEFS = join(ROOT, "test-definitions");
const CLI = join(ROOT, "packages/cli/cli/dist/prod/cli.cjs");
const RESULTS_BASE = join(ROOT, ".local/results");

const APIS = ["allof", "allof-inline"];

function fern(args: string): void {
    const cmd = `FERN_NO_VERSION_REDIRECTION=true node --enable-source-maps ${CLI} ${args}`;
    execSync(cmd, { cwd: TEST_DEFS, stdio: "inherit" });
}

function main(): void {
    if (!existsSync(CLI)) {
        process.stderr.write(`CLI not built. Run: pnpm fern:build\n`);
        process.exit(1);
    }

    const allResults: Array<{ api: string; name: string; ok: boolean }> = [];

    for (const api of APIS) {
        const results = join(RESULTS_BASE, api);
        mkdirSync(results, { recursive: true });

        const steps: Array<{ name: string; run: () => void }> = [
            {
                name: "openapi-ir",
                run: () => fern(`openapi-ir ${results}/openapi-ir.json --api ${api}`)
            },
            {
                name: "write-definition",
                run: () => {
                    fern(`write-definition --api ${api}`);
                    const defSrc = join(TEST_DEFS, `fern/apis/${api}/.definition`);
                    const defDst = join(results, ".definition");
                    if (existsSync(defSrc)) {
                        cpSync(defSrc, defDst, { recursive: true });
                    } else {
                        process.stderr.write(`Warning: ${defSrc} not found after write-definition\n`);
                    }
                }
            },
            {
                name: "ir",
                run: () => fern(`ir ${results}/ir.json --api ${api}`)
            }
        ];

        process.stdout.write(`\n=== ${api} ===\n`);

        for (const step of steps) {
            process.stdout.write(`\n--- ${step.name} ---\n`);
            try {
                step.run();
                process.stdout.write(`OK: ${step.name}\n`);
                allResults.push({ api, name: step.name, ok: true });
            } catch {
                process.stderr.write(`FAIL: ${step.name}\n`);
                allResults.push({ api, name: step.name, ok: false });
            }
        }
    }

    process.stdout.write(`\n--- summary ---\n`);
    for (const r of allResults) {
        process.stdout.write(`  ${r.ok ? "OK" : "FAIL"}: ${r.api}/${r.name}\n`);
    }
    process.stdout.write(`Results in ${RESULTS_BASE}/\n`);

    const failed = allResults.filter((r) => !r.ok);
    if (failed.length > 0) {
        process.exit(1);
    }
}

main();
