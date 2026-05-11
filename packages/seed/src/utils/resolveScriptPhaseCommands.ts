import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { existsSync } from "fs";
import path from "path";

import { ScriptCommands } from "../config/api/index.js";

/**
 * Relative path (from a generator's output directory) to the verification
 * script emitted by generators that support the `--verify` post-generation
 * pipeline step. Today only the TypeScript SDK generator emits this script
 * (PR #15718); other generators will follow up via FER-9681.
 */
export const GENERATOR_VERIFY_SCRIPT_RELATIVE_PATH = ".fern/verify.sh";

/**
 * The single shell command that the seed runner executes when a fixture's
 * generated output contains `.fern/verify.sh`. This mirrors the `--verify`
 * code path on the local CLI (`VerificationStep`), so seed CI exercises the
 * exact contract the generator promises to ship to customers.
 */
const VERIFY_SCRIPT_INVOCATION = `bash ${GENERATOR_VERIFY_SCRIPT_RELATIVE_PATH}`;

/**
 * Returns true when the generator emitted `.fern/verify.sh` alongside the
 * generated SDK in the given output directory.
 */
export function generatorEmittedVerifyScript(outputDir: AbsoluteFilePath): boolean {
    return existsSync(path.join(outputDir, GENERATOR_VERIFY_SCRIPT_RELATIVE_PATH));
}

/**
 * Resolves the build/test commands a script container should execute for a
 * given fixture. When the generator emitted `.fern/verify.sh`, the runner
 * delegates the full install/build/test pipeline to that script (run during
 * the build phase) so the seed CI exercises the same contract as
 * `fern generate --local --verify` end-to-end. When `.fern/verify.sh` is
 * absent, the runner falls back to the per-phase commands declared in the
 * generator's `seed.yml` (the legacy path used by every non-TS generator
 * until FER-9681 lands).
 */
export function resolveScriptPhaseCommands({
    commands,
    phase,
    outputDir
}: {
    commands: ScriptCommands;
    phase: "build" | "test";
    outputDir: AbsoluteFilePath;
}): string[] {
    if (generatorEmittedVerifyScript(outputDir)) {
        // verify.sh runs install + build + test as one atomic pipeline, so we
        // execute it during the build phase and leave the test phase empty.
        // Splitting it across phases would either run it twice or require
        // parsing the script — both worse than the current behaviour.
        return phase === "build" ? [VERIFY_SCRIPT_INVOCATION] : [];
    }
    return getCommandsForPhase(commands, phase);
}

function getCommandsForPhase(commands: ScriptCommands, phase: "build" | "test"): string[] {
    if (Array.isArray(commands)) {
        return phase === "build" ? commands : [];
    }
    return commands[phase] ?? [];
}
