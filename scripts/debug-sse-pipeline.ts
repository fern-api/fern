import { execSync } from "child_process";
import { cpSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(__dirname, "..");
const TEST_DEFS = join(ROOT, "test-definitions");
const CLI = join(ROOT, "packages/cli/cli/dist/prod/cli.cjs");
const RESULTS = join(ROOT, ".local/results");
const API = "server-sent-events-openapi";

function fern(args: string): void {
    const cmd = `FERN_NO_VERSION_REDIRECTION=true node --enable-source-maps ${CLI} ${args}`;
    execSync(cmd, { cwd: TEST_DEFS, stdio: "inherit" });
}

function main(): void {
    if (!existsSync(CLI)) {
        process.stderr.write(`CLI not built. Run: pnpm fern:build\n`);
        process.exit(1);
    }

    mkdirSync(RESULTS, { recursive: true });

    const steps: Array<{ name: string; run: () => void }> = [
        {
            name: "openapi-ir",
            run: () => fern(`openapi-ir ${RESULTS}/openapi-ir.json --api ${API}`)
        },
        {
            name: "write-definition",
            run: () => {
                fern(`write-definition --api ${API}`);
                const defSrc = join(TEST_DEFS, `fern/apis/${API}/.definition`);
                const defDst = join(RESULTS, ".definition");
                if (existsSync(defSrc)) {
                    cpSync(defSrc, defDst, { recursive: true });
                } else {
                    process.stderr.write(`Warning: ${defSrc} not found after write-definition\n`);
                }
            }
        },
        {
            name: "ir",
            run: () => fern(`ir ${RESULTS}/ir.json --api ${API}`)
        }
    ];

    const results: Array<{ name: string; ok: boolean }> = [];

    for (const step of steps) {
        process.stdout.write(`\n--- ${step.name} ---\n`);
        try {
            step.run();
            process.stdout.write(`OK: ${step.name}\n`);
            results.push({ name: step.name, ok: true });
        } catch {
            process.stderr.write(`FAIL: ${step.name}\n`);
            results.push({ name: step.name, ok: false });
        }
    }

    process.stdout.write(`\n--- summary ---\n`);
    for (const r of results) {
        process.stdout.write(`  ${r.ok ? "OK" : "FAIL"}: ${r.name}\n`);
    }
    process.stdout.write(`Results in ${RESULTS}/\n`);

    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
        process.exit(1);
    }
}

main();
