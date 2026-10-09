import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

import {
    originalGeneratorsYml,
    prepareWorkspace,
    ROUND_TRIP_FIXTURES,
    roundTripFixtures,
    runBuiltFern
} from "./harness.js";

/**
 * The full chain, with Docker: original generators.yml -> real `fern sdk migrate` -> `fern generate
 * --local --target cli` from the sdk-config.yml migrate wrote -> diff with a control generated from
 * the original generators.yml. Needs the CLI built from this branch and Docker:
 *
 *     pnpm fern:build && CLI_TARGET_ROUNDTRIP=1 pnpm --filter @fern-api/cli exec vitest --run roundTrip.docker
 *
 * Add CLI_TARGET_RECORD=1 to write the file counts into roundTrip.expected.json for review.
 */
const EXPECTED_PATH = join(ROUND_TRIP_FIXTURES, "roundTrip.expected.json");
const TIMEOUT_MS = 10 * 60 * 1000;

interface Expectations {
    generatorVersion: string;
    fixtures: Record<string, { diff: string[]; reason: string; docker?: { translated: number } }>;
}

async function readExpectations(): Promise<Expectations> {
    const parsed: Expectations = JSON.parse(await readFile(EXPECTED_PATH, "utf8"));
    return parsed;
}

function run(args: string[], fern: string, timeoutMs?: number): string {
    const result = runBuiltFern(args, fern, timeoutMs);
    expect(result.status, result.output).toBe(0);
    return result.output;
}

function differingFiles(left: string, right: string): string[] {
    const result = spawnSync("diff", ["-rq", "--no-dereference", left, right], { encoding: "utf8" });
    return result.stdout.split("\n").filter((line) => line.length > 0);
}

function record(value: unknown): Record<string, unknown> {
    return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

describe.runIf(process.env.CLI_TARGET_ROUNDTRIP === "1")("round trip (Docker)", async () => {
    const fixtures = await roundTripFixtures();
    const recording = process.env.CLI_TARGET_RECORD === "1";

    it.each(fixtures)(
        "%s: fern generate --target cli from sdk-config.yml matches the control as recorded",
        async (fixture) => {
            const folder = await mkdtemp(join(tmpdir(), `cli-target-docker-${fixture}-`));
            try {
                const control = await prepareWorkspace(fixture, join(folder, "control"));
                run(["generate", "--local", "--group", "cli", "--force"], control);

                const migrated = await prepareWorkspace(fixture, join(folder, "migrated"));
                run(["sdk", "migrate", "--group", "cli"], migrated);
                const sdkConfigBefore = await readFile(join(migrated, "sdk-config.yml"), "utf8");
                run(["generate", "--local", "--target", "cli", "--force"], migrated);
                expect(await readFile(join(migrated, "sdk-config.yml"), "utf8")).toBe(sdkConfigBefore);

                const counts = {
                    translated: differingFiles(join(folder, "control", "out"), join(folder, "migrated", "out")).length
                };
                const expectations = await readExpectations();
                if (recording) {
                    const entry = expectations.fixtures[fixture];
                    if (entry != null) {
                        expectations.fixtures[fixture] = { ...entry, docker: counts };
                        await writeFile(EXPECTED_PATH, `${JSON.stringify(expectations, null, 2)}\n`);
                    }
                    return;
                }
                expect(counts).toEqual(expectations.fixtures[fixture]?.docker);
            } finally {
                await rm(folder, { recursive: true, force: true });
            }
        },
        TIMEOUT_MS
    );

    it(
        "plain fern generate runs the cli target with the other sdk-config.yml targets",
        async () => {
            const folder = await mkdtemp(join(tmpdir(), "cli-target-docker-plain-"));
            try {
                const fern = await prepareWorkspace("query-parameters-openapi", folder);
                const original = await originalGeneratorsYml("query-parameters-openapi");
                await writeFile(
                    join(fern, "generators.yml"),
                    YAML.stringify({
                        ...original,
                        groups: {
                            ...record(original.groups),
                            "ts-sdk": {
                                generators: [
                                    {
                                        name: "fernapi/fern-typescript-sdk",
                                        version: "3.0.0",
                                        output: { location: "local-file-system", path: "../ts" }
                                    }
                                ]
                            }
                        }
                    })
                );
                run(["sdk", "migrate", "--group", "cli", "--group", "ts-sdk"], fern);
                // The typescript target may fail to pull its image; only the selection matters here.
                const plain = runBuiltFern(["generate", "--local", "--force"], fern, 300_000).output;
                expect(plain).toContain("[api]: cli");
                expect(plain).toContain("Using SDK Config v1");
                expect(plain).toMatch(/cli fernapi\/fern-cli-generator (Wrote files|Finished)/);
            } finally {
                await rm(folder, { recursive: true, force: true });
            }
        },
        TIMEOUT_MS
    );

    it(
        "a generators.yml cli group next to the sdk-config.yml cli target fails the language ownership check",
        async () => {
            const folder = await mkdtemp(join(tmpdir(), "cli-target-docker-conflict-"));
            try {
                const fern = await prepareWorkspace("query-parameters-openapi", folder);
                run(["sdk", "migrate", "--group", "cli"], fern);
                const legacy = join(fern, "generators.legacy.yml");
                const legacyDocument = record(YAML.parse(await readFile(legacy, "utf8")));
                await writeFile(
                    legacy,
                    YAML.stringify({
                        ...legacyDocument,
                        groups: record((await originalGeneratorsYml("query-parameters-openapi")).groups)
                    })
                );
                const result = runBuiltFern(
                    ["generate", "--local", "--group", "cli", "--target", "cli"],
                    fern,
                    120_000
                );
                expect(result.status).not.toBe(0);
                expect(result.output).toContain("selects language 'cli' from both");
            } finally {
                await rm(folder, { recursive: true, force: true });
            }
        },
        TIMEOUT_MS
    );
});
