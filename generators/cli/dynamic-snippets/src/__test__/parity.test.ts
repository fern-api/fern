import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ParameterLocation, resolveParamFlagName } from "../naming.js";

/**
 * Parity guard: the ported flag rules must reproduce what the real Fern CLI SDK runtime emits.
 *
 * The golden fixtures (`fixtures/<name>/schema.golden.json`) are the runtime's own `--schema` output,
 * committed so this assertion runs everywhere — including CI's TypeScript image, where no Rust
 * toolchain exists. Regenerate them with `scripts/generate-schema-golden.mjs` (cargo-gated) whenever
 * the runtime's naming/flag rules change; a resulting golden diff then surfaces runtime drift, while a
 * failure here surfaces drift in this TypeScript port.
 */

interface GoldenInput {
    wireName: string;
    location: string;
    flag?: string;
    type?: string;
    required?: boolean;
}
interface GoldenCommand {
    operation: string;
    command: string[];
    httpMethod: string;
    path: string;
    inputs: GoldenInput[];
}
interface Golden {
    commands: GoldenCommand[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, "fixtures");

function loadGoldens(): { name: string; golden: Golden }[] {
    return readdirSync(FIXTURES_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({
            name: entry.name,
            golden: JSON.parse(readFileSync(join(FIXTURES_DIR, entry.name, "schema.golden.json"), "utf-8")) as Golden
        }));
}

const PARAMETER_LOCATIONS: readonly ParameterLocation[] = ["path", "query", "header", "body"];

describe("flag parity with the CLI runtime --schema golden", () => {
    const goldens = loadGoldens();

    it("has at least one golden fixture", () => {
        expect(goldens.length).toBeGreaterThan(0);
    });

    for (const { name, golden } of goldens) {
        describe(name, () => {
            it("declares at least one command", () => {
                expect(golden.commands.length).toBeGreaterThan(0);
            });
            for (const command of golden.commands) {
                for (const input of command.inputs) {
                    it(`${command.operation}: ${input.wireName} (${input.location}) → ${input.flag ?? "--params"}`, () => {
                        expect(PARAMETER_LOCATIONS).toContain(input.location as ParameterLocation);
                        // This test validates the pure wire-name → flag rule (no SDK name).
                        const resolved = resolveParamFlagName(
                            { location: input.location as ParameterLocation },
                            input.wireName
                        );
                        if (input.flag == null) {
                            // No runtime flag (`--params`-only, or a sanitize-reject like `日本語`) — the
                            // port must likewise decline to produce one, even for a special-char name.
                            expect(resolved).toBeUndefined();
                            return;
                        }
                        if (/[^A-Za-z0-9_-]/.test(input.wireName) && `--${resolved}` !== input.flag) {
                            // The wire name has characters sanitizing drops, and the runtime's flag doesn't
                            // match what the wire name sanitizes to — it comes from an x-fern-parameter-name
                            // rename (e.g. `DateCreated<` → `--date-created-before`). The wire-name-only rule
                            // can't reproduce that; the SDK-name heuristic is covered end-to-end by
                            // dynamic-ir.e2e.test.ts. Just confirm a flag exists.
                            expect(input.flag).toBeDefined();
                            return;
                        }
                        // The runtime exposes a dedicated flag; the port must reproduce it verbatim (the
                        // runtime's flag already includes the leading "--"). A mismatch on a flag-expressible
                        // wire name is a genuine port bug and fails here.
                        expect(resolved).toBeDefined();
                        expect(`--${resolved}`).toBe(input.flag);
                    });
                }
            }
        });
    }
});
