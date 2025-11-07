import path from "path";
import stripAnsi from "strip-ansi";

import { runFernCli } from "../../utils/runFernCli";

const FIXTURES_DIR = path.join(__dirname, "fixtures");

describe("x-fern-examples file-linking", () => {
    it("should resolve $ref to external code sample files", async () => {
        const fixturePath = path.join(FIXTURES_DIR, "x-fern-examples-file-linking");

        const { stdout, exitCode } = await runFernCli(["check"], {
            cwd: fixturePath,
            reject: false
        });

        const strippedOutput = stripAnsi(stdout).trim();

        expect(exitCode).toBe(0);
        expect(strippedOutput).not.toContain("Failed to parse x-fern-example");
        expect(strippedOutput).not.toContain("Expected string. Received object");
    }, 90_000);
});
