import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
 * Recaptures the round-trip inputs: for each fixture, the original generators.yml and what the real
 * `fern sdk migrate --group cli` of this branch writes from it. Run after building the CLI:
 *
 *     pnpm fern:build && CLI_TARGET_CAPTURE=1 pnpm --filter @fern-api/cli exec vitest --run roundTrip.capture
 */
describe.runIf(process.env.CLI_TARGET_CAPTURE === "1")("round-trip capture", async () => {
    const fixtures = await roundTripFixtures();

    it.each(fixtures)("captures %s", async (fixture) => {
        const folder = await mkdtemp(join(tmpdir(), "cli-target-capture-"));
        try {
            const fern = await prepareWorkspace(fixture, folder);
            const migrate = runBuiltFern(["sdk", "migrate", "--group", "cli"], fern);
            expect(migrate.status, migrate.output).toBe(0);
            const target = join(ROUND_TRIP_FIXTURES, fixture);
            await mkdir(target, { recursive: true });
            await writeFile(join(target, "sdk-config.yml"), await readFile(join(fern, "sdk-config.yml"), "utf8"));
            await writeFile(
                join(target, "generators.original.yml"),
                YAML.stringify(await originalGeneratorsYml(fixture))
            );
            const warnings = migrate.output.split("\n").filter((line) => line.includes("[warning]"));
            await writeFile(join(target, "migrate-warnings.txt"), `${warnings.join("\n")}\n`);
        } finally {
            await rm(folder, { recursive: true, force: true });
        }
    });
});
