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
 * The full chain, with Docker: original generators.yml -> real `fern sdk migrate` -> `fern sdk
 * rubicon` (in the folder migrate left) -> `fern generate --local` -> diff with a control generated
 * from the original. Needs the CLI built from this branch and Docker:
 *
 *     pnpm fern:build && RUBICON_ROUNDTRIP=1 pnpm --filter @fern-api/cli exec vitest --run roundTrip.docker
 *
 * Add RUBICON_RECORD=1 to write the file counts into roundTrip.expected.json for review.
 */
const EXPECTED_PATH = join(ROUND_TRIP_FIXTURES, "roundTrip.expected.json");
const TIMEOUT_MS = 10 * 60 * 1000;

interface Expectations {
    generatorVersion: string;
    fixtures: Record<string, { diff: string[]; reason: string; docker?: { rubicon: number; handEdited: number } }>;
}

async function readExpectations(): Promise<Expectations> {
    const parsed: Expectations = JSON.parse(await readFile(EXPECTED_PATH, "utf8"));
    return parsed;
}

function generate(fern: string): void {
    const result = runBuiltFern(["generate", "--local", "--group", "cli", "--force"], fern);
    expect(result.status, result.output).toBe(0);
}

function differingFiles(left: string, right: string): string[] {
    const result = spawnSync("diff", ["-rq", "--no-dereference", left, right], { encoding: "utf8" });
    return result.stdout.split("\n").filter((line) => line.length > 0);
}

/** Migrates, then runs rubicon in the folder migrate left (where generators.legacy.yml sits). */
function migrateAndTranslate(fern: string): void {
    const migrate = runBuiltFern(["sdk", "migrate", "--group", "cli"], fern);
    expect(migrate.status, migrate.output).toBe(0);
    const rubicon = runBuiltFern(["sdk", "rubicon"], fern);
    expect(rubicon.status, rubicon.output).toBe(0);
}

/** Adds back what SDK Config cannot hold: the generator config, and the auth block migrate dropped. */
async function addDroppedFields(fixture: string, fern: string): Promise<void> {
    const original = await originalGeneratorsYml(fixture);
    const path = join(fern, "generators.yml");
    const written: unknown = YAML.parse(await readFile(path, "utf8"));
    const document = record(written);
    const originalGenerator = firstGenerator(original);
    const generator = firstGenerator(document);
    if (originalGenerator?.config != null && generator != null) {
        generator.config = { ...record(generator.config), ...record(originalGenerator.config) };
    }
    const api = record(document.api);
    if (original["auth-schemes"] != null && api.auth == null) {
        document["auth-schemes"] = { ...record(document["auth-schemes"]), ...record(original["auth-schemes"]) };
        api.auth = record(original.api).auth;
        document.api = api;
    }
    await writeFile(path, YAML.stringify(document));
}

function firstGenerator(document: Record<string, unknown>): Record<string, unknown> | undefined {
    const generators = record(record(document.groups).cli).generators;
    const first: unknown = Array.isArray(generators) ? generators[0] : undefined;
    return isRecord(first) ? first : undefined;
}

/** The value itself when it is an object (so edits reach the parsed document), else a new empty object. */
function record(value: unknown): Record<string, unknown> {
    return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

describe.runIf(process.env.RUBICON_ROUNDTRIP === "1")("round trip (Docker)", async () => {
    const fixtures = await roundTripFixtures();
    const recording = process.env.RUBICON_RECORD === "1";

    it.each(fixtures)(
        "%s: rubicon output matches the control as recorded, and exactly after adding the dropped fields",
        async (fixture) => {
            const folder = await mkdtemp(join(tmpdir(), `rubicon-docker-${fixture}-`));
            try {
                const control = await prepareWorkspace(fixture, join(folder, "control"));
                generate(control);

                const translated = await prepareWorkspace(fixture, join(folder, "rubicon"));
                migrateAndTranslate(translated);
                generate(translated);

                const handEdited = await prepareWorkspace(fixture, join(folder, "hand-edited"));
                migrateAndTranslate(handEdited);
                await addDroppedFields(fixture, handEdited);
                generate(handEdited);

                const counts = {
                    rubicon: differingFiles(join(folder, "control", "out"), join(folder, "rubicon", "out")).length,
                    handEdited: differingFiles(join(folder, "control", "out"), join(folder, "hand-edited", "out"))
                        .length
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
                expect(counts.handEdited).toBe(0);
                expect(counts).toEqual(expectations.fixtures[fixture]?.docker);
            } finally {
                await rm(folder, { recursive: true, force: true });
            }
        },
        TIMEOUT_MS
    );

    it(
        "coexistence: with a second target left in sdk-config.yml, --group cli generates and plain generate passes the ownership check",
        async () => {
            const folder = await mkdtemp(join(tmpdir(), "rubicon-docker-coexist-"));
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
                const migrate = runBuiltFern(["sdk", "migrate", "--group", "cli", "--group", "ts-sdk"], fern);
                expect(migrate.status, migrate.output).toBe(0);
                const rubicon = runBuiltFern(["sdk", "rubicon"], fern);
                expect(rubicon.status, rubicon.output).toBe(0);
                const sdkConfig: unknown = YAML.parse(await readFile(join(fern, "sdk-config.yml"), "utf8"));
                expect(record(sdkConfig).targets).toEqual([expect.objectContaining({ language: "typescript" })]);

                generate(fern);
                // The ownership check runs before any generator starts, so a short run is enough.
                const plain = runBuiltFern(["generate", "--local", "--force"], fern, 120_000);
                expect(plain.output).not.toContain("selects language 'cli' from both");
                // default-group: cli selects the cli group alongside the sdk-config.yml typescript target.
                expect(plain.output).toContain("[api]: cli");
                expect(plain.output).toContain("[api]: sdk-config");
            } finally {
                await rm(folder, { recursive: true, force: true });
            }
        },
        TIMEOUT_MS
    );
});
