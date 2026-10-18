import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import YAML from "yaml";

import { loadSdkConfigV1 } from "../../../loadSdkConfigV1.js";
import { translateCliTarget } from "../../translateCliTarget.js";
import {
    generatorsDiff,
    ROUND_TRIP_FIXTURES,
    ROUND_TRIP_GENERATOR_VERSION,
    roundTripFixtures,
    TEST_DEFINITIONS
} from "./harness.js";

const EXPECTED_PATH = join(ROUND_TRIP_FIXTURES, "roundTrip.expected.json");

interface Expectation {
    /** Fields of the original generators.yml that the translated output lacks or changes, and why. */
    diff: string[];
    reason: string;
    /** Docker round trip (roundTrip.docker.test.ts): files that differ from Fern's control. */
    docker?: { translated: number };
}

interface Expectations {
    generatorVersion: string;
    fixtures: Record<string, Expectation>;
}

async function readExpectations(): Promise<Expectations> {
    const parsed: Expectations = JSON.parse(await readFile(EXPECTED_PATH, "utf8"));
    return parsed;
}

/** Translates the captured migrate output's cli target, in a copy of the fixture's specs. */
async function translate(
    fixture: string
): Promise<{ original: Record<string, unknown>; translated: Record<string, unknown>; errors: unknown[] }> {
    const folder = await mkdtemp(join(tmpdir(), "cli-target-roundtrip-"));
    try {
        const fern = join(folder, "fern");
        await cp(join(TEST_DEFINITIONS, fixture), fern, { recursive: true });
        await rm(join(fern, "generators.yml"));
        await writeFile(
            join(fern, "sdk-config.yml"),
            await readFile(join(ROUND_TRIP_FIXTURES, fixture, "sdk-config.yml"))
        );
        const loaded = await loadSdkConfigV1(join(fern, "sdk-config.yml"));
        const result = await translateCliTarget({
            context: createMockTaskContext(),
            sdkConfig: loaded.config,
            absolutePathToConfig: loaded.absolutePath,
            outDir: fern,
            apiName: "api",
            organization: "fern"
        });
        const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === "error");
        const original: unknown = YAML.parse(
            await readFile(join(ROUND_TRIP_FIXTURES, fixture, "generators.original.yml"), "utf8")
        );
        const translated: unknown = result.generatorsYml;
        return { original: asRecord(original), translated: asRecord(translated), errors };
    } finally {
        await rm(folder, { recursive: true, force: true });
    }
}

function asRecord(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

describe("round trip (fast): migrate output translated, compared with the original generators.yml", async () => {
    const fixtures = await roundTripFixtures();
    const recording = process.env.CLI_TARGET_RECORD === "1";

    it("records the round trip at the generator version the originals pin", async () => {
        expect((await readExpectations()).generatorVersion).toBe(ROUND_TRIP_GENERATOR_VERSION);
    });

    it("has an expectation for every fixture, and none for a fixture that is gone", async () => {
        expect(Object.keys((await readExpectations()).fixtures).sort()).toEqual([...fixtures].sort());
    });

    it.each(
        fixtures
    )("%s: the translated generators.yml differs from the original only where expected", async (fixture) => {
        const { original, translated, errors } = await translate(fixture);
        expect(errors).toEqual([]);
        const actual = generatorsDiff(original, translated);
        if (recording) {
            const empty: Expectations = { generatorVersion: ROUND_TRIP_GENERATOR_VERSION, fixtures: {} };
            const expectations = await readExpectations().catch(() => empty);
            const previous = expectations.fixtures[fixture];
            expectations.fixtures[fixture] = { ...previous, diff: actual, reason: previous?.reason ?? "TODO" };
            await writeFile(EXPECTED_PATH, `${JSON.stringify(expectations, null, 2)}\n`);
            return;
        }
        expect(actual).toEqual((await readExpectations()).fixtures[fixture]?.diff);
    });
});
