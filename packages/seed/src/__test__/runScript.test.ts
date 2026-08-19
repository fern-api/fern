import os from "os";
import { describe, expect, it } from "vitest";

import { runScript } from "../runScript.js";

describe("runScript", () => {
    it("should return nonzero exit code when an early command fails", async () => {
        const result = await runScript({
            commands: ["exit 1", "echo success"],
            workingDir: os.tmpdir(),
            doNotPipeOutput: true
        });
        expect(result.exitCode).not.toBe(0);
    });

    it("should return zero exit code when all commands succeed", async () => {
        const result = await runScript({
            commands: ["echo first", "echo second"],
            workingDir: os.tmpdir(),
            doNotPipeOutput: true
        });
        expect(result.exitCode).toBe(0);
    });

    it("should abort on undefined variable with set -u", async () => {
        const result = await runScript({
            commands: ['echo "$UNDEFINED_VAR_THAT_DOES_NOT_EXIST"'],
            workingDir: os.tmpdir(),
            doNotPipeOutput: true
        });
        expect(result.exitCode).not.toBe(0);
    });
});
