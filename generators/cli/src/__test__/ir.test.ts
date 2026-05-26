import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readIrSummary } from "../ir.js";

/**
 * Smoke coverage for the IR boundary. The IR SDK does the heavy
 * lifting (variant typing, exhaustive deserialization) — what's worth
 * locking in here is just our wrapper's behavior: it surfaces parse
 * failures with the file path included, and it projects only the two
 * slices downstream code uses.
 *
 * `runPipeline.test.ts` and the Close end-to-end regen already cover
 * the happy-path projection against a real IR; this file pins the
 * error path so a regression in error-message format would fail loudly
 * (the irFilepath in the message is what users grep for when an
 * upstream tool emits a malformed IR).
 */
describe("readIrSummary", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "ir-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("throws when the file is missing", async () => {
        await expect(readIrSummary(path.join(tmpDir, "missing.json"))).rejects.toThrow();
    });

    it("throws on malformed JSON", async () => {
        const irPath = path.join(tmpDir, "ir.json");
        await writeFile(irPath, "{ not json");
        await expect(readIrSummary(irPath)).rejects.toThrow();
    });

    it("wraps IR-shape parse failures with the file path so users can locate the bad input", async () => {
        const irPath = path.join(tmpDir, "ir.json");
        // Valid JSON but missing every required IR field — the IR SDK
        // serializer will reject it, and we want the file path baked
        // into the surfaced message.
        await writeFile(irPath, JSON.stringify({ something: "else" }));
        await expect(readIrSummary(irPath)).rejects.toThrow(irPath);
    });
});
